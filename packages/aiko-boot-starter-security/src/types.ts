import type { User } from './entities/index.js';

export interface IAuthStrategy {
  name: string;
  authenticate(request: any): Promise<User | null>;
  validate(token: string): Promise<User | null>;
  generateToken(user: User): Promise<string>;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResult {
  user: Partial<User>;
  token: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: number;
  username: string;
  roles: string[];
}

export interface SecurityConfig {
  enabled?: boolean;
  jwt?: {
    secret?: string;
    expiresIn?: string;
  };
  cors?: {
    enabled?: boolean;
    origin?: string | string[];
    credentials?: boolean;
  };
  session?: {
    secret?: string;
    maxAge?: number;
  };
  publicPaths?: string[];
}

export const defaultSecurityConfig: SecurityConfig = {
  enabled: true,
  jwt: {
    secret: 'your-secret-key',
    expiresIn: '24h',
  },
  cors: {
    enabled: true,
    origin: '*',
    credentials: true,
  },
  session: {
    secret: 'your-session-secret',
    maxAge: 86400000,
  },
  publicPaths: ['/api/auth/login', '/api/auth/register'],
};
