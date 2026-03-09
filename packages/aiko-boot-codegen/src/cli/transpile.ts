/**
 * Transpile Command Implementation
 * Handles the transpile command logic
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';
import { parseSourceFileFull } from '../parser.js';
import { generateJavaClass, getUtilityTypeUsages, clearUtilityTypeUsages, generateUtilityTypeClass, generateJavaFromInterface } from '../generator.js';
import { PluginRegistry } from '../plugins.js';
import { getBuiltinPlugins } from '../builtin-plugins.js';
import type { ParsedClass } from '../types.js';

export interface TranspileOptions {
  out: string;
  package: string;
  lombok: boolean;
  javaVersion: '11' | '17' | '21';
  springBoot: string;
  dryRun: boolean;
  verbose: boolean;
}

/**
 * Map source file type to Java subdirectory
 */
function getJavaSubdir(parsedClass: ParsedClass): string {
  for (const dec of parsedClass.decorators) {
    if (dec.name === 'Entity' || dec.name === 'TableName') return 'entity';
    if (dec.name === 'Mapper' || dec.name === 'Repository') return 'mapper';
    if (dec.name === 'Service') return 'service';
    if (dec.name === 'RestController') return 'controller';
  }
  // Check filename patterns for DTOs
  return 'model';
}

/**
 * Get entity info for schema generation
 */
function getEntityInfo(parsedClass: ParsedClass): { tableName: string; fields: { name: string; type: string; column: string }[] } | null {
  const entityDecorator = parsedClass.decorators.find(d => d.name === 'Entity' || d.name === 'TableName');
  if (!entityDecorator) return null;

  const tableName = entityDecorator.args.tableName || entityDecorator.args.table || 
    parsedClass.name.replace(/([A-Z])/g, '_$1').toLowerCase().slice(1);
  
  const fields = parsedClass.fields.map(f => {
    const tableField = f.decorators.find(d => d.name === 'TableField' || d.name === 'Column');
    const column = tableField?.args.column || f.name.replace(/([A-Z])/g, '_$1').toLowerCase();
    return { name: f.name, type: f.type, column };
  });

  return { tableName, fields };
}

/**
 * Transpile command handler
 */
