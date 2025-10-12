// passkey.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class UserPasskeyDto {
  @ApiProperty({ example: 'HexString', description: '식별자' })
  credential_id!: string;

  @ApiProperty({ example: 'internal, usb, ble, nfc', description: '전송방법' })
  transports?: string;

  @ApiProperty({ example: 'Apple Keychain', description: '공급자'})
  aaguid?: string;

  created_at?: Date;
  updated_at?: Date;

  constructor(i: any) {
    const {
      credential_id,
      transports,
      aaguid,
      created_at,
      updated_at
    } = i;

    this.credential_id = credential_id;
    this.transports = transports;
    this.aaguid = aaguid;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
