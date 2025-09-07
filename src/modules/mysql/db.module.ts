// db.module.ts

import { Module } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { createPool } from 'mysql2/promise';

const MYSQL_CONNECTION = 'MYSQL_CONNECTION';

const dbProvider = {
  provide: MYSQL_CONNECTION,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    return createPool({
      host: config.get<string>('DB_HOST'),
      port: config.get<number>('DB_PORT') ?? 3306,
      user: config.get<string>('DB_USER'),
      password: config.get<string>('DB_PASSWORD'),
      database: config.get<string>('DB_DATABASE'),
    });
  },
};

@Module({
  providers: [dbProvider],
  exports: [dbProvider],
})
export class DbModule {}
