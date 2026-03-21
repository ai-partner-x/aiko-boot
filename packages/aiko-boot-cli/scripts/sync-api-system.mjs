import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FEATURE_FILES = [
  'src/controller/upload.controller.ts',
  'src/controller/mq.controller.ts',
  'src/controller/cache.controller.ts',
  'src/service/mq.consumer.service.ts',
  'src/service/cache.service.ts',
  'src/service/log.service.ts',
  'src/service/log.request.service.ts',
  'src/dto/mq.dto.ts',
  'src/dto/cache.dto.ts',
];

const REMOVE_DEPENDENCIES = [
  '@ai-partner-x/aiko-boot-starter-cache',
  '@ai-partner-x/aiko-boot-starter-storage',
  '@ai-partner-x/aiko-boot-starter-mq',
  '@ai-partner-x/aiko-boot-starter-log',
  'ioredis',
  'multer',
  'date-fns',
];

const REMOVE_DEV_DEPENDENCIES = ['@types/multer'];

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run') || argv.includes('-n'),
    verbose: argv.includes('--verbose') || argv.includes('-v'),
  };
}

async function syncApiSystem({ dryRun, verbose }) {
  const packageDir = path.resolve(__dirname, '..');
  const repoRoot = path.resolve(packageDir, '../..');
  const sourceApiDir = path.join(repoRoot, 'scaffold', 'packages', 'api');
  const targetApiSystemDir = path.join(packageDir, 'templates', 'api-system');

  if (!(await fs.pathExists(sourceApiDir))) {
    throw new Error(`source api directory not found: ${sourceApiDir}`);
  }

  if (dryRun) {
    // eslint-disable-next-line no-console
    console.log('[dry-run] sync api-system template');
    // eslint-disable-next-line no-console
    console.log(`[dry-run]   from: ${sourceApiDir}`);
    // eslint-disable-next-line no-console
    console.log(`[dry-run]   to:   ${targetApiSystemDir}`);
    return;
  }

  await fs.remove(targetApiSystemDir);
  await fs.copy(sourceApiDir, targetApiSystemDir, {
    filter: (src) => {
      const name = path.basename(src);
      if (name === 'node_modules') return false;
      if (name === 'dist') return false;
      if (name === '.next') return false;
      if (name.endsWith('.log')) return false;
      return true;
    },
  });

  for (const rel of FEATURE_FILES) {
    await fs.remove(path.join(targetApiSystemDir, rel));
  }

  const pkgPath = path.join(targetApiSystemDir, 'package.json');
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

  const appConfigPath = path.join(targetApiSystemDir, 'app.config.ts');
  await fs.writeFile(appConfigPath, SYSTEM_APP_CONFIG_TEMPLATE, 'utf-8');
  await ensureDataDir(targetApiSystemDir);

  const serverPath = path.join(targetApiSystemDir, 'src', 'server.ts');
  let serverCode = await fs.readFile(serverPath, 'utf-8');
  serverCode = serverCode.replace(
    "import { autoInit, getLogger } from '@ai-partner-x/aiko-boot-starter-log';\n",
    '',
  );
  serverCode = serverCode.replace('autoInit();\n', '');
  serverCode = serverCode.replace("const logger = getLogger('server');\n\n", '');
  serverCode = serverCode.replace("logger.info('Starting API server...');\n\n", '');
  serverCode = serverCode.replace(
    '  logger.info(`Loaded env file: ${envFile}`);',
    '  console.log(`Loaded env file: ${envFile}`);',
  );
  serverCode = serverCode.replace(
    '  logger.warn(`Env file not found: ${envFile}`);',
    '  console.warn(`Env file not found: ${envFile}`);',
  );
  serverCode = serverCode.replace(
    "  logger.warn('ApplicationContext not available');",
    "  console.warn('ApplicationContext not available');",
  );
  serverCode = serverCode.replace(
    "  logger.info('Security enabled: ' + context.config.get('security.enabled', true));",
    "  console.log('Security enabled: ' + context.config.get('security.enabled', true));",
  );
  serverCode = serverCode.replace(
    "  logger.error('Express app not available');",
    "  console.error('Express app not available');",
  );
  serverCode = serverCode.replace(
    "  logger.info('API Server started on port ' + port);",
    "  console.log('API Server started on port ' + port);",
  );
  await fs.writeFile(serverPath, serverCode, 'utf-8');

  const securityConfigPath = path.join(
    targetApiSystemDir,
    'src',
    'config',
    'security-auto-configuration.ts',
  );
  if (await fs.pathExists(securityConfigPath)) {
    let securityConfigCode = await fs.readFile(securityConfigPath, 'utf-8');
    securityConfigCode = securityConfigCode.replace(
      "import { getLogger } from '@ai-partner-x/aiko-boot-starter-log';\n",
      '',
    );
    securityConfigCode = securityConfigCode.replace(
      "  private logger = getLogger('security-auto-configuration');",
      `  private logger = {
    info: (...args: unknown[]) => console.log('[security-auto-configuration]', ...args),
    warn: (...args: unknown[]) => console.warn('[security-auto-configuration]', ...args),
    error: (...args: unknown[]) => console.error('[security-auto-configuration]', ...args),
  };`,
    );
    await fs.writeFile(securityConfigPath, securityConfigCode, 'utf-8');
  }

  if (verbose) {
    // eslint-disable-next-line no-console
    console.log(`synced api-system to: ${targetApiSystemDir}`);
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

const SYSTEM_APP_CONFIG_TEMPLATE = `import type { AppConfig } from '@ai-partner-x/aiko-boot';

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
  security: {
    enabled: true,
    jwt: {
      secret: process.env.JWT_SECRET || (() => {
        console.warn('Using default JWT secret in development! Please set JWT_SECRET in production.');
        return 'aiko-boot-admin-secret-2025-develop-change';
      })(),
      expiresIn: '2h',
    },
    session: {
      secret: process.env.SESSION_SECRET || (() => {
        console.warn('Using default session secret in development! Please set SESSION_SECRET in production.');
        return 'dev-only-session-secret';
      })(),
      maxAge: 86400000,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 86400000,
      },
    },
    oauth2: {
      github: {
        clientID: process.env.GITHUB_CLIENT_ID || (() => {
          console.warn('Using default GitHub client ID in development!');
          return 'your-github-client-id';
        })(),
        clientSecret: process.env.GITHUB_CLIENT_SECRET || (() => {
          console.warn('Using default GitHub client secret in development!');
          return 'your-github-client-secret';
        })(),
        callbackURL:
          process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/api/auth/github/callback',
      },
      google: {
        clientID: process.env.GOOGLE_CLIENT_ID || (() => {
          console.warn('Using default Google client ID in development!');
          return 'your-google-client-id';
        })(),
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || (() => {
          console.warn('Using default Google client secret in development!');
          return 'your-google-client-secret';
        })(),
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
      },
    },
    publicPaths: [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/api/auth/current',
      '/api/auth/info',
      '/api/auth/github',
      '/api/auth/google',
      '/api/auth/github/callback',
      '/api/auth/google/callback',
      '/api/public',
    ],
    cors: {
      enabled: true,
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    },
  },
} satisfies AppConfig;
`;

const { dryRun, verbose } = parseArgs(process.argv.slice(2));
syncApiSystem({ dryRun, verbose }).catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
