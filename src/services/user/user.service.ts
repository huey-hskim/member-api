// user.service.ts

import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import { BaseService } from '../base/base.service';
import { UserRepository, UserInfoRepository, UserShadowRepository } from './user.repository';
import { UserEntity } from './user.entity';
import { CreateUserDto } from "./user.dto";

@Injectable()
export class UserService extends BaseService<UserEntity, UserRepository> {
  constructor(
    @Inject('MYSQL_CONNECTION') pool: Pool,
    private readonly userRepository: UserRepository,
  ) {
    super(pool, userRepository);
  }

  // 필요시 오버라이드/확장
  async findById(id: string) {
    const conn = await this.pool.getConnection();
    try {
      return await this.repository.findById(conn, id);
    } finally {
      conn.release();
    }
  }

  async createUser(dto: CreateUserDto) {
    const conn = await this.pool.getConnection();

    const {
      id,
      name,
      passwd,
    } = dto;

    const userInfoRepo = new UserInfoRepository();
    const userShadowRepo = new UserShadowRepository();

    try {
      await conn.beginTransaction();

      // 1. users 테이블에 사용자 기본 정보 저장
      const userResult = await this.userRepository.insert(conn, { id, status: 200 });
      const userNo = userResult.insertId;

      // 2. user_infos 테이블에 사용자 상세 정보 저장
      await userInfoRepo.insert(conn, { user_no: userNo, name, email: id });

      // 3. user_shadows 테이블에 사용자 비밀번호 저장
      const hash = await bcrypt.hash(passwd, 10);
      await userShadowRepo.insert(conn, {
        user_no: userNo,
        passwd: hash,
      });

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
