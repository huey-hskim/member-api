// auth.util.ts
import { Injectable } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';

import { createHash, randomBytes } from 'crypto';

import { PayloadInAccessToken, PayloadInRefreshToken } from './auth.entity';

const PEPPER                  = process.env.PEPPER || 'skfktkfkdgk^p';

export const ACCESS_TOKEN_SECRET     = process.env.ACCESS_TOKEN_SECRET || 'sn7nsisjs!!';
export const REFRESH_TOKEN_SECRET    = process.env.REFRESH_TOKEN_SECRET || '#ndjtdp^mdlsmsrh';

export const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '1h'; // 1 hour
export const REFRESH_TOKEN_TTL= process.env.REFRESH_TOKEN_TTL || '63d'; // 60 * 60 * 24 * 63; // 63 days

@Injectable()
export class AuthUtil {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  makeHash (str: string): string  {
    return createHash('sha256')
      .update(str)
      .update(PEPPER)
      .update(randomBytes(8).toString('base64').substring(0,8))
      .digest('hex');
  }

  makeAccessToken(payload: Partial<{ user_no: string | number, hash: string, ttl: string | number }>): string | null {
    let {
      user_no,
      hash,
      ttl,
    } = payload;

    if (!user_no || !hash) {
      return null;
    }

    const data = {
      user_no,
      hash,
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
      const payload = this.jwtService.verify(token, {
        secret: ACCESS_TOKEN_SECRET,
      });
      return payload;
    } catch (err) {
      return null;
    }
  }

  verifyRefreshToken(token: string): PayloadInRefreshToken | null {
    try {
      const payload = this.jwtService.verify(token, {
        secret: REFRESH_TOKEN_SECRET,
      });
      return payload;
    } catch (err) {
      return null;
    }
  }

  decode(token: string): any | null {
    return this.jwtService.decode(token);
  }
}