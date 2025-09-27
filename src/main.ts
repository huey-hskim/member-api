// main.ts

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import morgan from 'morgan';
import * as express from 'express';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 3000);
  const host = configService.get<string>('HOST', '0.0.0.0');

  // public 폴더 정적 파일 라우팅
  app.use('/', express.static(join(__dirname, '..', 'public')));

  const use_swagger = configService.get<string>('USE_SWAGGER', 'false');

  // 스웨거
  if (use_swagger === 'true') {
    console.log(`Swagger Enabled : http://localhost:${port}/-api-doc-s`);
    const config = new DocumentBuilder()
      .setTitle('Member API')
      .setDescription('회원관리 서비스의 API 문서입니다.')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('-api-doc-s', app, document); // http://localhost:3000/-api-doc-s
  }

  // HTTP 요청 로깅
  app.use(morgan('dev'));

  // SIGTERM 신호 처리
  process.on('SIGTERM', () => {
    console.log('Server shutdown by SIGTERM.');
    process.exit(0);
  });
  // SIGINT 신호 처리
  process.on('SIGINT', () => {
    console.log('Server shutdown by SIGINT.');
    process.exit(0);
  });

  // 서버 스타트
  await app.listen(port, host);
  console.log(`Server is running [${host}:${port}]`);
}

bootstrap().then();
