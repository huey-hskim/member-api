// base.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class BaseDto {
  @ApiProperty({ example: 1, description: 'PK. Sequence Number' })
  no!: number;

  @ApiProperty({ example: '2025-01-01T12:00:00Z', description: '생성일' })
  created_at!: Date;

  @ApiProperty({ example: null, description: '수정일' })
  updated_at!: Date;
}

export class BaseResDto {
  @ApiProperty({ example: 200, description: 'result code' })
  code!: number;

  @ApiProperty({ example: 'success', description: 'result message' })
  message!: string;
}

export class BaseSelectResDto<T> extends BaseResDto {
  @ApiProperty({ example: [], description: 'list' })
  list!: Array<T>;
}

export class BaseInsertResDto extends BaseResDto {
  @ApiProperty({ example: 1, description: 'inserted no' })
  Inserted!: number;
}

export class BaseUpdateResDto extends BaseResDto {
  @ApiProperty({ example: 1, description: 'affected rows' })
  affected!: number;
}

export class BaseDeleteResDto extends BaseResDto {
  @ApiProperty({ example: 1, description: 'affected rows' })
  affected!: number;
}
