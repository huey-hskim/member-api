// user.module.ts

import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserViewRepository, UserRepository, UserInfoRepository, UserShadowRepository } from './user.repository';
import { DbModule } from '../../modules/mysql/db.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [DbModule],
  providers: [UserService, ProfileService, UserViewRepository, UserRepository, UserInfoRepository, UserShadowRepository],
  controllers: [UserController, ProfileController],
  exports: [UserService, ProfileService],
})
export class UserModule {}
