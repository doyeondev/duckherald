// Sentry 서버 설정 파일
// Node.js 서버 환경에서의 Sentry 설정을 관리합니다.

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN_FRONTEND || "",

  // 서버 환경에서의 샘플링 비율 설정
  // 프로덕션에서는 낮은 값으로 조정하는 것이 좋습니다
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // 현재 환경 설정
  environment: process.env.NODE_ENV,

  // 디버그 모드 (개발 환경에서만)
  debug: process.env.NODE_ENV === "development",

  // 릴리스 버전 (자동 또는 수동 설정)
  release: `duckherald-frontend@${process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0"}`,

  // 서버 측 통합 설정
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    // Next.js 서버에 맞는 통합 설정
  ],

  // 이슈 필터링: 특정 오류는 보고하지 않음
  beforeSend(event, hint) {
    // 404 오류는 캡처하지 않음
    if (
      event.exception &&
      event.exception.values &&
      event.exception.values[0].type === "NotFoundError"
    ) {
      return null;
    }

    // 개발 환경에서는 중요한 오류만 보고
    if (process.env.NODE_ENV !== "production") {
      if (event.level !== "error") {
        return null;
      }
    }

    // DuckHerald 서비스 태그 추가
    event.tags = {
      ...event.tags,
      service: "frontend-server",
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    };

    return event;
  },
});
