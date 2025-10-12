// user.repository.ts
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../base/base.repository';
import { UserViewEntity, UserEntity, UserInfoEntity, UserShadowEntity, UserSessionEntity } from './user.entity';
import { PoolConnection } from 'mysql2/promise';
import { UserPasskey } from '../auth/auth.entity';

@Injectable()
export class UserViewRepository extends BaseRepository<UserViewEntity> {
  constructor() {
    super(
      'vw_users',
      ['user_no'],
      false,
      ['id', 'status', 'name', 'email'],
      ['created_at', 'updated_at'],
      [], // on duplicate update field
      [], // soft delete field
      [], // json convert field
    );
  }

  // 필요시 커스텀 쿼리 추가 가능
  async findByEmail(conn: PoolConnection, email: string): Promise<UserViewEntity | null> {
    return this.helper.select(conn, { email }, { firstObjOnly: true }) as Promise<UserViewEntity | null>;
  }
}

@Injectable() // Provider 등록 가능
export class UserRepository extends BaseRepository<UserEntity> {
  constructor() {
    super(
      'users',
      ['no'],
      true,
      ['id', 'status'],
      ['created_at', 'updated_at', 'deleted_at'],
      [], // on duplicate update field
      ['deleted_at', 'now()'], // soft delete field
      [], // json convert field
    );
  }

  // 필요시 커스텀 쿼리 추가 가능
  async findById(conn: PoolConnection, id: string): Promise<UserEntity | null> {
    return this.helper.select(conn, { id }, { firstObjOnly: true }) as Promise<UserEntity | null>;
  }
}

@Injectable()
export class UserInfoRepository extends BaseRepository<UserInfoEntity> {
  constructor() {
    super(
      'user_infos',
      ['user_no'],
      false,
      ['name', 'email'],
      ['created_at', 'updated_at'],
      [], // on duplicate update field
      [], // soft delete field
      [], // json convert field
    );
  }

  // 필요시 커스텀 쿼리 추가 가능
  async findByEmail(conn: PoolConnection, email: string): Promise<UserEntity | null> {
    return this.helper.select(conn, { email }, { firstObjOnly: true }) as Promise<UserEntity | null>;
  }
}

@Injectable()
export class UserShadowRepository extends BaseRepository<UserShadowEntity> {
  constructor() {
    super(
      'user_shadows',
      ['user_no'],
      false,
      ['passwd'],
      ['prev', 'created_at', 'updated_at'],
      [], // on duplicate update field
      [], // soft delete field
      [], // json convert field
    );
  }
}

@Injectable()
export class UserSessionRepository extends BaseRepository<UserSessionEntity> {
  constructor() {
    super(
      'user_sessions',
      ['no'],
      true,
      ['user_no', 'hash'],
      ['created_at', 'expires_at'],
      [], // on duplicate update field
      [], // soft delete field
      [], // json convert field
    );
  }

  async findByHash(conn: PoolConnection, hash: string): Promise<UserSessionEntity | null> {

    // 만료 여부는 토큰으로.. 데이터베이스에는 참고용..
    // // 만료된 토큰은 조회하지 않음
    // const whereCustomQuery = 'expires_at > now()';
    // const whereCustomParams: any[] = [];

    return this.helper.select(conn, {
      hash,
    }, {
      firstObjOnly: true,
    }) as Promise<UserSessionEntity | null>;
  }

  async deleteByHash(conn: PoolConnection, user_no: number, hash: string): Promise<any> {
    return this.helper.delete(conn, { user_no, hash });
  }

  async deleteByUserNo(conn: PoolConnection, user_no: number): Promise<any> {
    return this.helper.delete(conn, { user_no }, { allowMultipleAffect: true } );
  }
}

@Injectable()
export class UserPasskeyRepository extends BaseRepository<any> {
  constructor() {
    super(
      'user_passkeys',
      ['no'],
      true,
      ['user_no', 'credential_id', 'transports', 'fmt', 'aaguid'],
      ['public_key', 'sign_count', 'created_at', 'updated_at'],
      ['sign_count', 'updated_at'], // on duplicate update field
      [], // soft delete field
      ['transports'], // json convert field
    );
  }

  async findAllByUserNo(conn: PoolConnection, user_no: number, fieldsCustom: string[] = []): Promise<UserPasskey[]> {
    return this.helper.select(conn, { user_no }, { fieldsCustom });
  }

  async findByCredentialId(conn: PoolConnection, credential_id: string, user_no: number): Promise<UserPasskey | null> {
    return this.helper.select(conn, { credential_id, user_no }, { firstObjOnly: true });
  }

  async findAllByUserId(conn: PoolConnection, id: string, credential_id: string | undefined = undefined): Promise<UserPasskey[]> {
    const whereCustomQuery = `and (user_no = (select no from users where id = ? and deleted_at is null and status = 200))`;
    const whereCustomParams = [`${id}`];
    const results = await this.helper.select(conn, { credential_id }, { whereCustomQuery, whereCustomParams });

    return results as UserPasskey[];
  }
}

@Injectable()
export class UserPasskeyChallengeRepository extends BaseRepository<any> {
  constructor() {
    super(
      'user_passkey_challenges',
      ['no'],
      true,
      ['user_no', 'challenge', 'hash'],
      ['created_at', 'expires_at'],
      [], // on duplicate update field
      [], // soft delete field
      [], // json convert field
    );
  }

  async findByHash(conn: PoolConnection, user_no: number, hash: string): Promise<any | null> {
    // 만료된 챌린지는 조회하지 않음
    const whereCustomQuery = 'and expires_at > now()';
    const whereCustomParams: any[] = [];

    return this.helper.select(conn, {
      user_no,
      hash,
    }, {
      fieldsCustom: ['no', 'challenge'],
      fieldsCustomOnly: true,
      firstObjOnly: true,
      whereCustomQuery,
      whereCustomParams,
    }) as Promise<any | null>;
  }
}
