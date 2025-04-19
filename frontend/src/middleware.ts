// Next.js 미들웨어 - Sentry 통합
// 요청별 트랜잭션 생성 및 성능 모니터링 용도

import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * Next.js 미들웨어
 * 모든 요청에 대해 Sentry 트랜잭션 시작 및 오류 모니터링
 * 성능 측정 및 에러 추적을 위한 미들웨어입니다.
 */
export function middleware(request: NextRequest) {
  // 현재 URL 경로
  const pathname = request.nextUrl.pathname;

  try {
    // Sentry 트랜잭션 시작
    const transaction = Sentry.startTransaction({
      name: `route:${pathname}`,
      op: "navigation",
    });

    // transaction이 정의된 경우에만 setData 호출
    if (transaction) {
      // 트랜잭션에 URL 정보 추가
      transaction.setData("url", request.url);
      transaction.setData("method", request.method);

      // 트랜잭션 완료 (비동기로 처리)
      setTimeout(() => {
        transaction.finish();
      }, 0);
    }

    // 커스텀 HTTP 헤더 추가 예시
    const response = NextResponse.next();
    response.headers.set("X-Monitoring-Active", "true");

    // 보안 헤더 추가
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    return response;
  } catch (error) {
    // 오류 발생 시 캡처
    console.error("Middleware error:", error);
    Sentry.captureException(error);

    // 기본 응답 반환
    return NextResponse.next();
  }
}

// 미들웨어 설정
export const config = {
  // 미들웨어를 적용할 경로
  matcher: [
    // 다음 경로는 미들웨어 적용에서 제외
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
