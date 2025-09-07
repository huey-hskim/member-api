import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ example: 1, description: 'PK. Sequence Number' })
  no!: number;

  @ApiProperty({ example: '홍길동', description: '이름' })
  name!: string;

  @ApiProperty({ example: 'test@example.com', description: '이메일' })
  email!: string;

  @ApiProperty({ example: '2025-09-06T12:00:00.000Z', description: '생성일' })
  created_at?: Date | null;

  @ApiProperty({ example: '2025-09-06T12:00:00.000Z', description: '수정일' })
  updated_at?: Date | null;

  @ApiProperty({ example: null, required: false, description: '삭제일(soft delete)' })
  deleted_at?: Date | null;
}