export async function transpileCommand(source: string, options: TranspileOptions): Promise<void> {
  const startTime = Date.now();
  
  console.log('🚀 Aiko Codegen - TypeScript to Java Transpiler');
  console.log('');
  console.log(`📂 Source: ${source}`);
  console.log(`📁 Output: ${options.out}`);
  console.log(`📦 Package: ${options.package}`);
  console.log(`☕ Java: ${options.javaVersion}, Spring Boot: ${options.springBoot}`);
  console.log(`🔧 Lombok: ${options.lombok ? 'Yes' : 'No'}`);
  console.log('');

  // Find TypeScript files
  const sourceDir = path.resolve(source);
  const isFile = fs.existsSync(sourceDir) && fs.statSync(sourceDir).isFile();
  
  let files: string[];
  if (isFile) {
    files = [sourceDir];
  } else {
    const pattern = path.join(sourceDir, '**/*.ts');
    files = await glob(pattern, {
      ignore: ['**/*.spec.ts', '**/*.test.ts', '**/node_modules/**', '**/*.d.ts'],
    });
  }

  if (files.length === 0) {
    console.log('⚠️  No TypeScript files found');
    return;
  }

  console.log(`📄 Found ${files.length} TypeScript file(s)`);
  console.log('');

  // Setup plugin registry
  const pluginRegistry = new PluginRegistry();
  pluginRegistry.registerAll(getBuiltinPlugins());

  // Process each file
  const outputDir = path.resolve(options.out);
  const packageDir = path.join(outputDir, 'src', 'main', 'java', ...options.package.split('.'));
  
  let successCount = 0;
  let errorCount = 0;
  const generatedFiles: string[] = [];
  const entities: { tableName: string; fields: { name: string; type: string; column: string }[] }[] = [];
  const allParsedClasses: ParsedClass[] = [];

  // Clear utility type tracking
  clearUtilityTypeUsages();

  for (const file of files) {
    try {
      if (options.verbose) {
        console.log(`  Processing: ${path.relative(sourceDir, file)}`);
      }

      const sourceCode = fs.readFileSync(file, 'utf-8');
      const parsedFile = parseSourceFileFull(sourceCode, file);
      const classes = parsedFile.classes;
      const interfaces = parsedFile.interfaces;

      if (classes.length === 0 && interfaces.length === 0) {
        if (options.verbose) {
          console.log(`    ⏭️  No classes or interfaces found, skipping`);
        }
        continue;
      }

      // Collect all classes for utility type resolution
      allParsedClasses.push(...classes);

      // Process classes
      for (const cls of classes) {
        // Collect entity info for schema generation
        const entityInfo = getEntityInfo(cls);
        if (entityInfo) {
          entities.push(entityInfo);
        }

        const subdir = getJavaSubdir(cls);
        const subPackage = `${options.package}.${subdir}`;
        const javaCode = generateJavaClass(cls, {
          outDir: outputDir,
          packageName: subPackage,
          useLombok: options.lombok,
          javaVersion: options.javaVersion,
          springBootVersion: options.springBoot,
          pluginRegistry,
          sourceFile: file,
          allClasses: classes,
        });

        const targetDir = path.join(packageDir, subdir);
        const targetFile = path.join(targetDir, `${cls.name}.java`);

        if (options.dryRun) {
          console.log(`  📝 Would generate: ${path.relative(outputDir, targetFile)}`);
          if (options.verbose) {
            console.log('─'.repeat(60));
            console.log(javaCode);
            console.log('─'.repeat(60));
          }
        } else {
          fs.mkdirSync(targetDir, { recursive: true });
          fs.writeFileSync(targetFile, javaCode);
          generatedFiles.push(targetFile);
          
          if (options.verbose) {
            console.log(`    ✅ Generated: ${path.relative(outputDir, targetFile)}`);
          }
        }
        
        successCount++;
      }

      // Process interfaces (generate as DTO classes)
      for (const iface of interfaces) {
        // Only generate exported interfaces
        if (!iface.isExported) continue;
        
        const subPackage = `${options.package}.model`;
        const javaCode = generateJavaFromInterface(iface, {
          outDir: outputDir,
          packageName: subPackage,
          useLombok: options.lombok,
          javaVersion: options.javaVersion,
          springBootVersion: options.springBoot,
        });

        const modelDir = path.join(packageDir, 'model');
        const targetFile = path.join(modelDir, `${iface.name}.java`);

        if (options.dryRun) {
          console.log(`  📝 Would generate: ${path.relative(outputDir, targetFile)} (from interface)`);
          if (options.verbose) {
            console.log('─'.repeat(60));
            console.log(javaCode);
            console.log('─'.repeat(60));
          }
        } else {
          fs.mkdirSync(modelDir, { recursive: true });
          fs.writeFileSync(targetFile, javaCode);
          generatedFiles.push(targetFile);
          
          if (options.verbose) {
            console.log(`    ✅ Generated: ${path.relative(outputDir, targetFile)} (from interface)`);
          }
        }
        
        successCount++;
      }
    } catch (error) {
      errorCount++;
      console.error(`  ❌ Error processing ${file}:`, error instanceof Error ? error.message : error);
    }
  }

  // Generate utility type classes (Omit, Pick, Partial)
  const utilityTypes = getUtilityTypeUsages();
  if (utilityTypes.length > 0) {
    console.log('');
    console.log(`📦 Generating ${utilityTypes.length} utility type class(es)...`);
    
    for (const usage of utilityTypes) {
      // Find the base entity class
      const entityClass = allParsedClasses.find(c => c.name === usage.baseType);
      if (!entityClass) {
        console.log(`  ⚠️  Base class ${usage.baseType} not found for ${usage.original}`);
        continue;
      }
      
      const utilityClassCode = generateUtilityTypeClass(usage, entityClass, {
        outDir: outputDir,
        packageName: options.package,
        useLombok: options.lombok,
        javaVersion: options.javaVersion,
        springBootVersion: options.springBoot,
      });
      
      const modelDir = path.join(packageDir, 'model');
      const targetFile = path.join(modelDir, `${usage.generatedClassName}.java`);
      
      if (options.dryRun) {
        console.log(`  📝 Would generate: ${path.relative(outputDir, targetFile)}`);
        if (options.verbose) {
          console.log('─'.repeat(60));
          console.log(utilityClassCode);
          console.log('─'.repeat(60));
        }
      } else {
        fs.mkdirSync(modelDir, { recursive: true });
        fs.writeFileSync(targetFile, utilityClassCode);
        generatedFiles.push(targetFile);
        console.log(`  ✅ Generated: ${usage.generatedClassName}.java (from ${usage.original})`);
      }
    }
  }

  // Generate project files if not dry run
  if (!options.dryRun && successCount > 0) {
    const resourcesDir = path.join(outputDir, 'src', 'main', 'resources');
    fs.mkdirSync(resourcesDir, { recursive: true });

    // pom.xml
    const pomFile = path.join(outputDir, 'pom.xml');
    const pomContent = generatePomXml(options);
    fs.writeFileSync(pomFile, pomContent);
    console.log(`  📄 Generated: pom.xml`);

    // Application main class
    const appClassName = getAppClassName(options.package);
    const appFile = path.join(packageDir, `${appClassName}.java`);
    const appContent = generateApplicationClass(options.package, appClassName);
    fs.writeFileSync(appFile, appContent);
    console.log(`  📄 Generated: ${appClassName}.java`);

    // application.yml
    const ymlFile = path.join(resourcesDir, 'application.yml');
    const ymlContent = generateApplicationYml(options);
    fs.writeFileSync(ymlFile, ymlContent);
    console.log(`  📄 Generated: application.yml`);

    // schema.sql (if entities found)
    if (entities.length > 0) {
      const schemaFile = path.join(resourcesDir, 'schema.sql');
      const schemaContent = generateSchemaSql(entities);
      fs.writeFileSync(schemaFile, schemaContent);
      console.log(`  📄 Generated: schema.sql`);
    }
  }

  // Summary
  const duration = Date.now() - startTime;
  console.log('');
  console.log('═'.repeat(60));
  console.log(`✨ Transpilation complete in ${duration}ms`);
  console.log(`   ✅ Success: ${successCount} class(es)`);
  if (errorCount > 0) {
    console.log(`   ❌ Errors: ${errorCount}`);
  }
  if (!options.dryRun && generatedFiles.length > 0) {
    console.log(`   📁 Output: ${outputDir}`);
    console.log('');
    console.log('   To run the project:');
    console.log(`   cd ${outputDir} && mvn spring-boot:run`);
  }
}

