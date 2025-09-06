// test/user.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // DbModule, UserModule 포함된 루트 모듈
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let createdUserNo: number;

  it('/users (POST) → create', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ name: '홍길동', email: 'test@example.com' })
      .expect(201);

    expect(res.body.errCode).toBe('success');
    expect(res.body.insertId).toBeDefined();
    createdUserNo = res.body.insertId;
  });

  it('/users (GET) → findAll', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('/users/:no (GET) → findByNo', async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${createdUserNo}`)
      .expect(200);

    expect(res.body).toHaveProperty('id', createdUserNo);
    expect(res.body).toHaveProperty('name', '홍길동');
  });

  it('/users/:no (PUT) → update', async () => {
    const res = await request(app.getHttpServer())
      .put(`/users/${createdUserNo}`)
      .send({ name: '이몽룡' })
      .expect(200);

    expect(res.body.errCode).toBe('success');
  });

  it('/users/:no (DELETE) → delete', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/users/${createdUserNo}`)
      .expect(200);

    expect(res.body.errCode).toBe('success');
  });
});
