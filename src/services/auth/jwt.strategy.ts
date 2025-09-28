// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ACCESS_TOKEN_SECRET } from './auth.util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // "Authorization: Bearer <token>"
      ignoreExpiration: false,
      secretOrKey: ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: any) {
    // payload = { user_no: users.no, hash: sessions.hash }
    const {
      user_no,
      hash,
    } = payload;

    if (!user_no || !hash) {
      return null;
    }

    return { user_no, hash };
  }
}

@Injectable()
export class JwtLogoutStrategy extends PassportStrategy(Strategy, 'jwt-logout') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // "Authorization: Bearer <token>"
      ignoreExpiration: true,   // 로그아웃시에는 토큰 만료 여부와 상관없이 처리
      secretOrKey: ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: any) {
    // payload = { user_no: users.no, hash: sessions.hash }
    const {
      user_no,
      hash,
    } = payload;

    if (!user_no || !hash) {
      return null;
    }

    return { user_no, hash };
  }
}
