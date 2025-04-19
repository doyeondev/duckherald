"use client";

// Next.js 전역 오류 페이지
// 애플리케이션에서 처리되지 않은 오류에 대한 폴백 UI

import React, { useEffect } from "react";
import ErrorPage from "@/components/common/ErrorPage";
import { useSentry } from "@/hooks/useSentry";

/**
 * Next.js 전역 오류 페이지
 *
 * 애플리케이션 내에서 처리되지 않은 오류가 발생할 경우
 * 이 페이지가 표시됩니다. 오류를 Sentry에 보고하고
 * 사용자 에러표시 제공.
 */
export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { captureError } = useSentry();

  // 오류를 Sentry에 보고
  useEffect(() => {
    // 오류 정보 로깅
    console.error("애플리케이션 오류:", error);

    // Sentry에 오류 보고
    captureError(error, {
      component: "GlobalErrorPage",
      errorDigest: error.digest,
      path: window.location.pathname,
    });
  }, [error, captureError]);

  // 주요 오류 메시지 추출
  const getErrorMessage = () => {
    if (!error) return "알 수 없는 오류가 발생했습니다.";

    // 일반적인 오류 메시지 처리
    if (error.message?.includes("fetch failed")) {
      return "서버에 연결할 수 없습니다. 인터넷 연결을 확인하고 다시 시도해주세요.";
    }

    if (error.message?.includes("timeout")) {
      return "서버 응답이 너무 오래 걸립니다. 잠시 후 다시 시도해주세요.";
    }

    // 기본 오류 메시지
    return "예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 나중에 다시 시도해주세요.";
  };

  return (
    <ErrorPage
      code={500}
      title="문제가 발생했습니다"
      message={getErrorMessage()}
      showHomeButton={true}
      showRetryButton={true}
    />
  );
}
