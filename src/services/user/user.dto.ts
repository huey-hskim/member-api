// user.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({example: 'id', description: '로그인아이디(이메일)'})
  id!: string;

  @ApiProperty({example: 'passwd', description: '비밀번호'})
  passwd!: string;

  @ApiProperty({example: 'name', description: '이름'})
  name!: string;
}
