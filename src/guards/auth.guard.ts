// auth.guard.ts

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException();
      return false;
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token,{secret:process.env.JWT_SECRET});
      request.user = decoded;
      return true;
    } catch (err) {
        console.log({err})
      return false;
    }
  }
}
