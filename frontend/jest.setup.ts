// jest.setup.ts
// Jest 테스트 환경에 @testing-library/jest-dom의 확장 매처(matcher) 가져오기
// 이를 통해 DOM 요소에 대한 더 직관적인 assertion 사용 가능
// 예: expect(element).toBeInTheDocument(), expect(element).toHaveTextContent('text') 등

import "@testing-library/jest-dom";
import React from "react";

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
  const Link = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => React.createElement("a", { href, "data-testid": "link" }, children);
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

  // console.error 모킹 (불필요한 경고 메시지 숨기기)
  jest.spyOn(console, "error").mockImplementation(() => {});
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
