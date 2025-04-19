// Sentry 관련 React 훅
// 컴포넌트에서 Sentry 기능을 더 쉽게 사용할 수 있게 함

import { useCallback } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * Sentry 사용을 위한 커스텀 훅
 *
 * 컴포넌트에서 오류를 보고하고 사용자 컨텍스트를 설정하는 기능을 제공합니다.
 *
 * @example
 * const { captureError, setUserContext, addBreadcrumb } = useSentry();
 *
 * // 오류 포착
 * try {
 *   // 위험한 작업
 * } catch (error) {
 *   captureError(error, { component: 'UserProfile' });
 * }
 *
 * // 사용자 컨텍스트 설정
 * useEffect(() => {
 *   if (user) {
 *     setUserContext(user);
 *   }
 * }, [user, setUserContext]);
 */
export const useSentry = () => {
  /**
   * 오류를 Sentry에 보고
   * @param error - 발생한 오류
   * @param context - 오류 컨텍스트 (선택 사항)
   */
  const captureError = useCallback(
    (error: Error, context?: Record<string, any>) => {
      console.error("오류 발생:", error);
      Sentry.captureException(error, {
        contexts: {
          custom: context || {},
        },
      });
    },
    [],
  );

  /**
   * 사용자 컨텍스트 설정
   * @param user - 사용자 정보
   */
  const setUserContext = useCallback(
    (user: { id?: string; email?: string; name?: string }) => {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.name,
      });
    },
    [],
  );

  /**
   * 사용자 컨텍스트 제거 (로그아웃 시)
   */
  const clearUserContext = useCallback(() => {
    Sentry.setUser(null);
  }, []);

  /**
   * Sentry에 빵부스러기(이동 경로) 추가
   * @param category - 카테고리
   * @param message - 메시지
   * @param data - 추가 데이터
   */
  const addBreadcrumb = useCallback(
    (category: string, message: string, data?: Record<string, any>) => {
      Sentry.addBreadcrumb({
        category,
        message,
        data,
        level: "info",
      });
    },
    [],
  );

  /**
   * 성능 트랜잭션 시작
   * @param name - 트랜잭션 이름
   * @param op - 트랜잭션 타입
   */
  const startTransaction = useCallback(
    (name: string, op: string = "ui.interaction") => {
      return Sentry.startTransaction({ name, op });
    },
    [],
  );

  return {
    captureError,
    setUserContext,
    clearUserContext,
    addBreadcrumb,
    startTransaction,
  };
};
