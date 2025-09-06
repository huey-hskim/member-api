// app.module.ts

import { Module } from '@nestjs/common';
import { DbModule} from "./modules/mysql/db.module";
import { UserModule } from './services/user/user.module';

@Module({
  imports: [
    DbModule,
    UserModule,
  ],
})
export class AppModule {}
