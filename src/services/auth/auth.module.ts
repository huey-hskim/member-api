// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy, JwtLogoutStrategy } from './jwt.strategy';
import { DbModule } from '../../modules/mysql/db.module';
import { UserRepository, UserShadowRepository, UserSessionRepository } from '../user/user.repository';
import { AuthController } from './auth.controller';
import { AuthUtil } from './auth.util';

@Module({
  imports: [
    PassportModule,
    JwtModule,
    DbModule,
  ],
  providers: [AuthService, JwtStrategy, JwtLogoutStrategy, UserRepository, UserShadowRepository, UserSessionRepository, AuthUtil],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
