// user.controller.ts

import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@ApiTags('Users') // Swagger Tag
@Controller('users')
export class UserController extends BaseController<UserEntity, UserService> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  // 필요 시 사용자 전용 API 추가 가능
}
