// user.controller.ts

import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/guards/role.decorator';
import { CreateUserDto } from './user.dto';
import { UserViewEntity } from './user.entity';
import { UserService } from './user.service';

@ApiTags('Users') // Swagger Tag
@Controller('users')
export class UserController extends BaseController<UserViewEntity, UserService> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @Post()
  @ApiOperation({ summary: '회원가입' })
  @ApiCreatedResponse({ description: '사용자 생성 성공' })
  async create(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('platform_admin', 'company_admin') // 접근 가능한 롤 설정
  @ApiOperation({ summary: '모든 사용자 조회' })
  async findAll(@Req() { company_no }: any) {
    return this.userService.findAllByCompany(company_no);
  }
}
