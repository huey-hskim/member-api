// user.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { Pool } from 'mysql2/promise';
import { UserEntity } from './user.entity';

describe('UserService', () => {
  let service: UserService;
  let repo: jest.Mocked<UserRepository>;
  let pool: jest.Mocked<Pool>;

  beforeEach(async () => {
    // Repository mock
    repo = {
      findAll: jest.fn(),
      findByNo: jest.fn(),
      findByEmail: jest.fn(), // findByEmail 추가
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      helper: {} as any, // 필요시 커스텀 쿼리용
    } as unknown as jest.Mocked<UserRepository>;

    // Pool mock (getConnection만 흉내)
    pool = {
      getConnection: jest.fn().mockResolvedValue({
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn(),
      }),
    } as unknown as jest.Mocked<Pool>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'UserRepository' , useValue: repo },
        { provide: 'MYSQL_CONNECTION', useValue: pool },
      ],
    })
      .overrideProvider(UserService)
      .useValue(new UserService(pool, repo)) // 실제 UserService 생성
      .compile();

    service = module.get<UserService>(UserService);
    // repository를 직접 주입하지 않고, service.repository를 mock으로 교체
    (service as any).repository = repo;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers: UserEntity[] = [
        { no: 1, name: '홍길동', email: 'test@example.com', created_at: new Date(), updated_at: null },
      ];
      repo.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll();
      expect(result).toEqual(mockUsers);
      expect(repo.findAll).toHaveBeenCalled();
    });
  });

  describe('findByNo', () => {
    it('should return one user', async () => {
      const mockUser: UserEntity = { no: 1, name: '홍길동', email: 'test@example.com', created_at: new Date(), updated_at: null };
      repo.findByNo.mockResolvedValue(mockUser);

      const result = await service.findByNo(1);
      expect(result).toEqual(mockUser);
      expect(repo.findByNo).toHaveBeenCalledWith(expect.anything(), 1);
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const mockUser: UserEntity = { no: 1, name: '홍길동', email: 'test@example.com', created_at: new Date(), updated_at: null };
      repo.findByEmail = jest.fn().mockResolvedValue(mockUser);
      // pool.getConnection이 반환하는 커넥션 mock
      (pool.getConnection as jest.Mock).mockResolvedValue({
        release: jest.fn(),
      });
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(repo.findByEmail).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      repo.insert.mockResolvedValue({ errCode: 'success', insertId: 1 });

      const result = await service.insert({ name: '홍길동', email: 'test@example.com' });
      expect(result.errCode).toBe('success');
      expect(repo.insert).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      repo.update.mockResolvedValue({ errCode: 'success' });

      const result = await service.update({ no: 1, name: '이몽룡' });
      expect(result.errCode).toBe('success');
      expect(repo.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      repo.delete.mockResolvedValue({ errCode: 'success' });

      const result = await service.delete(1);
      expect(result.errCode).toBe('success');
      expect(repo.delete).toHaveBeenCalled();
    });
  });
});
