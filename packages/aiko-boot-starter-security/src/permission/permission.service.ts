import { Service, Autowired } from '@ai-partner-x/aiko-boot';
import type { User } from '../entities/index.js';

@Service()
export class PermissionService {
  private userMapper: any = null;
  private roleMapper: any = null;
  private permissionMapper: any = null;

  setMappers(userMapper: any, roleMapper: any, permissionMapper: any): void {
    this.userMapper = userMapper;
    this.roleMapper = roleMapper;
    this.permissionMapper = permissionMapper;
  }

  async hasPermission(user: User, permission: string): Promise<boolean> {
    if (!this.userMapper) return false;

    const userWithRoles = await this.userMapper.selectById(user.id);
    if (!userWithRoles || !userWithRoles.roles) return false;

    const roles = userWithRoles.roles;
    for (let i = 0; i < roles.length; i++) {
      const role = roles[i];
      if (role.permissions) {
        for (let j = 0; j < role.permissions.length; j++) {
          if (role.permissions[j].name === permission) {
            return true;
          }
        }
      }
    }

    return false;
  }

  async hasPermissions(user: User, permissions: string[]): Promise<boolean> {
    const self = this;
    const results = await Promise.all(
      permissions.map(function(p) {
        return self.hasPermission(user, p);
      })
    );
    return results.every(function(r) {
      return r;
    });
  }

  async hasAnyPermission(user: User, permissions: string[]): Promise<boolean> {
    const self = this;
    const results = await Promise.all(
      permissions.map(function(p) {
        return self.hasPermission(user, p);
      })
    );
    return results.some(function(r) {
      return r;
    });
  }

  hasRole(user: User, role: string): boolean {
    if (!user.roles) return false;
    return user.roles.some(function(r) {
      return r.name === role;
    });
  }

  hasAllRoles(user: User, roles: string[]): boolean {
    if (!user.roles) return false;
    const userRoles = user.roles.map(function(r) {
      return r.name;
    });
    return roles.every(function(role) {
      return userRoles.indexOf(role) !== -1;
    });
  }

  hasAnyRole(user: User, roles: string[]): boolean {
    if (!user.roles) return false;
    return user.roles.some(function(r) {
      return roles.indexOf(r.name) !== -1;
    });
  }
}
