// base.repository.ts

import { QueryHelper } from '../../libs/queryHelper/queryHelper';
import { PoolConnection } from 'mysql2/promise';

export class BaseRepository<T extends object> {
  protected helper: QueryHelper;

  constructor(
    table_name: string,
    keys: string[],
    is_autoincrement_key: boolean,
    fields: string[],
    fields_ex: string[] = [],
    fields_ondupl_update: string[] = [],
    fields_soft_deleted: string[] = [],
    fields_json_convert: string[] = [],
  ) {
    this.helper = new QueryHelper({
      table_name,
      keys,
      is_autoincrement_key,
      fields,
      fields_ex,
      fields_ondupl_update,
      fields_soft_deleted,
      fields_json_convert,
    });
  }

  async findAll(conn: PoolConnection): Promise<T[]> {
    return this.helper.select(conn, {}, {}) as Promise<T[]>;
  }

  async findByNo(conn: PoolConnection, no: number): Promise<T | null> {
    return this.helper.select(conn, { no }, { firstObjOnly: true }) as Promise<T | null>;
  }

  async findByUserNo(conn: PoolConnection, user_no: number): Promise<T | null> {
    return this.helper.select(conn, { user_no }, { firstObjOnly: true }) as Promise<T | null>;
  }

  async insert(conn: PoolConnection, data: Partial<T>): Promise<any> {
    return this.helper.insert(conn, data);
  }

  async update(conn: PoolConnection, data: Partial<T>): Promise<any> {
    return this.helper.update(conn, data);
  }

  async delete(conn: PoolConnection, no: number): Promise<any> {
    return this.helper.delete(conn, { no });
  }
}
