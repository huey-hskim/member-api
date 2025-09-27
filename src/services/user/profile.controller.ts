// profile.controller.ts

import { Controller, Get, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiCreatedResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { UserViewEntity } from './user.entity';
import { ProfileService } from './profile.service';

@ApiTags('Profile') // Swagger Tag
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @ApiOperation({ summary: '프로필 조회' })
  @ApiCreatedResponse({ description: '프로필 조회 성공' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async select(@Request() req : any) {
    const {
      user_no
    } = req.user || {};

    if (!user_no) {
      throw new UnauthorizedException('No user_no in token');
    }

    return this.profileService.findByUserNo(req.user.user_no);
  }
}
