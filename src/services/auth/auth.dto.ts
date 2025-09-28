// auth.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { BaseResDto } from '../base/base.dto';

export class LoginDto {
  @ApiProperty({ example: 'id', description: '아이디' })
  id!: string;

  @ApiProperty({ example: 'passwd', description: '비밀번호' })
  passwd!: string;
}

export class LoginResDto extends BaseResDto {
  constructor(access_token: string, refresh_token: string) {
    super();
    this.data = { access_token, refresh_token };
  }

  @ApiProperty({ example: { access_token: '...', refresh_token: '...' }, description: '토큰 데이터' })
  override data!: { access_token: string; refresh_token: string };
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'access_token', description: '액세스 토큰' })
  access_token!: string;

  @ApiProperty({ example: 'refresh_token', description: '리프레시 토큰' })
  refresh_token!: string;
}

export class RefreshTokenResDto extends LoginResDto {}

export class LogoutResDto extends BaseResDto {}

export class PasswdChangeDto {
  @ApiProperty({ example: 'old', description: '기존 비밀번호' })
  old_p_w!: string;

  @ApiProperty({ example: 'new', description: '새 비밀번호' })
  new_p_w!: string;
}
