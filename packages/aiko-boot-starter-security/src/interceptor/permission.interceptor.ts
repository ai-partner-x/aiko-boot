import { Injectable, Singleton, Autowired } from '@ai-partner-x/aiko-boot';
import { PermissionGuard } from '../permission/guard.js';
import { SecurityContext } from '../context/security.context.js';
import { getPreAuthorizeMetadata, getSecuredMetadata } from '../permission/decorators.js';

@Injectable()
@Singleton()
export class PermissionInterceptor {
  @Autowired()
  private permissionGuard!: PermissionGuard;

  @Autowired()
  private securityContext!: SecurityContext;

  async intercept(request: any, response: any, next: any): Promise<void> {
    next();
  }

  async checkPermission(target: any, propertyKey: string, request: any): Promise<boolean> {
    const preAuthorize = getPreAuthorizeMetadata(target, propertyKey);
    const secured = getSecuredMetadata(target, propertyKey);

    const user = this.securityContext.getCurrentUser();

    if (preAuthorize) {
      return this.permissionGuard.canActivate(user, preAuthorize);
    }

    if (secured && secured.length > 0) {
      return this.permissionGuard.canActivateWithPermissions(user, secured);
    }

    return true;
  }
}
