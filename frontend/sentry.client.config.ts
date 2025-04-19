// Sentry 클라이언트 설정 파일
// 브라우저 환경에서의 Sentry 설정을 관리합니다.

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN_FRONTEND || "",

  // 이 값은 개발 환경에서는 낮추고 프로덕션에서는 높입니다.
  // 샘플링 비율 (0.0 ~ 1.0, 1.0은 모든 요청 추적)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // 개발 환경에서만 디버그 모드 활성화
  debug: process.env.NODE_ENV === "development",

  // 현재 환경명 설정
  environment: process.env.NODE_ENV,

  // 릴리스 버전 (배포시 설정)
  release: `duckherald-frontend@${process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0"}`,

  // 브라우저 성능 측정 활성화
  integrations: [
    new Sentry.BrowserTracing({
      // Next.js 라우팅에 최적화된 설정
      // 이 부분은 Sentry가 자동으로 Next.js 라우팅을 감지하도록 함
    }),
    new Sentry.Replay({
      // UI 인터랙션 캡처 설정 - 개인정보 보호 강화
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // 브라우저 세션 리플레이 설정
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0.5, // 프로덕션에서는 10%만 캡처
  replaysOnErrorSampleRate: 1.0, // 오류 발생시 100% 캡처

  // 이슈 심각도 설정 함수
  beforeSend(event, hint) {
    // 개발 환경에서는 심각한 오류만 보고
    if (process.env.NODE_ENV !== "production") {
      if (event.level !== "error") {
        return null;
      }
    }

    // 사용자 식별 정보를 익명화 (필요시)
    if (event.user) {
      // IP 주소 익명화
      if (event.user.ip_address) {
        event.user.ip_address = "0.0.0.0";
      }
    }

    // DuckHerald 서비스에 맞는 태그 추가
    event.tags = {
      ...event.tags,
      service: "frontend",
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    };

    // 수정된, 필터링된 이벤트 반환
    return event;
  },
});
