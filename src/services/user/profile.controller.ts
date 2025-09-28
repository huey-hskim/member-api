// profile.controller.ts

import {
  Controller,
  Request,
  Body,
  Get,
  Put,
  Patch,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiCreatedResponse, ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UserInfoEntity } from './user.entity';
import { ProfileService } from './profile.service';
import { PasswdChangeDto } from '../auth/auth.dto';
import { BaseResDto } from '../base/base.dto';
import { ErrorCode } from '../../constants/consts';

@ApiTags('Profile') // Swagger Tag
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '프로필 조회' })
  @ApiCreatedResponse({ description: '프로필 조회 성공' })
  async select(@Request() req : any) {
    const {
      user_no
    } = req.user || {};

    if (!user_no) {
      throw new UnauthorizedException('No user_no in token');
    }

    return this.profileService.findByUserNo(req.user.user_no);
  }

  @Patch()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '프로필 수정' })
  @ApiResponse({ status: 200, description: '프로필 수정 성공' })
  async update(@Request() req: any, @Body() body: Partial<UserInfoEntity>): Promise<BaseResDto> {
    const {
      user_no,
    } = req.user || {};

    if (!user_no) {
      throw new UnauthorizedException('No user_no in token');
    }

    const result = await this.profileService.update({ ...body, user_no });
    if (result?.errCode !== ErrorCode.success) {
      throw new BadRequestException(result?.message || 'Profile update failed');
    }

    return {
      code: 200,
      message: 'success',
    };
  }

  @Put('passwd')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiResponse({ status: 200, description: '비밀번호 변경 성공' })
  async passwd(@Request() req: any,@Body() body: PasswdChangeDto): Promise<BaseResDto> {
    const {
      old_p_w,
      new_p_w,
    } = body || {};

    if (!old_p_w || !new_p_w) {
      throw new BadRequestException('old_passwd and new_passwd are required');
    }

    const {
      user_no,
    } = req.user || {};

    const result = await this.profileService.updatePassword(user_no, old_p_w, new_p_w);
    if (result?.errCode !== ErrorCode.success) {
      throw new UnauthorizedException('Invalid credentials or password change failed');
    }

    return {
      code: 200,
      message: 'success',
    };
  }

}
