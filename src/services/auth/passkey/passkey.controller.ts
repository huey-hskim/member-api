// passkey.controller.ts

import {
  Request,
  Body,
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { PasskeyService } from './passkey.service';
import { UserPasskeyDto } from './passkey.dto';

import { LoginResDto } from '../auth.dto';
import { BaseResDto, BaseResSuccessDto } from '../../base/base.dto';

@Controller('auth')
export class PasskeyController {
  constructor(private readonly passkeyService: PasskeyService) {}

  @Get('passkeys')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '패스키 목록' })
  @ApiResponse({ status: 200, description: '성공', type: BaseResSuccessDto })
  async test(@Request() req: any): Promise<BaseResDto> {
    const {
      user_no,
    } = req.user;

    const result = await this.passkeyService.getPasskeys(user_no);

    let list: UserPasskeyDto[] = [];
    if (result?.length) {
      list = result.map((item) => new UserPasskeyDto(item));
    }

    return new BaseResSuccessDto(
      list,
    );
  }

  @Delete('passkeys/:credential_id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '패스키 삭제' })
  @ApiResponse({ status: 200, description: '성공', type: BaseResSuccessDto })
  async delete(@Request() req: any): Promise<BaseResDto> {
    const {
      user_no,
    } = req.user;

    const { credential_id } = req.params;

    if (!credential_id) {
      throw new BadRequestException('credential_id is required');
    }

    const result = await this.passkeyService.deletePasskey(user_no, credential_id);

    if (!result) {
      throw new UnauthorizedException('Passkey deletion failed');
    }

    return new BaseResSuccessDto();
  }

  @Post('passkey/register/options')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '패스키 등록 옵션 생성' })
  @ApiResponse({ status: 200, description: '성공', type: BaseResSuccessDto })
  async generateRegisterOptions(@Request() req: any): Promise<BaseResDto> {
    const {
      user_no,
      id,
    } = req.user;

    const result = await this.passkeyService.generateRegisterOptions(user_no, id);
    if (!result) {
      throw new UnauthorizedException('Passkey registration failed');
    }

    return new BaseResSuccessDto(
      result,
    );
  }

  @Post('passkey/register/complete')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '패스키 등록 완료' })
  @ApiResponse({ status: 200, description: '성공', type: BaseResSuccessDto })
  async verifyRegister(@Request() req: any, @Body() body: any): Promise<BaseResDto> {
    const {
      user_no,
      id,
    } = req.user;

    const {
      nonce,
      attestationResponse,
    } = body;

    const result = await this.passkeyService.registerPasskey(user_no, nonce, attestationResponse);

    if (!result) {
      throw new UnauthorizedException('Passkey registration failed');
    }

    return new BaseResSuccessDto();
  }

  @Post('passkey/login/options')
  @ApiOperation({ summary: '패스키 로그인 옵션 생성' })
  @ApiResponse({ status: 200, description: '성공', type: BaseResSuccessDto })
  async generateLoginOptions(@Body() data: { id: string}): Promise<BaseResDto> {
    const { id } = data;
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const result = await this.passkeyService.generateLoginOptions(id);

    if (!result) {
      throw new UnauthorizedException('User not found');
    }

    return new BaseResSuccessDto(
      result,
    );
  }

  @Post('passkey/login/verify')
  @ApiOperation({ summary: '패스키 로그인 검증' })
  @ApiResponse({ status: 200, description: '성공', type: LoginResDto })
  async verifyLogin(@Body() body: any): Promise<LoginResDto> {
    const {
      id,
      nonce,
      assertionResponse,
    } = body;

    const result = await this.passkeyService.verifyLogin(id, nonce, assertionResponse);

    if (!result) {
      throw new UnauthorizedException('Passkey login failed');
    }

    return new LoginResDto(
      result.access_token,
      result.refresh_token,
    );
  }

} // end of PasskeyController
