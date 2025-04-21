// jest.setup.ts
// Jest 테스트 환경에 @testing-library/jest-dom의 확장 매처(matcher) 가져오기
// 이를 통해 DOM 요소에 대한 더 직관적인 assertion 사용 가능
// 예: expect(element).toBeInTheDocument(), expect(element).toHaveTextContent('text') 등

import "@testing-library/jest-dom";
import React from "react";
import * as fs from "fs";
import * as path from "path";
import fetchMock from "jest-fetch-mock";

// fetch API 모킹 활성화
fetchMock.enableMocks();

// 테스트 로그를 저장할 디렉터리 생성
const logDir = path.join(process.cwd(), "..", "_test_log", "frontend");
const archiveDir = path.join(logDir, "archived");

// 디렉터리가 없으면 생성
try {
  if (!fs.existsSync(path.join(process.cwd(), "..", "_test_log"))) {
    fs.mkdirSync(path.join(process.cwd(), "..", "_test_log"), { recursive: true });
  }
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }
} catch (err) {
  console.error("로그 디렉터리 생성 실패:", err);
}

// 타임스탬프 생성
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const logFilePath = path.join(logDir, `frontend-test-${timestamp}.log`);

// 콘솔 로그를 파일로 리다이렉션하는 함수
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

// 파일과 콘솔에 모두 로그 출력
console.log = function (...args) {
  const logMessage = args
    .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
    .join(" ");

  try {
    fs.appendFileSync(logFilePath, `[LOG][${new Date().toISOString()}] ${logMessage}\n`);
  } catch (err) {
    originalConsoleError("로그 파일 쓰기 실패:", err);
  }

  originalConsoleLog.apply(console, args);
};

console.error = function (...args) {
  const logMessage = args
    .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
    .join(" ");

  try {
    fs.appendFileSync(logFilePath, `[ERROR][${new Date().toISOString()}] ${logMessage}\n`);
  } catch (err) {
    originalConsoleError("로그 파일 쓰기 실패:", err);
  }

  originalConsoleError.apply(console, args);
};

console.warn = function (...args) {
  const logMessage = args
    .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
    .join(" ");

  try {
    fs.appendFileSync(logFilePath, `[WARN][${new Date().toISOString()}] ${logMessage}\n`);
  } catch (err) {
    originalConsoleError("로그 파일 쓰기 실패:", err);
  }

  originalConsoleWarn.apply(console, args);
};

console.info = function (...args) {
  const logMessage = args
    .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
    .join(" ");

  try {
    fs.appendFileSync(logFilePath, `[INFO][${new Date().toISOString()}] ${logMessage}\n`);
  } catch (err) {
    originalConsoleError("로그 파일 쓰기 실패:", err);
  }

  originalConsoleInfo.apply(console, args);
};

// Next.js 14.2 관련 설정 - next/navigation 모킹
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => "/"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
}));

// next/link 모킹
jest.mock("next/link", () => {
  const Link = ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href, "data-testid": "link" }, children);
  return { __esModule: true, default: Link };
});

// Next.js 이미지 컴포넌트 모킹
jest.mock("next/image", () => {
  const Image = (props: any) => {
    return React.createElement("img", {
      ...props,
      "data-testid": "next-image",
    });
  };
  return { __esModule: true, default: Image };
});

// localStorage 모킹 - 테스트 환경에서는 localStorage가 없으므로 모킹 필요
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// 타입 선언 확장 - toBeInTheDocument와 같은 매처 사용 시 타입 에러 방지
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveAttribute(attr: string, value?: string): R;
    }
  }
}

// 모킹 설정 등 추가 가능
// 테스트마다 localStorage 초기화
beforeEach(() => {
  // localStorage 초기화
  jest.clearAllMocks();

  // console.error 모킹 제거 (로그 파일에 기록하기 위해)
  // jest.spyOn(console, "error").mockImplementation(() => {});
});

// 테스트 실행 시작 로그
console.log(`테스트 실행 시작: ${new Date().toISOString()}`);

// 모든 테스트 종료 후 실행
afterAll(() => {
  console.log(`테스트 실행 종료: ${new Date().toISOString()}`);
  console.log(`테스트 로그 파일: ${logFilePath}`);
});

// ResizeObserver 모킹 (Next.js 14.2에서 필요)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// matchMedia 모킹 (테마 관련 코드에서 필요할 수 있음)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // 구버전 API
    removeListener: jest.fn(), // 구버전 API
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// act를 react에서 가져오도록 권장
// react-dom/test-utils에서의 act 사용 방지
jest.mock("react-dom/test-utils", () => {
  const actual = jest.requireActual("react-dom/test-utils");
  const React = jest.requireActual("react");

  return {
    ...actual,
    act: (...args: any[]) => {
      console.warn(
        "Warning: Using act from react-dom/test-utils is deprecated. " +
          "Please use act from react instead. " +
          "See https://react.dev/warnings/react-dom-test-utils for more information.",
      );
      return React.act(...args);
    },
  };
});
