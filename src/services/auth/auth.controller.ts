// auth.controller.ts
import { Request, Body, Controller, Post, UseGuards, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LoginResDto, RefreshTokenDto, RefreshTokenResDto, LogoutResDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공', type: LoginResDto })
  async login(@Body() loginDto: LoginDto): Promise<LoginResDto> {
    // In a real application, you would validate the user credentials here
    const user = { id: loginDto.id, passwd: loginDto.passwd }; // Mock user
    const tokens = await this.authService.login(user);
    return {
      code: 200,
      message: 'success',
      data: tokens,
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공', type: RefreshTokenResDto })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResDto> {
    if (!refreshTokenDto?.access_token || !refreshTokenDto?.refresh_token) {
      throw new UnauthorizedException('Both access_token and refresh_token are required');
    }

    const tokens = await this.authService.refresh(refreshTokenDto.access_token, refreshTokenDto.refresh_token);
    return {
      code: 200,
      message: 'success',
      data: tokens,
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt-logout'))
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공', type: LogoutResDto })
  async logout(@Request() req: any): Promise<LogoutResDto> {
    const {
      user_no,
      hash,
    } = req.user || {};

    if (!user_no || !hash) {
      throw new BadRequestException('Token is not valid');
    }

    await this.authService.logout({ user_no, hash }); // 결과와 상관없이 로그아웃

    return {
      code: 200,
      message: 'success',
    };
  }

} // end of AuthController
