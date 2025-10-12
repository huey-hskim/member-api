// passkey.service.ts

import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Pool } from 'mysql2/promise';

import {
  generateRegistrationOptions,
  RegistrationResponseJSON,
  verifyRegistrationResponse,
  VerifyRegistrationResponseOpts,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server';
import {
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  WebAuthnCredential,
} from '@simplewebauthn/server/esm/types';

import { UserPasskeyRepository, UserPasskeyChallengeRepository } from '../../user/user.repository';
import { ErrorCode } from '../../../constants/consts';
import { AuthUtil } from '../auth.util';
import { AuthService } from '../auth.service';
import { UserPasskey } from '../auth.entity';

@Injectable()
export class PasskeyService {
  constructor(
    private readonly userPasskeyRepo: UserPasskeyRepository,
    private readonly userPasskeyChallengeRepo: UserPasskeyChallengeRepository,
    private readonly authUtil: AuthUtil,
    private readonly authService: AuthService,
    @Inject('MYSQL_CONNECTION') private readonly pool: Pool,
  ) {}

  async getPasskeys(user_no: number): Promise<UserPasskey[]> {
    const conn = await this.pool.getConnection();
    try {
      return this.userPasskeyRepo.findAllByUserNo(conn, user_no, ['created_at', 'updated_at']);
    } finally {
      conn.release();
    }
  }

  async deletePasskey(user_no: number, credential_id: string): Promise<{}> {
    const conn = await this.pool.getConnection();
    try {
      const passkey = await this.userPasskeyRepo.findByCredentialId(conn, credential_id, user_no);
      if (!passkey || passkey.user_no !== user_no) {
        throw new UnauthorizedException('Invalid passkey');
      }

      const passkey_no = passkey.no;

      const result = await this.userPasskeyRepo.delete(conn, passkey_no);
      if (result.errCode !== ErrorCode.success) {
        throw new InternalServerErrorException(result.message || `${result.errCode} | 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.`);
      }

      return {};
    } finally {
      conn.release();
    }
  }

  // WebAuthn 등록 옵션 생성
  async generateRegisterOptions(user_no: number, id: string): Promise<{ options: PublicKeyCredentialCreationOptionsJSON, nonce: string }> {
    const conn = await this.pool.getConnection();
    try {
      const rpName = process.env.WEBAUTHN_RP_NAME || 'Member Service';
      const rpID = process.env.WEBAUTHN_RP_ID || 'localhost'; // e.g. example.com
      const timeout = Number(process.env.WEBAUTHN_TIMEOUT) || 600000;

      const existingPasskeys = await this.userPasskeyRepo.findAllByUserNo(conn, user_no);
      if (existingPasskeys.length >= 5) { // 최대 5개까지 등록 허용
        throw new UnauthorizedException('Maximum number of passkeys reached');
      }
      const excludeCredentials = existingPasskeys.map(p => ({
        id: p.credential_id,
        type: 'public-key' as const,
        transports: p.transports ?? undefined,
      }));

      const userID = new TextEncoder().encode(String(user_no));

      const options = await generateRegistrationOptions({
        rpName,
        rpID,
        userID,
        userName: id,
        attestationType: 'none',
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
        timeout,
        excludeCredentials,
      });

      const nonce = this.authUtil.makeRandomPasswd(20, 'Ci1', 'hex');
      const hash = this.authUtil.makeHash4Verify(`|${user_no}|${nonce}|`);

      // store challenge to DB
      const result = await this.userPasskeyChallengeRepo.insert(conn, {
        user_no,
        challenge: options.challenge,
        hash,
        expires_at: `!DATE_ADD(NOW(), INTERVAL ${timeout/1000} second)`, // 만료시각
      });

      if (result.errCode !== ErrorCode.success) {
        throw new InternalServerErrorException(result.message || `${result.errCode} | 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.`);
      }

      return { options, nonce };

    } finally {
      conn.release();
    }
  }

  // Passkey 등록
  async registerPasskey(user_no: number, nonce: string, attestationResponse: RegistrationResponseJSON): Promise<{}> {
    const conn = await this.pool.getConnection();
    try {
      const hash = this.authUtil.makeHash4Verify(`|${user_no}|${nonce}|`);
      const existedChallenge = await this.userPasskeyChallengeRepo.findByHash(conn,
        user_no,
        hash,
      );

      if (!existedChallenge) {
        throw new UnauthorizedException('챌린지 정보가 없거나 만료되었습니다. 다시 시도해 주세요.');
      }

      const opts: VerifyRegistrationResponseOpts = {
        response: attestationResponse,
        expectedChallenge: existedChallenge.challenge,
        expectedOrigin: process.env.WEBAUTHN_ORIGIN || 'http://localhost:3001',
        expectedRPID: process.env.WEBAUTHN_RP_ID || 'localhost',
        requireUserVerification: false,
      };

      // Verify the attestation response
      const verification = await verifyRegistrationResponse(opts);

      if (!verification.verified) {
        throw new UnauthorizedException('Registration verification failed');
      }

      const {
        credential,
        fmt,
        aaguid,
      } = verification.registrationInfo || {};

      if (!credential) {
        throw new UnauthorizedException('No credential information found');
      }

      const {
        id: credential_id,
        publicKey,
        counter,
        transports,
      } = credential as WebAuthnCredential;

      const res = await this.userPasskeyRepo.insert(conn, {
        user_no,
        credential_id,
        public_key: Buffer.from(publicKey).toString('base64url'),
        sign_count: counter,
        transports: transports ? JSON.stringify(transports) : null,
        fmt,
        aaguid,
      });

      if (res.errCode !== 0) {
        throw new UnauthorizedException('Passkey 등록 실패');
      }

      // 등록이 완료되었으므로 챌린지 삭제
      await this.userPasskeyChallengeRepo.delete(conn, existedChallenge.no);

      return {};
    } finally {
      conn.release();
    }
  }

  async generateLoginOptions(id: string): Promise<{ options: PublicKeyCredentialRequestOptionsJSON, nonce: string }> {
    const conn = await this.pool.getConnection();
    try {
      // 1. 유저 조회
      const userPasskeys = await this.userPasskeyRepo.findAllByUserId(conn, id);
      if (userPasskeys.length === 0) {
        throw new UnauthorizedException('No passkeys registered for this user');
      }

      const rpID = process.env.WEBAUTHN_RP_ID || 'localhost'; // e.g. example.com
      const timeout = Number(process.env.WEBAUTHN_TIMEOUT) || 600000;

      const allowCredentials = userPasskeys.map(p => ({
        id: p.credential_id,
        type: 'public-key' as const,
        transports: p.transports ?? undefined,
      }));

      const options = await generateAuthenticationOptions({
        timeout,
        rpID,
        allowCredentials,
        userVerification: 'preferred' as const,
      });

      const user_no = userPasskeys[0].user_no;

      const nonce = this.authUtil.makeRandomPasswd(20, 'Ci2', 'hex');
      const hash = this.authUtil.makeHash4Verify(`|${user_no}|${nonce}|`);

      // store challenge to DB
      const result = await this.userPasskeyChallengeRepo.insert(conn, {
        user_no,
        challenge: options.challenge,
        hash,
        expires_at: `!DATE_ADD(NOW(), INTERVAL ${timeout/1000} second)`, // 만료시각
      });

      if (result.errCode !== ErrorCode.success) {
        throw new InternalServerErrorException(result.message || `${result.errCode} | 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.`);
      }

      return { options, nonce };

    } finally {
      conn.release();
    }
  }

  async verifyLogin(id: string, nonce: string, assertionResponse: any): Promise<{ access_token: string, refresh_token: string }> {
    const conn = await this.pool.getConnection();
    try {
      const {
        id: credential_id,
      } = assertionResponse;

      // 1. 유저 조회
      const userPasskeys = await this.userPasskeyRepo.findAllByUserId(conn, id, credential_id);
      if (userPasskeys.length === 0) {
        throw new UnauthorizedException('No passkeys registered for this user');
      }

      const credential = userPasskeys[0];

      const user_no = credential.user_no;

      const hash = this.authUtil.makeHash4Verify(`|${user_no}|${nonce}|`);
      const existedChallenge = await this.userPasskeyChallengeRepo.findByHash(conn,
        user_no,
        hash,
      );

      if (!existedChallenge) {
        throw new UnauthorizedException('챌린지 정보가 없거나 만료되었습니다. 다시 시도해 주세요.');
      }

      const opts: VerifyAuthenticationResponseOpts = {
        response: assertionResponse,
        expectedChallenge: existedChallenge.challenge,
        expectedOrigin: process.env.WEBAUTHN_ORIGIN || 'http://localhost:3001',
        expectedRPID: process.env.WEBAUTHN_RP_ID || 'localhost',
        credential: {
          id: credential.credential_id,
          publicKey: Buffer.from(credential.public_key, 'base64url'),
          counter: credential.sign_count,
        },
        requireUserVerification: false,
      };

      // Verify the assertion response
      const verification = await verifyAuthenticationResponse(opts);

      if (!verification.verified) {
        throw new UnauthorizedException('Authentication verification failed');
      }

      const { newCounter } = verification.authenticationInfo || {};
      if (newCounter > 0) {
        // 로그인 검증 후 sign_count 업데이트
        if (newCounter <= credential.sign_count) {
          throw new UnauthorizedException('Replay detected');
        }

        await this.userPasskeyRepo.update(conn, {
          no: credential.no,
          sign_count: newCounter,
        });
      }

      // 챌린지 삭제
      try {
        await this.userPasskeyChallengeRepo.delete(conn, existedChallenge.no);
      } catch (e) {
        console.error(e);
      }

      // 3. 토큰 발급 및 세션 저장
      const {
        access_token,
        refresh_token,
      } = await this.authService.makeToken(conn, { no: user_no });

      return {
        access_token,
        refresh_token,
      }

    } finally {
      conn.release();
    }
  }

} // end of PasskeyService
