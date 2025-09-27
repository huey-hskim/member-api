// user.service.ts

import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import { BaseService } from '../base/base.service';
import { UserViewRepository, UserRepository, UserInfoRepository, UserShadowRepository } from './user.repository';
import { UserViewEntity, UserEntity } from './user.entity';
import { CreateUserDto } from './user.dto';
import { ErrorCode } from '../../constants/consts';

@Injectable()
export class UserService extends BaseService<UserViewEntity, UserViewRepository> {
  constructor(
    @Inject('MYSQL_CONNECTION') pool: Pool,
    private readonly userViewRepository: UserViewRepository,
    private readonly userRepository: UserRepository,
    private readonly userInfoRepository: UserInfoRepository,
    private readonly userShadowRepository: UserShadowRepository,
  ) {
    super(pool, userViewRepository);
  }

  // // 필요시 오버라이드/확장
  // async findById(id: string) {
  //   const conn = await this.pool.getConnection();
  //   try {
  //     return await this.repository.findById(conn, id);
  //   } finally {
  //     conn.release();
  //   }
  // }

  async createUser(dto: CreateUserDto) {
    const conn = await this.pool.getConnection();

    const {
      id,
      name,
      passwd,
    } = dto;

    try {
      await conn.beginTransaction();

      // 1. users 테이블에 사용자 기본 정보 저장
      const userResult = await this.userRepository.insert(conn, { id, status: 200 });
      if (userResult.errCode !== ErrorCode.success) {
        throw new BadRequestException(userResult.message || 'User Create Failed : USSVC049');
      }
      const userNo = userResult.insertId;

      // 2. user_infos 테이블에 사용자 상세 정보 저장
      const userInfoResult = await this.userInfoRepository.insert(conn, { user_no: userNo, name, email: id });
      if (userInfoResult.errCode !== ErrorCode.success) {
        throw new BadRequestException(userInfoResult.message || 'User Create Failed : USSVC056');
      }

      // 3. user_shadows 테이블에 사용자 비밀번호 저장
      const hash = await bcrypt.hash(passwd, 10);
      const userShadowResult = await this.userShadowRepository.insert(conn, {
        user_no: userNo,
        passwd: hash,
      });
      if (userShadowResult.errCode !== ErrorCode.success) {
        throw new BadRequestException(userShadowResult.message || 'User Create Failed : USSVC066');
      }

      await conn.commit();

      return { user_no: userNo, id, name };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

  }
}
