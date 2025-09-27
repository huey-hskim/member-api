// profile.service.ts

import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { BaseService } from '../base/base.service';
import { UserViewRepository } from './user.repository';
import { UserViewEntity } from './user.entity';

@Injectable()
export class ProfileService extends BaseService<UserViewEntity, UserViewRepository> {
  constructor(
    @Inject('MYSQL_CONNECTION') pool: Pool,
    private readonly userViewRepository: UserViewRepository,
  ) {
    super(pool, userViewRepository);
  }

}
