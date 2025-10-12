// auth.util.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { createHash, randomBytes } from 'crypto';

import { PayloadInAccessToken, PayloadInRefreshToken } from './auth.entity';

export const PEPPER                  = process.env.PEPPER || 'skfktkfkdgk^p';

export const ACCESS_TOKEN_SECRET     = process.env.ACCESS_TOKEN_SECRET || 'sn7nsisjs!!';
export const REFRESH_TOKEN_SECRET    = process.env.REFRESH_TOKEN_SECRET || '#ndjtdp^mdlsmsrh';

export const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '1h'; // 1 hour
export const REFRESH_TOKEN_TTL= process.env.REFRESH_TOKEN_TTL || '63d'; // 60 * 60 * 24 * 63; // 63 days

@Injectable()
export class AuthUtil {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  makeRandomPasswd (len: number = 9, prefix: string = 'Mi6', encoding: BufferEncoding = 'base64url'): string {
    len = Math.min(len,20);
    return prefix+randomBytes(20).toString(encoding).substring(0, len);
  }

  makeHash4Verify (str: string): string  {
    return createHash('sha256')
      .update(str)
      .update(PEPPER)
      .digest('hex');
  }

  makeHash (str: string): string  {
    return createHash('sha256')
      .update(str)
      .update(PEPPER)
      .update(randomBytes(8).toString('base64').substring(0,8))
      .digest('hex');
  }

  makeAccessToken(payload: Partial<{ user_no: string | number, id: string, hash: string, ttl: string | number }>): string | null {
    let {
      user_no,
      hash,
      id,
      ttl,
    } = payload;

    if (!user_no || !hash) {
      return null;
    }

    const data = {
      user_no,
      hash,
      id,
    };

    const secret = ACCESS_TOKEN_SECRET;
    const expiresIn = Number.isInteger(Number(ttl)) ? Number(ttl) : ttl || ACCESS_TOKEN_TTL;

    return this.jwtService.sign(data, {
      secret,
      expiresIn,
    });
  }

  makeRefreshToken(payload: Partial<{ hash: string, ttl: string | number }>): string | null {
    let {
      hash,
      ttl,
    } = payload;

    if (!hash) {
      return null;
    }

    const data = {
      hash,
    };

    const secret = REFRESH_TOKEN_SECRET;
    const expiresIn = Number.isInteger(Number(ttl)) ? Number(ttl) : ttl || REFRESH_TOKEN_TTL;

    return this.jwtService.sign(data, {
      secret,
      expiresIn,
    });
  }

  verifyAccessToken(token: string): PayloadInAccessToken | null {
    try {
      return this.jwtService.verify(token, {
        secret: ACCESS_TOKEN_SECRET,
      }) as PayloadInAccessToken;
    } catch (err) {
      return null;
    }
  }

  verifyRefreshToken(token: string): PayloadInRefreshToken | null {
    try {
      return this.jwtService.verify(token, {
        secret: REFRESH_TOKEN_SECRET,
      }) as PayloadInRefreshToken;
    } catch (err) {
      return null;
    }
  }

  decode(token: string): any | null {
    return this.jwtService.decode(token);
  }
}