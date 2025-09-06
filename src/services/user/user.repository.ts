// user.repository.ts
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../base/base.repository';
import { UserEntity } from './user.entity';
import { PoolConnection } from "mysql2/promise";

@Injectable() // Provider 등록 가능
export class UserRepository extends BaseRepository<UserEntity> {
  constructor() {
    super(
      'users',
      ['no'],
      true,
      ['name', 'email', 'created_at', 'updated_at'],
      [],
      ['deleted_at'], // soft delete field
    );
  }

  // 필요시 커스텀 쿼리 추가 가능
  async findByEmail(conn: PoolConnection, email: string): Promise<UserEntity | null> {
    return this.helper.select(conn, { email }, { firstObjOnly: true }) as Promise<UserEntity | null>;
  }
}
