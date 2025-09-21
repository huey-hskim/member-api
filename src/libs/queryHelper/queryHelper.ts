// queryHelper.ts
import { PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { ErrorCode } from '../../constants/consts';

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
  errCode: number;
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
    let output: QueryResult = {
      errCode: ErrorCode.unknown,
      totalCnt: 0,
    };

    if (Number(page) > 1) {
      return output;
    }

    const params: any[] = [];

    let table_name = this.table_name;
    let fieldQuery = ' count(*) as total_cnt';
    let whereQuery = '';

    if (whereCustomQueryOnly) {
      whereQuery = whereCustomQuery ?? '';
      whereCustomParams?.length && params.push(...whereCustomParams);
    } else {
      for (const [k, v] of Object.entries(objValues)) {
        if (v !== undefined) {
          whereQuery += `and ${k} = ? `;
          params.push(v);
        }
      }
      if (whereCustomQuery) {
        whereQuery += whereCustomQuery;
        whereCustomParams?.length && params.push(...whereCustomParams);
      }
    }

    if (!includeDeleted && this.fields_soft_deleted.length) {
      whereQuery += `and ${this.fields_soft_deleted[0]} is null `;
    }

    whereQuery = whereQuery.replace(/^\s*and/, '');

    const sql = `
        SELECT  ${fieldQuery}
        FROM    ${table_name}
        WHERE   ${whereQuery}
    `;

    const [rows] = await conn.query<RowDataPacket[]>(sql, params);
    if (!rows?.length) {
      return output;
    }

    output.errCode = ErrorCode.success;
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
      fieldsEx?: boolean;
      fieldsCustom?: string[];
      fieldsCustomOnly?: boolean;
      whereCustomQuery?: string;
      whereCustomQueryOnly?: boolean;
      whereCustomParams?: any[];
      includeDeleted?: boolean;
    } = {}
  ): Promise<any> {
    const params: any[] = [];

    let table_name = this.table_name;
    let fieldQuery = '';
    let whereQuery = '';
    const orderQuery = orderBy ? `ORDER BY ${orderBy}` : '';
    const limitQuery = limit ? `LIMIT ${(page - 1) * limit}, ${limit}` : '';

    const fieldsSet: (string[] | undefined)[] = [];

    if (fieldsCustomOnly) {
      if (!fieldsCustom) {
        return [];
      }

      fieldsSet.push(fieldsCustom);
    } else {
      fieldsSet.push(this.keys, this.fields);

      fieldsCustom?.length && fieldsSet.push(fieldsCustom);
      fieldsEx && this.fields_ex.length && fieldsSet.push(this.fields_ex);
    }

    for (const l of fieldsSet) {
      if (!l) continue;

      for (const i of l) {
        fieldQuery += `, ${i}`;
      }
    }

    if (whereCustomQueryOnly) {
      whereQuery = whereCustomQuery ?? '';
      whereCustomParams?.length && params.push(...whereCustomParams);
    } else {
      for (const [k, v] of Object.entries(objValues)) {
        if (v !== undefined) {
          whereQuery += `and ${k} = ? `;
          params.push(v);
        }
      }

      if (whereCustomQuery) {
        whereQuery += whereCustomQuery;
        whereCustomParams?.length && params.push(...whereCustomParams);
      }
    }

    if (!includeDeleted && this.fields_soft_deleted.length) {
      whereQuery += `and ${this.fields_soft_deleted[0]} is null `;
    }

    fieldQuery = fieldQuery.replace(/^,/, '');
    whereQuery = whereQuery.replace(/^\s*and/, '');

    const sql = `
        SELECT  ${fieldQuery}
        FROM    ${table_name}
        WHERE   ${whereQuery}
        ${orderQuery}
        ${limitQuery}
    `;

    const [rows] = await conn.query<RowDataPacket[]>(sql, params);
    if (!rows?.length) {
      return firstObjOnly ? null : [];
    }

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
    let output: QueryResult = {
      errCode: ErrorCode.unknown,
      insertId: null,
    };

    const params: any[] = [];

    let table_name = this.table_name;
    let fieldQuery = '';
    let valueQuery = '';
    let onDuplUpdateQuery = '';

    for (const f of this.fields_json_convert) {
      if (objValues[f] !== undefined && typeof objValues[f] === 'string') {
        objValues[f] = JSON.stringify(objValues[f].split(','));
      }
    }

    for (const l of [this.keys, this.fields, this.fields_ex]) {
      for (const i of l) {
        if (objValues[i] !== undefined) {
          // ! 직접 입력 값 허용할지.. 나중에 필요하면 넣기.
          // if (typeof objValues[i] === 'string' && objValues[i].charAt(0) === '!') {
          //   valueQuery += `, ${objValues[i].substring(1)}`;
          // } else {
          // }
          fieldQuery += `, ${i}`;
          valueQuery += ', ?';
          params.push(objValues[i]);
        }
      }
    }

    fieldQuery = fieldQuery.replace(/^,/, '');
    valueQuery = valueQuery.replace(/^,/, '');

    if (!fieldQuery) {
      output.errCode = ErrorCode.Common.invalidParameter;
      output.message = ErrorCode.Common._message.invalidParameter;

      return output;
    }

    for (let i of this.fields_ondupl_update) {
      if (objValues[i] !== undefined) {
        if (typeof objValues[i] === 'string' && objValues[i].charAt(0) === '!') {
          onDuplUpdateQuery += `, ${i} = ${objValues[i].substring(1)}`;   // TODO: 인젝션 위험 있음.
        } else {
          onDuplUpdateQuery += `, ${i} = ?`;
          params.push(objValues[i])
        }
      } else if (i === 'updated_at') {
        onDuplUpdateQuery += `, updated_at = now()`;
      } else if (i.charAt(0) === '+') {
        // TODO: ++col 형태는 안되는데, 넣으면 어떻게 동작할지..
        onDuplUpdateQuery += `, ${i.substring(1)} = ${i.substring(1)} +1 `;
      }
    }

    onDuplUpdateQuery = onDuplUpdateQuery.replace(/^,/, '');

    try {
      const sql = `
          INSERT INTO ${table_name} (
              ${fieldQuery}
          ) VALUES (
              ${valueQuery}
          )
          ${onDuplUpdateQuery ? 'ON DUPLICATE KEY UPDATE' : ''}
            ${onDuplUpdateQuery}
      `;

      const [result] = await conn.query<ResultSetHeader>(sql, params);
      if (!result // 결과 없으면 오류
        // 유효타가 1이면 정상, 2는 업데이트가 있을때만
        || (result.affectedRows !== 1 && (onDuplUpdateQuery && result.affectedRows !== 2))
        // 자동증가 키라면 insertId가 있어야 함.
        || (this.is_autoincrement_key && !result.insertId)) {
        return output;
      }

      output.errCode = ErrorCode.success;
      output.insertId = result.insertId;
    } catch (e: any) {
      if(e && e.sqlState === '23000') {
        output.errCode = ErrorCode.Database.idDuplicated;
        output.message = ErrorCode.Database._message.idDuplicated;
      } else {
        output.errCode = ErrorCode.Database.unknown;
        output.message = e?.message ?? 'unknown error';
      }
    }

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
    let output: QueryResult = {
      errCode: ErrorCode.unknown,
    };

    const params: any[] = [];

    let table_name = this.table_name;
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
          // ! 직접 입력 값 허용할지.. 나중에 필요하면 넣기.
          // if (typeof objValues[i] === 'string' && objValues[i].charAt(0) === '!') {
          //   fieldQuery += `, ${i} = ${objValues[i].substring(1)}`;
          // } else {
          // }
          fieldQuery += `, ${i} = ?`;
          params.push(objValues[i]);
        }
      }
    }

    if (!fieldQuery) {
      output.errCode = ErrorCode.Common.invalidParameter;
      output.message = ErrorCode.Common._message.invalidParameter;

      return output;
    }

    if (whereCustomQueryOnly) {
      whereQuery = whereCustomQuery ?? '';
      whereCustomParams?.length && params.push(...whereCustomParams);
    } else {
      for (const i of this.keys) {
        if (objValues[i] !== undefined) {
          whereQuery += `and ${i} = ? `;
          params.push(objValues[i]);
        }
      }
      if (whereCustomQuery) {
        whereQuery += whereCustomQuery;
        whereCustomParams?.length && params.push(...whereCustomParams);
      }
    }

    if (this.fields_soft_deleted.length) {
      whereQuery += `and ${this.fields_soft_deleted[0]} is null `;
    }

    whereQuery = whereQuery.replace(/^\s*and/, '');

    const sql = `
        UPDATE  ${table_name}
        SET     updated_at = now()
                ${fieldQuery}
        WHERE   ${whereQuery}
    `;

    const [result] = await conn.query<ResultSetHeader>(sql, params);
    if (!result || (!allowMultipleAffect && result.affectedRows !== 1)) {
      return output;
    }

    output.errCode = ErrorCode.success;
    return output;
  }

  /** DELETE */
  async delete(
    conn: PoolConnection,
    objValues: Record<string, any>,
    {
      updateCustomObj,
      whereCustomQuery,
      whereCustomQueryOnly,
      whereCustomParams,
    }: {
      updateCustomObj?: Record<string, any>;
      whereCustomQuery?: string;
      whereCustomQueryOnly?: boolean;
      whereCustomParams?: any[];
    } = {}
  ): Promise<QueryResult> {
    let output: QueryResult = {
      errCode: ErrorCode.unknown,
    };

    const params: any[] = [];

    let table_name = this.table_name;
    let whereQuery = '';

    if (whereCustomQueryOnly) {
      whereQuery = whereCustomQuery ?? '';
      whereCustomParams?.length && params.push(...whereCustomParams);
    } else {
      for (const l of [this.keys, this.fields]) {
        for (const i of l) {
          if (objValues[i] !== undefined) {
            whereQuery += `and ${i} = ? `;
            params.push(objValues[i]);
          }
        }
      }

      if (whereCustomQuery) {
        whereQuery += whereCustomQuery;
        whereCustomParams?.length && params.push(...whereCustomParams);
      }
    }

    if (!whereQuery) {
      output.errCode = ErrorCode.Common.invalidParameter;
      output.message = ErrorCode.Common._message.invalidParameter;

      return output;
    }

    whereQuery = whereQuery.replace(/^\s*and/, '');

    let updateCustomQuery = '';
    for (let [k, v] of Object.entries(updateCustomObj || {})) {
      updateCustomQuery += `, ${k} = ? `;
      params.push(v);   // 순서 중요
    }

    try {
      let sql = '';

      if (this.fields_soft_deleted.length) {
        if (this.fields_soft_deleted.length < 2) {
          output.errCode = ErrorCode.Common.invalidParameter;
          output.message = ErrorCode.Common._message.invalidParameter;
          return output;
        }

        sql = `
            UPDATE  ${table_name}
            SET     ${this.fields_soft_deleted[0]} = ${this.fields_soft_deleted[1]}
                    ${updateCustomQuery}
            WHERE   ${whereQuery}
        `;
      } else {
        sql = `
            DELETE
            FROM    ${table_name}
            WHERE   ${whereQuery}
        `;
      }

      const [result] = await conn.query<ResultSetHeader>(sql, params);
      if (!result || result.affectedRows !== 1) {
        return output;
      }

      output.errCode = ErrorCode.success;
    } catch (e: any) {
      console.error(e);
    }

    return output;
  }

  /** DELETE & INSERT */
  async deleteAndInsert(
    conn: PoolConnection,
    {
      forDelete,
      forInsert,
    }: {
      forDelete: {
        objValues: Record<string, any>,
        whereCustom?: {
          whereCustomQuery: string,
          whereCustomQueryOnly: boolean,
          whereCustomParams: any[],
        }
      };
      forInsert: { objValues: Record<string, any> };
    }
  ): Promise<QueryResult> {
    let output: QueryResult = {
      errCode: ErrorCode.unknown,
      insertId: null,
    };

    try {
      output = await this.delete(conn, forDelete.objValues, forDelete.whereCustom);
      output = await this.insert(conn, forInsert.objValues);
    } catch (e) {
      console.error(e);
    }

    return output;
  }
}
