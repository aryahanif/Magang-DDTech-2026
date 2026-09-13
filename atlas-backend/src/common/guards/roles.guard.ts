import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // If no roles are required, allow access
    }
    const { user } = context.switchToHttp().getRequest();
    const userRole = (user?.role || '').toLowerCase();
    
    // Super Admin has universal access
    if (userRole === 'super admin' || userRole === 'admin') {
      return true;
    }

    const allowedRoles = requiredRoles.map((r: string) => r.toLowerCase());
    return allowedRoles.includes(userRole);
  }
}
