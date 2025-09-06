// db.module.ts

import { Module } from '@nestjs/common';
import { createPool } from 'mysql2/promise';

const MYSQL_CONNECTION = 'MYSQL_CONNECTION';

const {
  DB_HOST: host,
  DB_USER: user,
  DB_PASSWORD: password,
  DB_DATABASE: database,
  DB_PORT: port,
} = process.env;

const dbProvider = {
  provide: MYSQL_CONNECTION,
  useValue: createPool({
    host,
    user,
    password,
    database,
    port: Number(port),
  }),
};

@Module({
  providers: [dbProvider],
  exports: [dbProvider],
})
export class DbModule {}
