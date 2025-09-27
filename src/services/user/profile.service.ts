// profile.service.ts

import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { BaseService } from '../base/base.service';
import { UserViewRepository } from './user.repository';
import { UserViewEntity } from './user.entity';

@Injectable()
export class ProfileService {
  constructor(
    @Inject('MYSQL_CONNECTION') private readonly pool: Pool,
    private readonly userViewRepository: UserViewRepository,
  ) {}


  async findByUserNo(user_no: number) {
    const conn = await this.pool.getConnection();
    try {
      return await this.userViewRepository.findByUserNo(conn, user_no);
    } finally {
      conn.release();
    }
  }
}
