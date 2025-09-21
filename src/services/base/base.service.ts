// base.service.ts

import { Pool, PoolConnection } from 'mysql2/promise';

export class BaseService<
  T,
  R extends {
    findAll(conn: PoolConnection): Promise<T[]>;
    findByNo(conn: PoolConnection, no: number): Promise<T | null>;
    findByUserNo(conn: PoolConnection, user_no: number): Promise<T | null>;
    insert(conn: PoolConnection, data: Partial<T>): Promise<any>;
    update(conn: PoolConnection, data: Partial<T> & { no: number }): Promise<any>;
    delete(conn: PoolConnection, no: number): Promise<any>;
  }
> {
  constructor(
    protected readonly pool: Pool,
    protected readonly repository: R,
  ) {}

  async findAll(): Promise<T[]> {
    const conn = await this.pool.getConnection();
    try {
      return await this.repository.findAll(conn);
    } finally {
      conn.release();
    }
  }

  async findByNo(no: number): Promise<T | null> {
    const conn = await this.pool.getConnection();
    try {
      return await this.repository.findByNo(conn, no);
    } finally {
      conn.release();
    }
  }

  async findByUserNo(user_no: number): Promise<T | null> {
    const conn = await this.pool.getConnection();
    try {
      return await this.repository.findByUserNo(conn, user_no);
    } finally {
      conn.release();
    }
  }

  async insert(data: Partial<T>) {
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();
      const result = await this.repository.insert(conn, data);
      await conn.commit();
      return result;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }

  async update(data: Partial<T> & { no: number }) {
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();
      const result = await this.repository.update(conn, data);
      await conn.commit();
      return result;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }

  async delete(no: number) {
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();
      const result = await this.repository.delete(conn, no);
      await conn.commit();
      return result;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }
}
