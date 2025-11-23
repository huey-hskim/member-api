// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Pool, PoolConnection } from 'mysql2/promise';
import * as bcrypt from 'bcrypt';

import { UserRepository, UserShadowRepository, UserSessionRepository } from '../user/user.repository';

import { AuthUtil } from './auth.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly userShadowRepo: UserShadowRepository,
    private readonly userSessionRepo: UserSessionRepository,
    private readonly authUtil: AuthUtil,
    @Inject('MYSQL_CONNECTION') private readonly pool: Pool,
  ) {}

  async makeToken(conn: PoolConnection, user: { no: number; id?: string; role?: string, company_no?: number }, session_no: number = 0) {
    const {
      no: user_no,
      id,
      role,
      company_no,
    } = user;

    const hash = this.authUtil.makeHash(`|${user_no}|${user.id}|${(new Date()).getTime()}|`); // 변경 불가능한 값과 현재 시간을 조합

    const access_token = this.authUtil.makeAccessToken({
      user_no,
      hash,
      id,
      role,
      company_no,
    });

    const refresh_token = this.authUtil.makeRefreshToken({
      hash,
    });

    if (!access_token || !refresh_token) {
      throw new UnauthorizedException('Token generation failed');
    }

    const decodedRefresh = this.authUtil.decode(refresh_token) as any;
    const expires_at = new Date(decodedRefresh.exp * 1000);

    // 4. 세션 저장
    await this.userSessionRepo.insert(conn, {
      user_no,
      hash,
      expires_at,
    });

    // 5. 기존 세션 삭제 (session_no 가 주어진 경우)
    if (session_no) {
      await this.userSessionRepo.delete(conn, session_no);
    }

    return {
      access_token,
      refresh_token,
    }
  }

  async login(dto: { id: string; passwd: string }) {
    const conn = await this.pool.getConnection();

    try {
      // 1. 유저 조회
      const user = await this.userRepo.findById(conn, dto.id);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // 2. 비밀번호 검증
      const shadow = await this.userShadowRepo.findByUserNo(conn, user.no);
      if (!shadow) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isMatch = await bcrypt.compare(dto.passwd, shadow.passwd);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // 3. 토큰 발급 및 세션 저장
      const {
        access_token,
        refresh_token,
      } = await this.makeToken(conn, { no: user.no, id: user.id, role: user.role, company_no: user.company_no });

      return {
        access_token,
        refresh_token,
      }

    } finally {
      conn.release();
    }
  }

  async refresh(accessToken:string, refreshToken: string) {
    const conn = await this.pool.getConnection();

    try {
      // 1. refresh token verify
      let refreshPayload: any;
      try {
        refreshPayload = this.authUtil.verifyRefreshToken(refreshToken);
      } catch (err) {
        throw new UnauthorizedException('Refresh token expired or invalid');
      }

      const refresh_hash = refreshPayload?.hash;

      // 2. access token decode
      let accessPayload: any;
      try {
        accessPayload = this.authUtil.decode(accessToken);
      } catch {
        throw new UnauthorizedException('Invalid access token');
      }

      // 3. 두 토큰의 hash 일치 여부 확인
      if (!refresh_hash || accessPayload?.hash !== refresh_hash) {
        throw new UnauthorizedException('Token hash mismatch');
      }

      // 4. 세션 조회
      const session = await this.userSessionRepo.findByHash(conn, refresh_hash);
      if (!session) {
        throw new UnauthorizedException('Session not found');
      }

      // 5. 토큰 user_no 와 세션 user_no 일치 여부 확인
      if (accessPayload?.user_no !== session.user_no) {
        throw new UnauthorizedException('Token does not match session');
      }

      // 6. 새로운 토큰 발급 및 세션 저장
      const {
        access_token,
        refresh_token,
      } = await this.makeToken(conn, { no: accessPayload.user_no, id: accessPayload.id, role: accessPayload.role, company_no: accessPayload.company_no }, session.no);

      // TODO: 7. audit logging

      return {
        access_token,
        refresh_token,
      }

    } finally {
      conn.release();
    }
  }

  async logout(user: { user_no: number; hash: string }) {
    const conn = await this.pool.getConnection();

    try {
      // 1. 세션 삭제
      await this.userSessionRepo.deleteByHash(conn, user.user_no, user.hash);
    } finally {
      conn.release();
    }
  }

}
