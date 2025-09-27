// profile.controller.ts

import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiCreatedResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { UserViewEntity } from './user.entity';
import { ProfileService } from './profile.service';

@ApiTags('Profile') // Swagger Tag
@Controller('profile')
export class ProfileController extends BaseController<UserViewEntity, ProfileService> {
  constructor(private readonly profileService: ProfileService) {
    super(profileService);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: '프로필 조회' })
  @ApiCreatedResponse({ description: '프로필 조회 성공' })
  async select(@Request() req : any) {

    return this.profileService.findByUserNo(req.user.user_no);
  }
}
