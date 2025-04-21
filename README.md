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

# DuckHerald - 테스트 시나리오 문서

## 개요

이 문서는 DuckHerald 프로젝트의 테스트 시나리오와 결과를 설명합니다. 프론트엔드(React)와 백엔드(Spring Boot) 모두에 대한 테스트 결과가 포함되어 있습니다.

## 테스트 환경

- **프론트엔드**: Jest 29.5.0, React Testing Library 14.0.0, Node v18.17.1
- **백엔드**: JUnit 5, Spring Boot 3.2.3, Java 17
- **테스트 서버**: macOS 14.3.0, Gradle 7.6.1

## 테스트 분류

### 1. 단위 테스트

개별 컴포넌트, 서비스, 컨트롤러의 기능을 독립적으로 테스트합니다.

### 2. 통합 테스트

여러 컴포넌트가 함께 작동하는 방식을 테스트합니다.

### 3. E2E 테스트

사용자 시나리오 기반으로 전체 애플리케이션 흐름을 테스트합니다.

## 프론트엔드 테스트 결과

프론트엔드 테스트는 **100% 성공**했습니다.

### 테스트 요약

- 총 테스트 개수: 28
- 통과: 28
- 실패: 0
- 스킵: 0
- 총 테스트 실행 시간: 5.43초

### 주요 테스트 영역

1. **인증 관련 테스트**: 로그인, 로그아웃, 인증 상태 관리
2. **구독자 관리 테스트**: 구독자 목록 표시, 구독 양식 처리
3. **뉴스레터 관련 테스트**: 뉴스레터 목록, 편집기 기능
4. **공통 컴포넌트 테스트**: 헤더, 푸터, 알림 등

## 백엔드 테스트 결과

백엔드 테스트는 **일부 성공, 일부 실패**했습니다.

### 테스트 요약

- 총 테스트 클래스: 12
- 총 테스트 케이스: 42
- 성공: 31 (73.8%)
- 실패: 11 (26.2%)
- 스킵: 0
- 총 실행 시간: 12.45초

### 성공한 테스트 영역

- **SubscriberController 테스트**: 구독자 관련 API 모두 성공
- **SubscriberService 테스트**: 구독자 관련 서비스 모두 성공
- **NewsletterService 테스트**: 뉴스레터 관련 서비스 모두 성공

### 실패한 테스트 영역

1. **NewsletterAdminController 테스트**: 의존성 주입 및 인증 관련 문제
2. **DeliveryService 테스트**: EmailService 모킹 문제
3. **NewsletterIntegration 테스트**: 인증 설정 문제 (401 Unauthorized)

## 문제점 및 해결 방안

### 1. 인증 관련 문제

**문제**: 관리자 API 테스트에서 401 Unauthorized 응답
**해결 방안**: 테스트 환경에서 필요한 인증 토큰을 제공하는 설정 추가

### 2. 모킹(Mocking) 문제

**문제**: EmailService 모킹 과정에서 NullPointerException 발생
**해결 방안**: 적절한 Mockito 설정 및 any() 매처 사용법 개선

### 3. 환경 설정 문제

**문제**: 테스트와 프로덕션 환경 간의 설정 차이로 인한 실패
**해결 방안**: application-test.yml 파일에 테스트에 필요한 모든 설정 추가

## 테스트 개선 계획

1. **테스트 커버리지 향상**: 현재 백엔드 테스트 커버리지는 약 65%로, 목표는 80% 이상
2. **테스트 자동화**: CI/CD 파이프라인에 테스트 자동화 통합
3. **테스트 데이터 관리**: 테스트에 사용되는 데이터의 일관성 유지
4. **E2E 테스트 추가**: Cypress를 사용한 E2E 테스트 추가

## 테스트 로그 위치

- **프론트엔드 테스트 로그**: `_test_log/frontend/test-execution-log.txt`
- **백엔드 테스트 로그**: `_test_log/backend/test-execution-log.txt`
- **콘솔 출력 로그**: `_test_log/backend/test-console-output.log`

## 테스트 실행 방법

### 프론트엔드 테스트

```bash
cd frontend
npm test
```

### 백엔드 테스트

```bash
cd backend
./gradlew test
```

### 특정 테스트만 실행

```bash
# 프론트엔드 특정 테스트
npm test -- -t "AuthContext"

# 백엔드 특정 테스트
./gradlew test --tests "com.duckherald.user.controller.SubscriberControllerTest"
```

## 테스트 작성 가이드

1. **테스트 이름**: `테스트대상_상황_기대결과` 형식으로 작성
2. **Given-When-Then**: 모든 테스트는 이 패턴을 따를 것
3. **독립성**: 각 테스트는 독립적으로 실행 가능해야 함
4. **가독성**: 테스트 코드는 문서로서의 역할도 함께 수행

## 테스트 담당자

- **프론트엔드 테스트**: 김개발
- **백엔드 테스트**: 이테스터
- **통합 테스트**: 박엔지니어
