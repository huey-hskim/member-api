// profile.service.ts

import { Injectable, Inject, BadRequestException } from '@nestjs/common';

import { Pool } from 'mysql2/promise';
import * as bcrypt from 'bcrypt';

import { ErrorCode } from '../../constants/consts';

import { UserShadowRepository, UserViewRepository, UserSessionRepository } from './user.repository';

@Injectable()
export class ProfileService {
  constructor(
    @Inject('MYSQL_CONNECTION') private readonly pool: Pool,
    private readonly userViewRepository: UserViewRepository,
    private readonly userShadowRepository: UserShadowRepository,
    private readonly userSessionRepository: UserSessionRepository,
  ) {}


  async findByUserNo(user_no: number) {
    const conn = await this.pool.getConnection();
    try {
      return await this.userViewRepository.findByUserNo(conn, user_no);
    } finally {
      conn.release();
    }
  }

  async updatePassword(user_no: number, old_p_w: string, new_p_w: string) {
    const conn = await this.pool.getConnection();
    try {
      // 1. 현재 비밀번호 조회
      const userShadow = await this.userShadowRepository.findByUserNo(conn, user_no);
      if (!userShadow) {
        throw new BadRequestException('User not found : PFSVC036');
      }

      // 2. 현재 비밀번호와 입력된 비밀번호 비교
      const isMatch = await bcrypt.compare(old_p_w, userShadow.passwd);
      if (!isMatch) {
        throw new BadRequestException('Old password does not match : PFSVC042');
      }

      // 3. 새로운 비밀번호 해시 생성
      const hash = await bcrypt.hash(new_p_w, 10);

      // 4. user_shadows 테이블에 비밀번호 업데이트
      const updateResult = await this.userShadowRepository.update(conn, {
        user_no,
        passwd: hash,
        prev: userShadow.passwd
      });
      if (updateResult.errCode !== ErrorCode.success) {
        throw new BadRequestException(updateResult.message || 'Password Update Failed : PFSVC051');
      }

      // 5. 세션 삭제
      await this.userSessionRepository.deleteByUserNo(conn, user_no);

      return {
        errCode: ErrorCode.success,
        message: 'Password updated successfully',
      };
    } finally {
      conn.release();
    }
  }

}
