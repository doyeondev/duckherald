// React ReactNode 타입을 확장
import React from "react";

// ReactNode 타입을 확장하여 함수 타입도 포함하도록 함
declare module "react" {
  interface FallbackProps {
    error: Error;
  }

  type FallbackType = (error: Error) => React.ReactElement;

  // ReactNode 타입에 ErrorBoundary의 fallback 타입을 추가
  type ReactNodeWithFallback = React.ReactNode | FallbackType;
}
