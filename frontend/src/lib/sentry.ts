// Sentry 초기화 및 설정
// 실시간 오류 추적 및 모니터링을 위한 설정 파일

import * as Sentry from "@sentry/nextjs";

// Sentry 초기화
// 실제 환경에서는 환경변수를 통해 DSN을 제공해야 합니다
Sentry.init({
  // 프로젝트 DSN (Sentry 대시보드에서 확인 가능)
  dsn:
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    "https://your-dsn-here@sentry.io/1234567",

  // 성능 트래킹 샘플 비율 (0.0 ~ 1.0, 1.0은 모든 요청 추적)
  tracesSampleRate: 1.0,

  // 현재 환경 설정 (development, production 등)
  environment: process.env.NODE_ENV,

  // 조건부 디버그 모드 활성화
  debug: process.env.NODE_ENV === "development",

  // 릴리스 식별자 (빌드/배포 시 설정)
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  // 주요 오류만 보고하도록 필터링 (선택 사항)
  beforeSend(event) {
    // 개발 환경에서는 console.error만 처리하고 나머지는 무시
    if (process.env.NODE_ENV === "development") {
      if (event.level !== "error") {
        return null;
      }
    }
    return event;
  },

  // 개인정보 제거 설정 (선택 사항)
  // 로깅된, POST 데이터에서 개인정보 제거
  integrations: [new Sentry.Integrations.Http({ tracing: true })],

  // 사용자 상호작용 추적 설정
  replaysSessionSampleRate: 0.1, // 10%의 세션에서 발생
  replaysOnErrorSampleRate: 1.0, // 오류 발생 시 100% 기록
});

// 사용자 컨텍스트 설정 함수
export const setSentryUser = (user: {
  id?: string;
  email?: string;
  username?: string;
}) => {
  Sentry.setUser(user);
};

// 태그 설정 함수 (필터링 용이성을 위해)
export const setSentryTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

// 커스텀 오류 캡처 함수
export const captureException = (
  error: Error,
  context?: Record<string, any>,
) => {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
};

// export 하여 앱 전체에서 사용 가능하게 함
export default Sentry;
