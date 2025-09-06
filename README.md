# Member API

![NestJS](https://img.shields.io/badge/NestJS-API-red?style=flat-square&logo=nestjs)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat-square&logo=mysql)
![Docker](https://img.shields.io/badge/Docker-ready-blue?style=flat-square&logo=docker)

회원 관리 서비스 API입니다. NestJS, MySQL, Docker 기반으로 개발되었습니다.

---
## 📝 개발 노트
```
2025-09-06
매번 반복되는 CRUD 코드를 제네릭 베이스 클래스로 추상화하여 재사용성을 높였다.
하지만 스웨거를 통한 API 문서화는 제네릭 클래스의 한계로 인해 지원되지 못한다. 
그래서 콘트롤러는 각 도메인별로 별도 작성해야 하는데..

아직 DB 마이그레이션이 구현되지 않아 초기 실행시 수동으로 테이블을 생성해야 한다.
docker compose exec db sh -c "cat /deploy/202509/*.sql | mysql -uuser -ppass -Dmember"

에러 핸들링 등 세부적인 것들도 만들어 나가야 한다.
```

---

## 🚀 시작하기

### 1. 환경 변수 설정
`.env` 파일을 프로젝트 루트에 생성하고 아래와 같이 작성하세요:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=user
DB_PASSWORD=pass
DB_DATABASE=member
# USE_SWAGGER=true   # Swagger 사용 여부. 개발 환경에서만 true로 설정 권장
```

### 2. 로컬 개발
```bash
npm install
npm run start:dev
```

### 3. 컨테이너 빌드
```bash
npm run build:container
npm run rebuild:container   # --no-cache 옵션으로 빌드
```

### 4. Docker로 실행
```bash
docker-compose up -d
```

- API: http://localhost:3000
- Swagger: http://localhost:3000/-api-doc-s

---

## 📦 폴더 구조

```
src/
  constants/    # 상수 정의
  libs/         # 모듈이 되지 못한 유틸리티
  modules/      # 공통 모듈 (DB, 유틸 등)
    mysql/      # MySQL 모듈
  services/     # 서비스 모듈
    base/       # 서비스 모듈 공통 베이스 제네릭
    user/       # 회원 도메인 (컨트롤러, 서비스, 엔티티 등)
migrations/     # DB 스키마 변경 파일
public/         # 정적 파일
dist/           # 빌드 결과물
test/           # 테스트 스크립트
```

---

## 🧪 테스트
```bash
npm run test
```

---

## 🛠️ 기술 스택
- Node.js (NestJS)
- MySQL 8
- Docker
- TypeScript
- Jest (테스트)

---

## 👤 Author
- huey-kim

---

## 📄 라이선스
ICS

