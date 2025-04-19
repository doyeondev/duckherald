// Sentry 타입 정의
// @sentry/nextjs 모듈의 타입 오류를 해결하기 위한 임시 선언 파일입니다.

declare module "@sentry/nextjs" {
  import { ReactNode } from "react";

  // Sentry 초기화 설정
  export function init(options: {
    dsn: string;
    tracesSampleRate?: number;
    environment?: string;
    debug?: boolean;
    release?: string;
    beforeSend?: (event: any, hint?: any) => any;
    integrations?: any[];
    replaysSessionSampleRate?: number;
    replaysOnErrorSampleRate?: number;
  }): void;

  // 사용자 설정
  export function setUser(
    user: {
      id?: string;
      email?: string;
      username?: string;
      [key: string]: any;
    } | null,
  ): void;

  // 태그 설정
  export function setTag(key: string, value: string): void;

  // 예외 캡처
  export function captureException(
    exception: any,
    options?: { contexts?: { [key: string]: any } },
  ): string;

  // 빵부스러기 추가
  export function addBreadcrumb(breadcrumb: {
    category: string;
    message: string;
    data?: Record<string, any>;
    level?: "fatal" | "error" | "warning" | "info" | "debug";
  }): void;

  // 트랜잭션 타입
  interface Transaction {
    setData(key: string, value: any): void;
    finish(): void;
  }

  // 트랜잭션 시작
  export function startTransaction(options: {
    name: string;
    op: string;
    [key: string]: any;
  }): Transaction;

  // 라우터 계측 타입
  export function reactRouterV6Instrumentation(options?: any): any;

  // 브라우저 트레이싱 클래스
  export class BrowserTracing {
    constructor(options?: { routingInstrumentation?: any; [key: string]: any });
  }

  // 리플레이 클래스
  export class Replay {
    constructor(options?: {
      maskAllText?: boolean;
      blockAllMedia?: boolean;
      [key: string]: any;
    });
  }

  // ErrorBoundary 컴포넌트
  export class ErrorBoundary extends React.Component<{
    fallback?: ReactNode | ((error: Error) => ReactNode);
    children: ReactNode;
  }> {}

  // 통합 네임스페이스
  export namespace Integrations {
    export class Http {
      constructor(options?: { tracing?: boolean });
    }

    export class Express {
      constructor(options?: { app?: any });
    }

    export class Mongo {
      constructor(options?: any);
    }
  }
}
