import type { AppConfig } from '@ai-partner-x/aiko-boot';

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
