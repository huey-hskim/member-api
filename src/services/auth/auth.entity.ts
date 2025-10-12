// auth.entity.ts

import type { AuthenticatorTransport } from '@simplewebauthn/server';

export class PayloadInAccessToken {
  user_no!: string;
  hash!: string;
  id?: string;
  company_no?: string;
  roles: string = '||';

  constructor(t: {
    user_no: number;
    hash: string;
    id?: string;
    company_no?: number;
    roles?: string | string[];
  }) {
    const {
      user_no,
      hash,
      id,
      company_no,
      roles,
    } = t;

    this.user_no = `${user_no}`;
    this.hash = hash;
    if (id) this.id = id;
    if (company_no) this.company_no = `${company_no}`;
    if (roles) {
      if (roles instanceof Array) {
        this.roles = '|' + roles.join('|') + '|';
      } else {
        this.roles = '|' + roles.split('|').filter(v => v).join('|') + '|';
      }
    }
  }
}

export class PayloadInRefreshToken {
  hash!: string;

  constructor(hash: string) {
    this.hash = hash;
  }
}

export class UserPasskey {
  no: number;
  user_no: number;
  credential_id: string;
  public_key: string;
  sign_count: number;
  transports?: AuthenticatorTransport[];

  constructor(no: number, user_no: number, credential_id: string, public_key: string, sign_count: number, transports?: AuthenticatorTransport[]) {
    this.no = no;
    this.user_no = user_no;
    this.credential_id = credential_id;
    this.public_key = public_key;
    this.sign_count = sign_count;
    this.transports = transports;
  }
}
