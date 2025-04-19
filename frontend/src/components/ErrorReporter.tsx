// 전역 오류 보고 컴포넌트
// 애플리케이션 전반의 오류 처리 및 보고를 담당합니다.

import React, { useEffect } from "react";
import { useSentry } from "@/hooks/useSentry";

// 개발 환경에서만 활성화할 테스트 오류
const TEST_ERROR = false;

interface Props {
  user?: {
    id?: string;
    email?: string;
    name?: string;
  };
}

/**
 * 오류 보고 컴포넌트
 *
 * 글로벌 오류 핸들링과 사용자 컨텍스트를 설정합니다.
 * 이 컴포넌트는 루트 레이아웃이나 앱 컴포넌트에 포함되어야 합니다.
 *
 * @param user - 선택적 사용자 객체 (로그인 시)
 */
const ErrorReporter: React.FC<Props> = ({ user }) => {
  const { setUserContext, clearUserContext, captureError, addBreadcrumb } =
    useSentry();

  // 사용자 컨텍스트 설정
  useEffect(() => {
    if (user?.id) {
      // 사용자 정보가 있으면 Sentry에 설정
      setUserContext(user);
      addBreadcrumb("auth", "사용자 로그인", { userId: user.id });
    } else {
      // 사용자 정보가 없으면 컨텍스트 제거
      clearUserContext();
    }
  }, [user, setUserContext, clearUserContext, addBreadcrumb]);

  // 전역 오류 핸들러 설정
  useEffect(() => {
    // 전역 오류 처리 함수
    const handleGlobalError = (event: ErrorEvent) => {
      event.preventDefault(); // 기본 브라우저 오류 처리 방지
      captureError(event.error, {
        source: "window.onerror",
        message: event.message,
        component: "Global",
      });

      console.error("전역 오류 감지:", event.message);

      // 필요한 경우 사용자에게 오류 알림
      // toast.error('오류가 발생했습니다');
    };

    // 처리되지 않은 Promise 오류 처리
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault(); // 기본 처리 방지
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      captureError(error, {
        source: "unhandledrejection",
        component: "PromiseRejection",
      });

      console.error("처리되지 않은 Promise 오류:", event.reason);
    };

    // 이벤트 리스너 등록
    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handlePromiseRejection);

    // 개발 모드에서 테스트 오류 발생
    if (process.env.NODE_ENV === "development" && TEST_ERROR) {
      setTimeout(() => {
        try {
          // 테스트용 오류 발생
          throw new Error("Sentry 테스트 오류");
        } catch (error) {
          if (error instanceof Error) {
            captureError(error, { source: "test" });
          }
        }
      }, 2000);
    }

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handlePromiseRejection);
    };
  }, [captureError]);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
};

export default ErrorReporter;