/**
 * Get application class name from package
 */
function getAppClassName(packageName: string): string {
  const parts = packageName.split('.');
  const lastPart = parts[parts.length - 1];
  // Convert to PascalCase and add Application
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1) + 'Application';
}

/**
 * Generate Spring Boot main class
 */
function generateApplicationClass(packageName: string, className: string): string {
  return `package ${packageName};

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("${packageName}.mapper")
public class ${className} {
    public static void main(String[] args) {
        SpringApplication.run(${className}.class, args);
    }
}
`;
}

/**
 * Generate application.yml
 */
function generateApplicationYml(options: TranspileOptions): string {
  const appName = options.package.split('.').pop() || 'app';
  return `spring:
  application:
    name: ${appName}
  datasource:
    url: jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=MySQL
    driver-class-name: org.h2.Driver
    username: sa
    password:
  h2:
    console:
      enabled: true
      path: /h2-console
  sql:
    init:
      mode: always

mybatis-plus:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
  mapper-locations: classpath*:/mapper/**/*.xml

server:
  port: 8080
`;
}

/**
 * Generate schema.sql from entity info
 */
function generateSchemaSql(entities: { tableName: string; fields: { name: string; type: string; column: string }[] }[]): string {
  const lines: string[] = ['-- Auto-generated schema from TypeScript entities', ''];
  
  for (const entity of entities) {
    lines.push(`CREATE TABLE IF NOT EXISTS ${entity.tableName} (`);
    
    const fieldDefs: string[] = [];
    for (const field of entity.fields) {
      const sqlType = mapTypeToSql(field.type);
      const isPk = field.name === 'id';
      const def = isPk 
        ? `    ${field.column} ${sqlType} AUTO_INCREMENT PRIMARY KEY`
        : `    ${field.column} ${sqlType}`;
      fieldDefs.push(def);
    }
    
    lines.push(fieldDefs.join(',\n'));
    lines.push(');');
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * Map TypeScript type to SQL type
 */
function mapTypeToSql(tsType: string): string {
  const typeMap: Record<string, string> = {
    'string': 'VARCHAR(255)',
    'number': 'BIGINT',
    'boolean': 'BOOLEAN',
    'Date': 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'LocalDateTime': 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  };
  return typeMap[tsType] || 'VARCHAR(255)';
}

/**
 * Generate Maven pom.xml
 */
function generatePomXml(options: TranspileOptions): string {
  // Determine MyBatis-Plus starter based on Spring Boot version
  const isSpringBoot3 = options.springBoot.startsWith('3.');
  const mybatisStarter = isSpringBoot3 
    ? 'mybatis-plus-spring-boot3-starter'
    : 'mybatis-plus-boot-starter';
  const mybatisVersion = isSpringBoot3 ? '3.5.9' : '3.5.5';

  return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>${options.springBoot}</version>
        <relativePath/>
    </parent>

    <groupId>${options.package.split('.').slice(0, 2).join('.')}</groupId>
    <artifactId>${options.package.split('.').pop()}</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>Generated from TypeScript</name>

    <properties>
        <java.version>${options.javaVersion}</java.version>
        <mybatis-plus.version>${mybatisVersion}</mybatis-plus.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- MyBatis-Plus -->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>${mybatisStarter}</artifactId>
            <version>\${mybatis-plus.version}</version>
        </dependency>

        <!-- H2 Database for development -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- MySQL Driver (optional) -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
${options.lombok ? `
        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
` : ''}
        <!-- Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
${options.lombok ? `                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
` : ''}            </plugin>
        </plugins>
    </build>
</project>
`;
}
