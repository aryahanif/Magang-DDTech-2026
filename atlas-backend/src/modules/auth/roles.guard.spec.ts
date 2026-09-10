import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const buildContext = (role?: string): ExecutionContext =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user: role ? { role } : undefined }) }),
      getHandler: () => {},
    }) as unknown as ExecutionContext;

  const buildGuard = (requiredRoles: string[] | undefined) => {
    const reflector = { get: jest.fn().mockReturnValue(requiredRoles) } as unknown as Reflector;
    return new RolesGuard(reflector);
  };

  it('allows access when no roles are required', () => {
    const guard = buildGuard(undefined);
    expect(guard.canActivate(buildContext('Member'))).toBe(true);
  });

  it('allows access when the user role matches (case-insensitively, substring)', () => {
    const guard = buildGuard(['admin']);
    expect(guard.canActivate(buildContext('Super Admin'))).toBe(true);
  });

  it('denies access when the user role does not match', () => {
    const guard = buildGuard(['admin']);
    expect(() => guard.canActivate(buildContext('Member'))).toThrow(ForbiddenException);
  });
});
