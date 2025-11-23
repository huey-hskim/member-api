// user.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserViewEntity {
  // users
  @ApiProperty({ example: 1, description: 'PK. Sequence Number' })
  user_no!: number;

  @ApiProperty({ example: '홍길동', description: '로그인아이디(이메일)' })
  id!: string;

  @ApiProperty({ example: 200, description: '상태. 100:대기, 200:정상.' })
  status!: number;

  // user_infos
  @ApiProperty({example: '홍길동', description: '이름'})
  name!: string;

  @ApiProperty({example: 'test@example.com', description: '이메일'})
  email!: string;

  @ApiProperty({ example: 'user', description: '역할 이름' })
  role?: string;

  @ApiProperty({ example: '2025-09-06T12:00:00.000Z', description: '생성일' })
  created_at?: Date | null;

  @ApiProperty({ example: '2025-09-06T12:00:00.000Z', description: '수정일' })
  updated_at?: Date | null;

  @ApiProperty({ example: null, required: false, description: '삭제일(soft delete)' })
  deleted_at?: Date | null;
}

export class UserEntity {
  @ApiProperty({ example: 1, description: 'PK. Sequence Number' })
  no!: number;

  @ApiProperty({ example: '홍길동', description: '로그인아이디(이메일)' })
  id!: string;

  @ApiProperty({ example: 'user', description: '역할 이름' })
  role?: string;

  @ApiProperty({ example: '5', description: 'roles.no' })
  role_no?: string;

  @ApiProperty({ example: null, required: false, description: '회사번호. companies.no' })
  company_no?: number;

  @ApiProperty({ example: 200, description: '상태. 100:대기, 200:정상.' })
  status!: number;

  @ApiProperty({ example: '2025-09-06T12:00:00.000Z', description: '생성일' })
  created_at?: Date | null;

  @ApiProperty({ example: '2025-09-06T12:00:00.000Z', description: '수정일' })
  updated_at?: Date | null;

  @ApiProperty({ example: null, required: false, description: '삭제일(soft delete)' })
  deleted_at?: Date | null;
}

export class UserInfoEntity {
  @ApiProperty({example: 1, description: 'FK. users.no'})
  user_no!: number;

  @ApiProperty({example: '홍길동', description: '이름'})
  name!: string;

  @ApiProperty({example: 'test@example.com', description: '이메일'})
  email!: string;

  @ApiProperty({ example: '2025-09-06T12:00:00.000Z', description: '생성일' })
  created_at?: Date | null;

  @ApiProperty({ example: '2025-09-06T12:00:00.000Z', description: '수정일' })
  updated_at?: Date | null;
}

export class UserShadowEntity {
  @ApiProperty({example: 1, description: 'FK. users.no'})
  user_no!: number;

  @ApiProperty({example: 'passwd', description: '비밀번호'})
  passwd!: string;

  @ApiProperty({example: null, required: false, description: '이전 비밀번호'})
  prev?: string | null;

  @ApiProperty({ example: '2025-09-06T12:00:00.000Z', description: '생성일' })
  created_at?: Date | null;

  @ApiProperty({ example: '2025-09-06T12:00:00.000Z', description: '수정일' })
  updated_at?: Date | null;
}

export class UserSessionEntity {
  @ApiProperty({example: 1, description: 'PK. Sequence Number'})
  no!: number;

  @ApiProperty({example: 1, description: '-FK.- users.no'})
  user_no!: number;

  @ApiProperty({example: 'hash', description: 'session hash'})
  hash!: string;

  @ApiProperty({ example: '2025-09-06T12:00:00.000Z', description: '생성일' })
  created_at?: Date | null;

  @ApiProperty({ example: '2025-09-06T12:00:00.000Z', description: '만료일' })
  expires_at?: Date | null;
}
