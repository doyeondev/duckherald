# DuckHerald 테스트 수정 계획 요약서

작성일: 2025-04-21  
작성자: 도연

---

## ✅ 전체 테스트 현황

| 항목       | 전체 | 통과 | 실패 | 성공률   |
| ---------- | ---- | ---- | ---- | -------- |
| 백어들     | 60   | 22   | 38   | 36.7% ❌ |
| 프론트엔드 | 45   | 42   | 3    | 93.3% ✅ |

---

## 🔥 주요 이슈 요약

### 1. 백어들

#### 🔝 1-1. ApplicationContext 로딩 실패 (DeliveryControllerTest 등)

- Bean 'entityManagerFactory' 없음 → @WebMvcTest의 context 한계
- 해결: `@SpringBootTest` 또는 `@Import(JpaConfig.class)` 사용

#### 🔝 1-2. Mockito matcher 오용 (`any()` NPE, `InvalidUseOfMatchersException`)

- any()는 primitive와 같이 사용 불가 → `anyInt()` 등으로 교체
- matcher는 다시면에서만 사용 (`when(...)`, `verify(...)`)

#### ⚠️ 1-3. 환경 변수 두래 (`jwt.secret`)

- `${jwt.secret}` 파시 실패 → `.env`, `application-test.yml`에 명시 필요

---

### 2. 프론트엔드

#### ⚠️ 2-1. `ReactDOMTestUtils.act` 사용

- React 18 이상에서는 `react`에서 `act` 가져오고 사용
  ```tsx
  import { act } from "react";
  ```

#### ⚠️ 2-2. DialogContent 접근성 경고

- `aria-describedby` 두래 → 설명 텍스트 추가 필요

#### ⚠️ 2-3. localStorage mocking 문제 (`AuthProvider`)

- `getItem`/`setItem` 동작 없음 → 직접 모킹 또는 `jest-localstorage-mock` 사용

---

## 📂 원선순위 정리

| 원선순위 | 항목                           | 설명                          |
| -------- | ------------------------------ | ----------------------------- |
| 🔴 1순위 | 백어 커트롤러 테스트 로딩 실패 | 모든 테스트 차단              |
| 🔴 2순위 | Mockito matcher 오용           | 10가 이상 테스트 NPE          |
| 🔶 3순위 | 프론트엔드 act import 변경     | 경고 제거                     |
| 🔹 4순위 | 접근성 경고 해결               | UX 행성 목적                  |
| 🔵 5순위 | localStorage mocking 보왈      | 일부 AuthProvider 테스트 감정 |

---

## 📦 완료 기준

- 백어들: `./gradlew test` 통과
- 프론트엔드: `npm run test`, `next build` 통과
- 커버리지 리포트 생성 및 `.test-results.md` 문서화

---

📌 필요 시 `CI` 연동 및 커미트 템플릿도 변환 가능!
