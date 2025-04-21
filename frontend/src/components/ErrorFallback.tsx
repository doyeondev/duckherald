"use client";

import React from "react";
import * as Sentry from "@sentry/nextjs";

interface ErrorFallbackProps {
  error: Error;
  resetError?: () => void;
}

/**
 * 에러 발생 시 표시할 대체 UI 컴포넌트
 *
 * @example
 * <ErrorBoundary fallback={ErrorFallback}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <div className="error-fallback p-6 rounded-lg border border-red-300 bg-red-50 text-red-800 max-w-md mx-auto my-8 shadow-md">
      <h2 className="text-xl font-semibold mb-3">오류가 발생했습니다</h2>

      <div className="bg-white p-3 rounded border border-red-200 mb-4 text-sm overflow-auto max-h-32">
        <p className="font-mono">{error.message || "알 수 없는 오류"}</p>
      </div>

      <p className="mb-4 text-sm">
        오류 정보가 자동으로 전송되었으며, 빠르게 수정하도록 하겠습니다.
      </p>

      <div className="flex flex-wrap gap-3">
        {resetError && (
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
            onClick={resetError}
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;
