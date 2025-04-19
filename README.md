# DuckHerald Newsletter Service

뉴스레터 구독 및 발송 서비스 DuckHerald 프로젝트입니다.

## 프로젝트 구조

```
duckherald/
├── backend/                  # 백엔드 (Spring Boot + Kotlin)
│   ├── src/                  # 소스 코드
│   ├── build.gradle.kts      # 빌드 설정
│   └── README.md             # 백엔드 설명
└── frontend/                 # 프론트엔드 (Next.js + React)
    ├── src/                  # 소스 코드
    ├── package.json          # 패키지 정보
    └── README.md             # 프론트엔드 설명
```

## 주요 기능

- 뉴스레터 작성 및 발행
- 구독자 관리
- 이메일 발송
- 구독 및 취소
- 발송 통계

## API 자동화 설정

백엔드와 프론트엔드 간의 일관성을 유지하기 위해 OpenAPI 기반 타입 자동화가 구현되어 있습니다.

### 백엔드 설정

1. SpringDoc OpenAPI 사용

   - 모든 API는 자동으로 문서화됩니다.
   - `http://localhost:8080/swagger-ui/index.html`에서 API 문서 확인 가능
   - `http://localhost:8080/v3/api-docs`에서 OpenAPI JSON 스키마 제공

2. DTO ↔ Entity 매핑 자동화
   - 모든 DTO 클래스에는 Entity와의 변환 메소드 구현
   - Kotlin의 확장 함수와 companion object 활용

### 프론트엔드 설정

1. 타입 자동 생성

   - orval 라이브러리를 사용하여 백엔드 API 타입 및 클라이언트 코드 자동 생성
   - `npm run generate-api` 명령어로 실행

2. React Query 통합
   - 생성된 API 클라이언트는 React Query와 자동으로 통합됨
   - 캐싱, 로딩 상태, 에러 처리 등 지원

## 개발 시작하기

### 백엔드 실행

```bash
cd backend
./gradlew bootRun
```

### 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

### API 타입 생성

```bash
cd frontend
npm run generate-api
```

## 사용 기술

- 백엔드

  - Spring Boot 3
  - Kotlin
  - JPA/Hibernate
  - PostgreSQL
  - SpringDoc OpenAPI

- 프론트엔드
  - Next.js 14.2
  - React 18
  - TypeScript
  - TailwindCSS
  - React Query
  - Orval (API 클라이언트 생성)
