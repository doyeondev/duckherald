// Next.js 로딩 페이지
// 페이지 전환 시 표시되는 로딩 상태 UI를 제공합니다.

import React from "react";

/**
 * 전역 로딩 컴포넌트
 *
 * Next.js app 디렉토리에 위치하여 페이지 전환 시 자동으로 표시됩니다.
 * 데이터 로딩 중에 사용자에게 시각적 피드백을 제공합니다.
 */
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-white">
      <div className="flex flex-col items-center">
        {/* 스피너 애니메이션 */}
        <div className="relative w-20 h-20">
          <div className="absolute w-full h-full border-4 border-gray-200 rounded-full"></div>
          <div className="absolute w-full h-full border-4 border-t-blue-500 rounded-full animate-spin"></div>
        </div>

        {/* 로딩 텍스트 */}
        <p className="mt-4 text-lg text-gray-600">로딩 중...</p>
        <p className="mt-2 text-sm text-gray-500">잠시만 기다려 주세요.</p>
      </div>
    </div>
  );
}
