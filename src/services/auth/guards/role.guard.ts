// role.guard.ts

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './role.decorator';
import { PERMISSIONS_KEY } from './permission.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // JWT Payload: { role: string, permissions: string[] }
    const userRole = user.role;
    const userPermissions: string[] = user.permissions ?? [];

    // 1) super_admin 은 무조건 통과
    if (userRole === 'super_admin') {
      return true;
    }

    // 2) Role 체크
    if (requiredRoles.length > 0) {
      const hasRole = requiredRoles.includes(userRole);
      if (!hasRole) {
        throw new ForbiddenException(
          `Required roles: ${requiredRoles.join(', ')}`,
        );
      }

      if (userRole !== 'platform_admin') {
        // platform_admin 이 아니면, req에 company_no 추가.
        const company_no = user.company_no;
        if (company_no) {
          request.company_no = company_no;
        } else {
          throw new ForbiddenException(
            `User does not belong to any company.`,
          );
        }
      }
    }

    // 퍼미션은 지금 안함. 롤 베이스만...
    // // 3) Permission 체크
    // if (requiredPermissions.length > 0) {
    //   const hasPermission = requiredPermissions.every((p) =>
    //     userPermissions.includes(p),
    //   );
    //   if (!hasPermission) {
    //     throw new ForbiddenException(
    //       `Required permissions: ${requiredPermissions.join(', ')}`,
    //     );
    //   }
    // }

    return true;
  }
}