// 404 Not Found 페이지
// 존재하지 않는 경로에 대한 처리를 담당합니다.

import React from "react";
import ErrorPage from "@/components/common/ErrorPage";

/**
 * 404 Not Found 페이지
 *
 * 요청한 페이지를 찾을 수 없을 때 Next.js에 의해 자동으로 표시됩니다.
 * 사용자 친화적인 오류 메시지와 네비게이션 옵션을 제공합니다.
 */
export default function NotFoundPage() {
  return (
    <ErrorPage
      code={404}
      title="페이지를 찾을 수 없습니다"
      message="요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다. URL을 확인하고 다시 시도해주세요."
      showHomeButton={true}
      showRetryButton={false}
    />
  );
}
