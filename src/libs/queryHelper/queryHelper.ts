import { PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

interface QueryHelperOptions {
  table_name: string;
  keys: string[];
  is_autoincrement_key: boolean;
  fields: string[];
  fields_ex: string[];
  fields_ondupl_update?: string[];
  fields_soft_deleted?: string[];
  fields_json_convert?: string[];
}

interface QueryResult {
  errCode: string;
  totalCnt?: number;
  insertId?: number | null;
  message?: string;
}

export class QueryHelper {
  private table_name: string;
  private keys: string[];
  private is_autoincrement_key: boolean;
  private fields: string[];
  private fields_ex: string[];
  private fields_ondupl_update: string[];
  private fields_soft_deleted: string[];
  private fields_json_convert: string[];

  constructor({
                table_name,
                keys,
                is_autoincrement_key,
                fields,
                fields_ex,
                fields_ondupl_update = [],
                fields_soft_deleted = [],
                fields_json_convert = [],
              }: QueryHelperOptions) {
    this.table_name = table_name;
    this.keys = keys;
    this.is_autoincrement_key = is_autoincrement_key;
    this.fields = fields;
    this.fields_ex = fields_ex;
    this.fields_ondupl_update = fields_ondupl_update;
    this.fields_soft_deleted = fields_soft_deleted;
    this.fields_json_convert = fields_json_convert;
  }

  /** COUNT */
  async total_cnt(
    conn: PoolConnection,
    objValues: Record<string, any>,
    {
      page,
      whereCustomQuery,
      whereCustomQueryOnly,
      whereCustomParams,
      includeDeleted,
    }: {
      page?: number;
      whereCustomQuery?: string;
      whereCustomQueryOnly?: boolean;
      whereCustomParams?: any[];
      includeDeleted?: boolean;
    } = {}
  ): Promise<QueryResult> {
    let output: QueryResult = { errCode: 'unknown', totalCnt: 0 };
    if (Number(page) > 1) return output;

    const params: any[] = [];
    let whereQuery = '';

    if (whereCustomQueryOnly) {
      whereQuery = whereCustomQuery ?? '';
      if (whereCustomParams?.length) params.push(...whereCustomParams);
    } else {
      for (const [k, v] of Object.entries(objValues)) {
        if (v !== undefined) {
          whereQuery += `AND ${k} = ? `;
          params.push(v);
        }
      }
      if (whereCustomQuery) {
        whereQuery += whereCustomQuery;
        if (whereCustomParams?.length) params.push(...whereCustomParams);
      }
    }

    if (!includeDeleted && this.fields_soft_deleted.length) {
      whereQuery += `AND ${this.fields_soft_deleted[0]} IS NULL `;
    }

    whereQuery = whereQuery.replace(/^\s*AND/, '');

    const sql = `
      SELECT COUNT(*) as total_cnt
      FROM ${this.table_name}
      WHERE ${whereQuery || '1=1'}
    `;

    const [rows] = await conn.query<RowDataPacket[]>(sql, params);
    if (!rows?.length) return output;

    output.errCode = 'success';
    output.totalCnt = rows[0].total_cnt as number;
    return output;
  }

  /** SELECT */
  async select(
    conn: PoolConnection,
    objValues: Record<string, any>,
    {
      page = 1,
      limit,
      orderBy,
      firstObjOnly,
      fieldsEx,
      fieldsCustom,
      fieldsCustomOnly,
      whereCustomQuery,
      whereCustomQueryOnly,
      whereCustomParams,
      includeDeleted,
    }: {
      page?: number;
      limit?: number;
      orderBy?: string;
      firstObjOnly?: boolean;
      fieldsEx?: string[];
      fieldsCustom?: string[];
      fieldsCustomOnly?: boolean;
      whereCustomQuery?: string;
      whereCustomQueryOnly?: boolean;
      whereCustomParams?: any[];
      includeDeleted?: boolean;
    } = {}
  ): Promise<any> {
    const params: any[] = [];
    let fieldQuery = '';
    let whereQuery = '';
    const orderQuery = orderBy ? `ORDER BY ${orderBy}` : '';
    const limitQuery = limit ? `LIMIT ${(page - 1) * limit}, ${limit}` : '';

    const fieldsSet: (string[] | undefined)[] = [];

    if (fieldsCustomOnly) {
      if (!fieldsCustom) return [];
      fieldsSet.push(fieldsCustom);
    } else {
      fieldsSet.push(this.keys, this.fields);
      if (fieldsCustom?.length) fieldsSet.push(fieldsCustom);
      if (fieldsEx?.length) fieldsSet.push(this.fields_ex);
    }

    for (const l of fieldsSet) {
      if (!l) continue;
      for (const i of l) fieldQuery += `, ${i}`;
    }

    if (whereCustomQueryOnly) {
      whereQuery = whereCustomQuery ?? '';
      if (whereCustomParams?.length) params.push(...whereCustomParams);
    } else {
      for (const [k, v] of Object.entries(objValues)) {
        if (v !== undefined) {
          whereQuery += `AND ${k} = ? `;
          params.push(v);
        }
      }
      if (whereCustomQuery) {
        whereQuery += whereCustomQuery;
        if (whereCustomParams?.length) params.push(...whereCustomParams);
      }
    }

    if (!includeDeleted && this.fields_soft_deleted.length) {
      whereQuery += `AND ${this.fields_soft_deleted[0]} IS NULL `;
    }

    fieldQuery = fieldQuery.replace(/^,/, '');
    whereQuery = whereQuery.replace(/^\s*AND/, '');

    const sql = `
      SELECT ${fieldQuery}
      FROM ${this.table_name}
      WHERE ${whereQuery || '1=1'}
      ${orderQuery}
      ${limitQuery}
    `;

    const [rows] = await conn.query<RowDataPacket[]>(sql, params);
    if (!rows?.length) return firstObjOnly ? null : [];

    let output: any = firstObjOnly ? rows[0] : rows;

    // JSON 변환 처리
    for (const j of this.fields_json_convert) {
      if (fieldQuery.includes(j)) {
        if (Array.isArray(output)) {
          output = output.map((i) => {
            try {
              i[j] = JSON.parse(i[j]).join(',');
            } catch {}
            return i;
          });
        } else {
          try {
            output[j] = JSON.parse(output[j]).join(',');
          } catch {}
        }
      }
    }

    return output;
  }

  /** INSERT */
  async insert(conn: PoolConnection, objValues: Record<string, any>): Promise<QueryResult> {
    let output: QueryResult = { errCode: 'unknown', insertId: null };
    const params: any[] = [];
    let fieldQuery = '';
    let valueQuery = '';

    for (const f of this.fields_json_convert) {
      if (objValues[f] !== undefined && typeof objValues[f] === 'string') {
        objValues[f] = JSON.stringify(objValues[f].split(','));
      }
    }

    for (const l of [this.keys, this.fields, this.fields_ex]) {
      for (const i of l) {
        if (objValues[i] !== undefined) {
          fieldQuery += `, ${i}`;
          valueQuery += ', ?';
          params.push(objValues[i]);
        }
      }
    }

    fieldQuery = fieldQuery.replace(/^,/, '');
    valueQuery = valueQuery.replace(/^,/, '');

    if (!fieldQuery) {
      output.errCode = 'invalidParameter';
      return output;
    }

    const sql = `
      INSERT INTO ${this.table_name} (${fieldQuery})
      VALUES (${valueQuery})
    `;

    const [result] = await conn.query<ResultSetHeader>(sql, params);
    if (!result || (this.is_autoincrement_key && !result.insertId)) return output;

    output.errCode = 'success';
    output.insertId = result.insertId;
    return output;
  }

  /** UPDATE */
  async update(
    conn: PoolConnection,
    objValues: Record<string, any>,
    {
      whereCustomQuery,
      whereCustomQueryOnly,
      whereCustomParams,
      allowMultipleAffect,
    }: {
      whereCustomQuery?: string;
      whereCustomQueryOnly?: boolean;
      whereCustomParams?: any[];
      allowMultipleAffect?: boolean;
    } = {}
  ): Promise<QueryResult> {
    let output: QueryResult = { errCode: 'unknown' };
    const params: any[] = [];
    let fieldQuery = '';
    let whereQuery = '';

    for (const f of this.fields_json_convert) {
      if (objValues[f] !== undefined && typeof objValues[f] === 'string') {
        objValues[f] = JSON.stringify(objValues[f].split(','));
      }
    }

    for (const l of [this.fields, this.fields_ex]) {
      for (const i of l) {
        if (objValues[i] !== undefined) {
          fieldQuery += `, ${i} = ?`;
          params.push(objValues[i]);
        }
      }
    }

    if (!fieldQuery) {
      output.errCode = 'invalidParameter';
      return output;
    }

    if (whereCustomQueryOnly) {
      whereQuery = whereCustomQuery ?? '';
      if (whereCustomParams?.length) params.push(...whereCustomParams);
    } else {
      for (const i of this.keys) {
        if (objValues[i] !== undefined) {
          whereQuery += `AND ${i} = ? `;
          params.push(objValues[i]);
        }
      }
      if (whereCustomQuery) {
        whereQuery += whereCustomQuery;
        if (whereCustomParams?.length) params.push(...whereCustomParams);
      }
    }

    if (this.fields_soft_deleted.length) {
      whereQuery += `AND ${this.fields_soft_deleted[0]} IS NULL `;
    }

    whereQuery = whereQuery.replace(/^\s*AND/, '');

    const sql = `
      UPDATE ${this.table_name}
      SET updated_at = NOW() ${fieldQuery}
      WHERE ${whereQuery}
    `;

    const [result] = await conn.query<ResultSetHeader>(sql, params);
    if (!result || (!allowMultipleAffect && result.affectedRows !== 1)) return output;

    output.errCode = 'success';
    return output;
  }

  /** DELETE */
  async delete(
    conn: PoolConnection,
    objValues: Record<string, any>,
    {
      whereCustomQuery,
      whereCustomQueryOnly,
      whereCustomParams,
    }: {
      whereCustomQuery?: string;
      whereCustomQueryOnly?: boolean;
      whereCustomParams?: any[];
    } = {}
  ): Promise<QueryResult> {
    let output: QueryResult = { errCode: 'unknown' };
    const params: any[] = [];
    let whereQuery = '';

    if (whereCustomQueryOnly) {
      whereQuery = whereCustomQuery ?? '';
      if (whereCustomParams?.length) params.push(...whereCustomParams);
    } else {
      for (const l of [this.keys, this.fields]) {
        for (const i of l) {
          if (objValues[i] !== undefined) {
            whereQuery += `AND ${i} = ? `;
            params.push(objValues[i]);
          }
        }
      }
      if (whereCustomQuery) {
        whereQuery += whereCustomQuery;
        if (whereCustomParams?.length) params.push(...whereCustomParams);
      }
    }

    if (!whereQuery) {
      output.errCode = 'invalidParameter';
      return output;
    }

    whereQuery = whereQuery.replace(/^\s*AND/, '');

    const sql = `
      DELETE FROM ${this.table_name}
      WHERE ${whereQuery}
    `;

    const [result] = await conn.query<ResultSetHeader>(sql, params);
    if (!result || result.affectedRows !== 1) return output;

    output.errCode = 'success';
    return output;
  }

  /** DELETE & INSERT */
  async deleteAndInsert(
    conn: PoolConnection,
    {
      forDelete,
      forInsert,
    }: {
      forDelete: { objValues: Record<string, any> };
      forInsert: { objValues: Record<string, any> };
    }
  ): Promise<QueryResult> {
    let output: QueryResult = { errCode: 'unknown', insertId: null };
    try {
      output = await this.delete(conn, forDelete.objValues);
      output = await this.insert(conn, forInsert.objValues);
    } catch (e) {
      console.error(e);
    }
    return output;
  }
}
