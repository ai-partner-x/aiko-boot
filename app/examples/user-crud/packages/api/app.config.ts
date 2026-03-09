import type { AppConfig } from '@ai-partner-x/aiko-boot';

/**
 * Aiko Boot 配置文件 (Spring Boot 风格)
 * 
 * 配置风格参考:
 * @see https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html
 */
export default {
  // ========== Server Configuration (server.*) ==========
  server: {
    port: Number(process.env.PORT) || 3001,
    servlet: {
      contextPath: '/api',  // Spring Boot: server.servlet.context-path
    },
    shutdown: 'graceful',   // Spring Boot: server.shutdown
  },

  // ========== Logging Configuration (logging.*) ==========
  logging: {
    level: {
      root: 'debug',  // Spring Boot: logging.level.root (临时开启调试)
    },
  },

  // ========== Database Configuration (spring.datasource.*) ==========
  database: {
    type: 'sqlite',
    filename: './data/app.db',
    // PostgreSQL 配置示例:
    // type: 'postgres',
    // host: process.env.DB_HOST || 'localhost',
    // port: Number(process.env.DB_PORT) || 5432,
    // user: process.env.DB_USER || 'postgres',
    // password: process.env.DB_PASSWORD || '',
    // database: process.env.DB_NAME || 'app',
  },

  // ========== Validation Configuration ==========
  validation: {
    enabled: true,
    failFast: false,
  },
} satisfies AppConfig;
