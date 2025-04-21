"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { captureException } from "@/lib/sentry";

// 폴백 렌더링을 위한 함수 타입
type FallbackRenderFn = (error: Error) => React.ReactElement;

interface Props {
  children: ReactNode;
  // React.ReactNode 또는 render 함수를 분리하여 처리
  fallback?: React.ReactNode;
  fallbackRender?: FallbackRenderFn;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 에러 경계 컴포넌트
 *
 * React 컴포넌트 트리에서 발생하는 JavaScript 오류를 캐치하고
 * 폴백 UI를 표시하는 컴포넌트입니다.
 *
 * @example
 * <ErrorBoundary fallback={<p>오류가 발생했습니다.</p>}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // 또는 함수형 폴백 사용
 * <ErrorBoundary fallbackRender={(error) => <ErrorDisplay error={error} />}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태를 업데이트합니다.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 오류 로깅 서비스에 오류를 기록합니다.
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Sentry에 오류 정보 전송
    captureException(error, {
      componentStack: errorInfo.componentStack,
      ...errorInfo,
    });
  }

  renderFallback(): React.ReactNode {
    const { fallback, fallbackRender } = this.props;
    const { error } = this.state;

    // 함수형 폴백 사용
    if (fallbackRender && error) {
      return fallbackRender(error);
    }

    // 일반 React 노드 폴백 사용
    if (fallback) {
      return fallback;
    }

    // 기본 폴백 UI
    return (
      <div className="p-4 m-4 border border-red-500 rounded-md bg-red-50">
        <h2 className="mb-2 text-xl font-bold text-red-700">
          오류가 발생했습니다
        </h2>
        <p className="text-gray-700">
          예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 관리자에게
          문의해주세요.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          페이지 새로고침
        </button>
      </div>
    );
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
