// user.module.ts

import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserViewRepository, UserRepository, UserInfoRepository, UserShadowRepository } from './user.repository';
import { DbModule } from '../../modules/mysql/db.module';

@Module({
  imports: [DbModule],
  providers: [UserService, UserViewRepository, UserRepository, UserInfoRepository, UserShadowRepository],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
