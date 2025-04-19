// 오류 페이지 컴포넌트
// 404, 500 등 오류 페이지를 표시하는 공통 컴포넌트

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  code?: number;
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showRetryButton?: boolean;
}

/**
 * 오류 페이지 컴포넌트
 *
 * 다양한 오류 상황에 대한 표준화된 UI를 제공합니다.
 * 404, 500 등 다양한 오류 코드에 사용할 수 있습니다.
 *
 * @param code - 오류 코드 (404, 500 등)
 * @param title - 오류 제목
 * @param message - 오류 메시지
 * @param showHomeButton - 홈으로 돌아가기 버튼 표시 여부
 * @param showRetryButton - 재시도 버튼 표시 여부
 */
const ErrorPage: React.FC<ErrorPageProps> = ({
  code = 500,
  title = "오류가 발생했습니다",
  message = "예상치 못한 오류가 발생했습니다. 나중에 다시 시도해주세요.",
  showHomeButton = true,
  showRetryButton = true,
}) => {
  // 오류 코드에 따른 아이콘 설정
  const renderIcon = () => {
    if (code === 404) {
      return (
        <svg
          className="w-20 h-20 mb-6 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-20 h-20 mb-6 text-red-500"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  // 오류 코드에 따른 배경색 설정
  const getBgColor = () => {
    if (code === 404) {
      return "bg-yellow-50 border-yellow-200";
    }
    return "bg-red-50 border-red-200";
  };

  // 페이지 새로고침 핸들러
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div
        className={`w-full max-w-lg p-8 mx-auto text-center border rounded-lg shadow-md ${getBgColor()}`}
      >
        {/* 오류 아이콘 */}
        <div className="flex justify-center">{renderIcon()}</div>

        {/* 오류 코드 */}
        <div className="mb-4 text-5xl font-bold text-gray-800">{code}</div>

        {/* 오류 제목 */}
        <h1 className="mb-4 text-2xl font-bold text-gray-800">{title}</h1>

        {/* 오류 메시지 */}
        <p className="mb-8 text-gray-600">{message}</p>

        {/* 버튼 그룹 */}
        <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4 justify-center">
          {showHomeButton && (
            <Link href="/" passHref>
              <Button variant="outline" className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span>홈으로 돌아가기</span>
              </Button>
            </Link>
          )}

          {showRetryButton && (
            <Button onClick={handleRetry} className="flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>다시 시도하기</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
