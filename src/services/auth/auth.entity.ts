// auth.entity.ts

export class PayloadInAccessToken {
  user_no!: string;
  hash!: string;
  company_no: string = '0';
  roles: string = '||';

  constructor(user_no: number | string, hash: string, company_no?: number | string, roles?: string | string[]) {
    this.user_no = `${user_no}`;
    this.hash = hash;
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


