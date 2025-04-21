import * as Sentry from "@sentry/nextjs";

export async function register() {
  // 테스트 환경에서는 Sentry 초기화를 건너뜁니다
  if (process.env.NODE_ENV === "test") {
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// captureRequestError 메서드가 존재하지 않아 임시 구현
export const onRequestError = (error: Error) => {
  // 테스트 환경이 아닐 때만 Sentry에 오류 보고
  if (process.env.NODE_ENV !== "test") {
    Sentry.captureException(error);
  }
  console.error("Request error:", error);
};
