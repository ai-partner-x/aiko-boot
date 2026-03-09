import { Service, Transactional, Autowired } from '@ai-partner-x/aiko-boot';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { LocalStrategy } from './strategies/local.strategy.js';
import { SessionStrategy } from './strategies/session.strategy.js';
import type { User } from '../entities/index.js';
import type { LoginDto, LoginResult } from '../types.js';

@Service()
export class AuthService {
  @Autowired()
  private jwtStrategy!: JwtStrategy;

  @Autowired()
  private localStrategy!: LocalStrategy;

  @Autowired()
  private sessionStrategy!: SessionStrategy;

  private userService: any = null;

  setUserService(userService: any): void {
    this.userService = userService;
  }

  async login(credentials: LoginDto): Promise<LoginResult> {
    if (!this.userService) {
      throw new Error('UserService not configured');
    }

    const user = await this.userService.findByUsername(credentials.username);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await this.localStrategy.verifyPassword(
      user.password,
      credentials.password
    );

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = await this.jwtStrategy.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token: token,
      expiresIn: 86400,
    };
  }

  @Transactional()
  async register(userData: any): Promise<User> {
    if (!this.userService) {
      throw new Error('UserService not configured');
    }

    const hashedPassword = await this.localStrategy.hashPassword(userData.password);
    return this.userService.create({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
    });
  }

  async refreshToken(refreshToken: string): Promise<LoginResult> {
    const user = await this.jwtStrategy.validate(refreshToken);
    if (!user) {
      throw new Error('Invalid refresh token');
    }

    const token = await this.jwtStrategy.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token: token,
      expiresIn: 86400,
    };
  }

  private sanitizeUser(user: User): Partial<User> {
    const sanitized: any = {};
    sanitized.id = user.id;
    sanitized.username = user.username;
    sanitized.email = user.email;
    sanitized.enabled = user.enabled;
    sanitized.roles = user.roles;
    return sanitized;
  }
}
