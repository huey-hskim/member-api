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
    fields_soft_deleted: string[] = [],
  ) {
    this.helper = new QueryHelper({
      table_name,
      keys,
      is_autoincrement_key,
      fields,
      fields_ex,
      fields_soft_deleted,
    });
  }

  async findAll(conn: PoolConnection): Promise<T[]> {
    return this.helper.select(conn, {}, {}) as Promise<T[]>;
  }

  async findByNo(conn: PoolConnection, no: number): Promise<T | null> {
    return this.helper.select(conn, { no }, { firstObjOnly: true }) as Promise<T | null>;
  }

  async insert(conn: PoolConnection, data: Partial<T>): Promise<any> {
    return this.helper.insert(conn, data);
  }

  async update(conn: PoolConnection, data: Partial<T> & { no: number }): Promise<any> {
    return this.helper.update(conn, data);
  }

  async delete(conn: PoolConnection, no: number): Promise<any> {
    return this.helper.delete(conn, { no });
  }
}
