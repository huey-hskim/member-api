// user.service.ts

import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { BaseService } from '../base/base.service';
import { UserRepository } from './user.repository';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService extends BaseService<UserEntity, UserRepository> {
  constructor(
    @Inject('MYSQL_CONNECTION') pool: Pool,
    private readonly userRepository: UserRepository,
  ) {
    super(pool, userRepository);
  }

  // 필요시 오버라이드/확장
  async findByEmail(email: string) {
    const conn = await this.pool.getConnection();
    try {
      return await this.repository.findByEmail(conn, email);
    } finally {
      conn.release();
    }
  }
}
