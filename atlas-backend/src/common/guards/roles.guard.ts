import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
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
    // Case-insensitive substring match, e.g. @Roles('admin') matches a seeded role of "Super Admin".
    const hasRole = requiredRoles.some((role) => user?.role?.toLowerCase().includes(role.toLowerCase()));
    if (!hasRole) {
      throw new ForbiddenException('Insufficient role for this action');
    }
    return true;
  }
}
