// user.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserViewRepository, UserRepository, UserInfoRepository, UserShadowRepository } from './user.repository';
import { Pool } from 'mysql2/promise';
import { UserViewEntity } from './user.entity';
import { ErrorCode } from '../../constants/consts';

describe('UserService', () => {
  let service: UserService;
  let repoView: jest.Mocked<UserViewRepository>;
  let repo: jest.Mocked<UserRepository>;
  let repoInfo: jest.Mocked<UserInfoRepository>;
  let repoShadow: jest.Mocked<UserShadowRepository>;
  let pool: jest.Mocked<Pool>;

  beforeEach(async () => {
    // Repository mock
    repoView = {
      findAll: jest.fn(),
      findByNo: jest.fn(),
      findByEmail: jest.fn(), // findByEmail 추가
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      helper: {} as any, // 필요시 커스텀 쿼리용
    } as unknown as jest.Mocked<UserViewRepository>;

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

    // Repository mock
    repoInfo = {
      findAll: jest.fn(),
      findByNo: jest.fn(),
      findByEmail: jest.fn(), // findByEmail 추가
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      helper: {} as any, // 필요시 커스텀 쿼리용
    } as unknown as jest.Mocked<UserInfoRepository>;

    // Repository mock
    repoShadow = {
      findAll: jest.fn(),
      findByNo: jest.fn(),
      findByEmail: jest.fn(), // findByEmail 추가
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      helper: {} as any, // 필요시 커스텀 쿼리용
    } as unknown as jest.Mocked<UserShadowRepository>;

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
        { provide: 'UserViewRepository' , useValue: repoView },
        { provide: 'UserRepository' , useValue: repo },
        { provide: 'UserInfoRepository' , useValue: repoInfo },
        { provide: 'UserShadowRepository' , useValue: repoShadow },
        { provide: 'MYSQL_CONNECTION', useValue: pool },
      ],
    })
      .overrideProvider(UserService)
      .useValue(new UserService(pool, repoView, repo, repoInfo, repoShadow)) // 실제 UserService 생성
      .compile();

    service = module.get<UserService>(UserService);
    // repository를 직접 주입하지 않고, service.repository를 mock으로 교체
    (service as any).repository = repoView;
    (service as any).userRepository = repo;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers: UserViewEntity[] = [{
        user_no: 1, id: 'hong@gil.dong', status: 200, name: '홍길동', email: 'hong@gil.dong'
      },
      ];

      repoView.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll();
      expect(result).toEqual(mockUsers);
      expect(repoView.findAll).toHaveBeenCalled();
    });
  });

  describe('findByNo', () => {
    it('should return one user', async () => {
      const mockUser: UserViewEntity = {
        user_no: 1, id: 'hong@gil.dong', status: 200, name: '홍길동', email: 'hong@gil.dong'
      };

      repoView.findByNo.mockResolvedValue(mockUser);

      const result = await service.findByNo(1);
      expect(result).toEqual(mockUser);
      expect(repoView.findByNo).toHaveBeenCalledWith(expect.anything(), 1);
    });
  });
  //
  // describe('findByEmail', () => {
  //   it('should return user by email', async () => {
  //     const mockUser: UserViewEntity = {
  //       user_no: 1, id: 'hong@gil.dong', status: 200, name: '홍길동', email: 'hong@gil.dong'
  //       // , phone_number: 'phone_number', country_code: 'KR', language: 'ko', time_zone: 'Asia/Seoul', user_pic_file_seq: null, role_code: '000'
  //     };
  //     repo.findByEmail = jest.fn().mockResolvedValue(mockUser);
  //     // pool.getConnection이 반환하는 커넥션 mock
  //     (pool.getConnection as jest.Mock).mockResolvedValue({
  //       release: jest.fn(),
  //     });
  //     const result = await service.findByEmail('test@example.com');
  //     expect(result).toEqual(mockUser);
  //     expect(repo.findByEmail).toHaveBeenCalled();
  //   });
  // });

  describe('create', () => {
    it('should create a user', async () => {
      repo.insert.mockResolvedValue({ errCode: ErrorCode.success, insertId: 1 });
      repoInfo.insert.mockResolvedValue({ errCode: ErrorCode.success });
      repoShadow.insert.mockResolvedValue({ errCode: ErrorCode.success });

      const result = await service.createUser({ id: 'test11@example.com', name: '홍길동', passwd: 'password123' });
      expect(result.user_no).toBeDefined();
      expect(repo.insert).toHaveBeenCalled();
    });
  });

  // 업데이트는 베이스 못 쓰고 새로 만들어야함.. user_no 말고 no로 할까봐..
  // describe('update', () => {
  //   it('should update a user', async () => {
  //     repoInfo.update.mockResolvedValue({ errCode: 'success' });
  //
  //     const result = await service.update({ user_no: 1, name: '이몽룡' });
  //     expect(result.errCode).toBe('success');
  //     expect(repoInfo.update).toHaveBeenCalled();
  //   });
  // });

  // 삭제도 베이스 못 쓰고 새로 만들어야함..
  // describe('delete', () => {
  //   it('should delete a user', async () => {
  //     repo.delete.mockResolvedValue({ errCode: ErrorCode.success });
  //
  //     const result = await service.delete(1);
  //     expect(result.errCode).toBe(ErrorCode.success);
  //     expect(repo.delete).toHaveBeenCalled();
  //   });
  // });
});