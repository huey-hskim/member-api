// user.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { CreateUserDto } from './user.dto';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@ApiTags('Users') // Swagger Tag
@Controller('users')
export class UserController extends BaseController<UserEntity, UserService> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @Post()
  @ApiOperation({ summary: '회원가입' })
  @ApiCreatedResponse({ description: '사용자 생성 성공' })
  async create(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }
}
