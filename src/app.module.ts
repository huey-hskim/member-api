// app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule} from "./modules/mysql/db.module";
import { UserModule } from './services/user/user.module';
import { AuthModule } from './services/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'], // 로컬이 우선 적용
    }),
    DbModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
