import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REMOVE_FILES = [
  'src/config/security-auto-configuration.ts',
  'src/controller/auth.controller.ts',
  'src/controller/user.controller.ts',
  'src/controller/role.controller.ts',
  'src/controller/menu.controller.ts',
  'src/service/auth.service.ts',
  'src/service/user.service.ts',
  'src/service/role.service.ts',
  'src/service/menu.service.ts',
  'src/entity/user.entity.ts',
  'src/entity/role.entity.ts',
  'src/entity/menu.entity.ts',
  'src/entity/user-role.entity.ts',
  'src/entity/role-menu.entity.ts',
  'src/mapper/user.mapper.ts',
  'src/mapper/role.mapper.ts',
  'src/mapper/menu.mapper.ts',
  'src/mapper/user-role.mapper.ts',
  'src/mapper/role-menu.mapper.ts',
  'src/dto/auth.dto.ts',
  'src/dto/user.dto.ts',
  'src/dto/role.dto.ts',
  'src/dto/menu.dto.ts',
  'src/utils/jwt.util.ts',
  'src/utils/auth.utils.js',
  'src/scripts/reset-password.ts',
  'src/scripts/reset-admin-password.mjs',
  'src/scripts/update-admin-password.mjs',
  'src/scripts/assign-role.ts',
  'src/scripts/check-user-role.ts',
  'src/scripts/user-roles.ts',
  'src/scripts/check-users.mjs',
  'src/scripts/demo-permissions.mjs',
  'src/scripts/test-permissions.mjs',
  'src/scripts/test-di.ts',
  'src/scripts/test-db.ts',
];

const REMOVE_DEPENDENCIES = [
  '@ai-partner-x/aiko-boot-starter-security',
  'bcryptjs',
  'jsonwebtoken',
];

const REMOVE_DEV_DEPENDENCIES = ['@types/bcryptjs', '@types/jsonwebtoken'];

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run') || argv.includes('-n'),
    verbose: argv.includes('--verbose') || argv.includes('-v'),
  };
}

async function syncApiClean({ dryRun, verbose }) {
  const packageDir = path.resolve(__dirname, '..');
  const sourceDir = path.join(packageDir, 'templates', 'api-system');
  const targetDir = path.join(packageDir, 'templates', 'api-clean');

  if (!(await fs.pathExists(sourceDir))) {
    throw new Error(`api-system template not found: ${sourceDir}`);
  }

  if (dryRun) {
    // eslint-disable-next-line no-console
    console.log('[dry-run] sync api-clean template');
    // eslint-disable-next-line no-console
    console.log(`[dry-run]   from: ${sourceDir}`);
    // eslint-disable-next-line no-console
    console.log(`[dry-run]   to:   ${targetDir}`);
    return;
  }

  await fs.remove(targetDir);
  await fs.copy(sourceDir, targetDir);

  for (const rel of REMOVE_FILES) {
    await fs.remove(path.join(targetDir, rel));
  }

  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  pkg.dependencies = pkg.dependencies ?? {};
  pkg.devDependencies = pkg.devDependencies ?? {};
  pkg.scripts = normalizeScripts(pkg.scripts ?? {});
  for (const dep of REMOVE_DEPENDENCIES) {
    delete pkg.dependencies[dep];
  }
  for (const dep of REMOVE_DEV_DEPENDENCIES) {
    delete pkg.devDependencies[dep];
  }
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });

  const appConfigPath = path.join(targetDir, 'app.config.ts');
  await fs.writeFile(appConfigPath, CLEAN_APP_CONFIG, 'utf-8');
  await ensureDataDir(targetDir);

  const envExamplePath = path.join(targetDir, '.env.example');
  await fs.writeFile(envExamplePath, CLEAN_ENV_EXAMPLE, 'utf-8');

  const initDbPath = path.join(targetDir, 'src', 'scripts', 'init-db.ts');
  await fs.writeFile(initDbPath, CLEAN_INIT_DB_SCRIPT, 'utf-8');

  const serverPath = path.join(targetDir, 'src', 'server.ts');
  let serverCode = await fs.readFile(serverPath, 'utf-8');
  serverCode = serverCode.replace(
    "  console.log('Security enabled: ' + context.config.get('security.enabled', true));",
    "  console.log('Application context is ready');",
  );
  await fs.writeFile(serverPath, serverCode, 'utf-8');

  if (verbose) {
    // eslint-disable-next-line no-console
    console.log(`synced api-clean to: ${targetDir}`);
  }
}

async function ensureDataDir(targetDir) {
  const dataDir = path.join(targetDir, 'data');
  await fs.ensureDir(dataDir);
  const gitkeep = path.join(dataDir, '.gitkeep');
  if (!(await fs.pathExists(gitkeep))) {
    await fs.writeFile(gitkeep, '', 'utf-8');
  }
}

function normalizeScripts(scripts) {
  const next = { ...scripts };
  delete next['dev:dev'];
  delete next['dev:stage'];
  delete next['dev:prod'];
  delete next['start:dev'];
  delete next['start:stage'];
  delete next['start:prod'];
  next.dev = next['dev:server'] ?? 'node --import @swc-node/register/esm-register --watch src/server.ts';
  next.start = 'node dist/server.js';
  return next;
}

const CLEAN_APP_CONFIG = `import type { AppConfig } from '@ai-partner-x/aiko-boot';

export default {
  server: {
    port: Number(process.env.PORT) || 3001,
    servlet: {
      contextPath: '/api',
    },
    shutdown: 'graceful',
  },
  database: {
    type: 'sqlite',
    filename: './data/app.db',
  },
  validation: {
    enabled: true,
    failFast: false,
  },
} satisfies AppConfig;
`;

const CLEAN_ENV_EXAMPLE = `NODE_ENV=production
APP_ENV=prod
PORT=3001
`;

const CLEAN_INIT_DB_SCRIPT = `/**
 * Initialize a clean database for api-clean template.
 * Run: pnpm init-db
 */
import 'reflect-metadata';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { createKyselyDatabase, getKyselyDatabase } from '@ai-partner-x/aiko-boot-starter-orm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../../data/app.db');
const dir = dirname(dbPath);

if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

await createKyselyDatabase({
  type: 'sqlite',
  filename: dbPath,
});

const db = getKyselyDatabase();
await db.schema
  .createTable('app_health')
  .ifNotExists()
  .addColumn('id', 'integer', (col: any) => col.primaryKey().autoIncrement())
  .addColumn('status', 'varchar(32)', (col: any) => col.notNull())
  .addColumn('created_at', 'datetime', (col: any) => col.notNull())
  .execute();

const exists = await db
  .selectFrom('app_health')
  .selectAll()
  .where('status', '=', 'ok')
  .executeTakeFirst();

if (!exists) {
  await db
    .insertInto('app_health')
    .values({
      status: 'ok',
      created_at: new Date().toISOString(),
    })
    .execute();
}

console.log('Database initialized at:', dbPath);
process.exit(0);
`;

const { dryRun, verbose } = parseArgs(process.argv.slice(2));
syncApiClean({ dryRun, verbose }).catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
