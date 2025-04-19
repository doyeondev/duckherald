import React, { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 오류 발생 시 Sentry로 보고하고 대체 UI를 표시하는 ErrorBoundary 컴포넌트
 *
 * @example
 * <ErrorBoundary fallback={<div>오류가 발생했습니다</div>}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 오류를 Sentry로 보고
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
        tags: {
          origin: "error_boundary",
        },
      },
    });

    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      if (typeof fallback === "function") {
        return fallback(error, this.resetError);
      }

      return (
        fallback || (
          <div className="error-boundary p-6 rounded-lg border border-red-300 bg-red-50 text-red-800">
            <h2 className="text-xl font-semibold mb-2">오류가 발생했습니다</h2>
            <p className="mb-4">
              요청하신 작업을 처리하는 중 문제가 발생했습니다.
            </p>
            <p className="text-sm opacity-75 mb-4">
              오류 정보가 자동으로 전송되었으며, 빠르게 수정하도록 하겠습니다.
            </p>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              onClick={this.resetError}
            >
              다시 시도
            </button>
          </div>
        )
      );
    }

    return children;
  }
}

export default ErrorBoundary;
