// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { DbModule } from '../../modules/mysql/db.module';

import {
  UserRepository,
  UserShadowRepository,
  UserSessionRepository,
  UserPasskeyRepository,
  UserPasskeyChallengeRepository,
} from '../user/user.repository';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthUtil } from './auth.util';
import { JwtStrategy, JwtLogoutStrategy } from './jwt.strategy';

import { PasskeyController } from './passkey/passkey.controller';
import { PasskeyService } from './passkey/passkey.service';

@Module({
  imports: [
    PassportModule,
    JwtModule,
    DbModule,
  ],
  providers: [
    JwtStrategy,
    JwtLogoutStrategy,
    UserRepository,
    UserShadowRepository,
    UserSessionRepository,
    UserPasskeyRepository,
    UserPasskeyChallengeRepository,
    AuthService,
    AuthUtil,
    PasskeyService,
  ],
  controllers: [AuthController, PasskeyController],
  exports: [AuthService, PasskeyService],
})

export class AuthModule {}
