import 'reflect-metadata';
import { Service, Autowired } from '@ai-partner-x/aiko-boot';
import bcrypt from 'bcryptjs';
import { UserMapper } from '../mapper/user.mapper.js';
import { UserRoleMapper } from '../mapper/user-role.mapper.js';
import { RoleMapper } from '../mapper/role.mapper.js';
import { RoleMenuMapper } from '../mapper/role-menu.mapper.js';
import { MenuMapper } from '../mapper/menu.mapper.js';

import type { LoginDto, LoginResultDto } from '../dto/auth.dto.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.util.js';

@Service()
export class AuthService {
  @Autowired()
  private userMapper!: UserMapper;

  @Autowired()
  private userRoleMapper!: UserRoleMapper;

  @Autowired()
  private roleMapper!: RoleMapper;

  @Autowired()
  private roleMenuMapper!: RoleMenuMapper;

  @Autowired()
  private menuMapper!: MenuMapper;

  async login(dto: LoginDto): Promise<LoginResultDto> {
    const user = await this.userMapper.selectByUsername(dto.username);
    if (!user) {
      throw new Error('用户名或密码错误');
    }
    if (user.status === 0) throw new Error('账户已被禁用');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new Error('用户名或密码错误');

    const { roles, permissions } = await this.getUserRolesAndPermissions(user.id);

    const payload = { userId: user.id, username: user.username, roles, permissions };
    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken({ userId: user.id }),
      userInfo: { id: user.id, username: user.username, realName: user.realName,email: user.email, roles, permissions },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = verifyRefreshToken(refreshToken);
    const user = await this.userMapper.selectById(payload.userId);
    if (!user || user.status === 0) throw new Error('用户不存在或已禁用');

    const { roles, permissions } = await this.getUserRolesAndPermissions(user.id);
    const accessToken = signAccessToken({ userId: user.id, username: user.username, roles, permissions });
    return { accessToken };
  }

  async getUserInfo(userId: number): Promise<LoginResultDto['userInfo']> {
    const user = await this.userMapper.selectById(userId);
    if (!user) throw new Error('用户不存在');
    const { roles, permissions } = await this.getUserRolesAndPermissions(userId);
    const { password: _p, ...safeUser } = user as any;
    return { ...safeUser, roles, permissions };
  }

  private async getUserRolesAndPermissions(userId: number) {
    const userRoles = await this.userRoleMapper.selectList({ userId });
    if (!userRoles.length) return { roles: [], permissions: [] };

    const roleIds = userRoles.map((ur: { roleId: number }) => ur.roleId);
    const roles: string[] = [];
    const permissions: string[] = [];

    for (const roleId of roleIds) {
      const role = await this.roleMapper.selectById(roleId);
      if (role && role.status === 1) {
        roles.push(role.roleCode);
        const roleMenus = await this.roleMenuMapper.selectList({ roleId });
        for (const rm of roleMenus) {
          const menu = await this.menuMapper.selectById(rm.menuId);
          if (menu?.permission) permissions.push(menu.permission);
        }
      }
    }
    return { roles: [...new Set(roles)], permissions: [...new Set(permissions)] };
  }
}

