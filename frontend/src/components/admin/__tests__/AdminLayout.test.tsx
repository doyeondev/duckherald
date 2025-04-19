// AdminLayout.test.tsx
// 관리자 레이아웃 컴포넌트 테스트
// 테스트 항목:
// 1. 컴포넌트가 정상적으로 렌더링되는지 확인
// 2. 네비게이션 링크가 올바르게 렌더링되는지 확인
// 3. 현재 경로에 따라 활성화된 링크 스타일이 적용되는지 확인
// 4. 자식 컴포넌트가 올바르게 렌더링되는지 확인

import React from "react";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import "@testing-library/jest-dom"; // 명시적으로 추가
import AdminLayout from "../AdminLayout";

// next/navigation 모킹
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// next/image 모킹
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} src={props.src} alt={props.alt} />;
  },
}));

// next/link 모킹
jest.mock("next/link", () => {
  const Link = ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
  return Link;
});

import { usePathname } from "next/navigation";

describe("AdminLayout", () => {
  beforeEach(() => {
    // 모킹 초기화
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue("/admin");
  });

  // 기본 렌더링 테스트
  test("관리자 레이아웃이 올바르게 렌더링되어야 함", () => {
    render(
      <AdminLayout>
        <div data-testid="child-content">테스트 컨텐츠</div>
      </AdminLayout>,
    );

    // 로고 확인
    expect(screen.getByAltText("Duck Herald Logo")).toBeInTheDocument();

    // 네비게이션 링크 확인
    expect(screen.getByText("뉴스레터")).toBeInTheDocument();
    expect(screen.getByText("구독자")).toBeInTheDocument();
    expect(screen.getByText("발송")).toBeInTheDocument();
    expect(screen.getByText("사이트")).toBeInTheDocument();

    // 자식 컴포넌트 확인
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByText("테스트 컨텐츠")).toBeInTheDocument();

    console.log("관리자 레이아웃 기본 렌더링 테스트 완료");
  });

  // 활성화된 링크 테스트
  test("현재 경로가 /admin/newsletters일 때 뉴스레터 링크가 활성화되어야 함", () => {
    // usePathname 모의 응답 설정
    (usePathname as jest.Mock).mockReturnValue("/admin/newsletters");

    render(
      <AdminLayout>
        <div>테스트 컨텐츠</div>
      </AdminLayout>,
    );

    // 활성화된 링크 스타일 확인
    const newsletterLink = screen.getByText("뉴스레터").closest("a");
    expect(newsletterLink).toHaveClass("bg-amber-100");
    expect(newsletterLink).toHaveClass("text-amber-800");

    // 다른 링크는 활성화되지 않아야 함
    const subscribersLink = screen.getByText("구독자").closest("a");
    expect(subscribersLink).not.toHaveClass("bg-amber-100");

    console.log("활성화된 링크 스타일 테스트 완료");
  });

  // 다른 경로 활성화 테스트
  test("현재 경로가 /admin/subscribers일 때 구독자 링크가 활성화되어야 함", () => {
    // usePathname 모의 응답 설정
    (usePathname as jest.Mock).mockReturnValue("/admin/subscribers");

    render(
      <AdminLayout>
        <div>테스트 컨텐츠</div>
      </AdminLayout>,
    );

    // 활성화된 링크 스타일 확인
    const subscribersLink = screen.getByText("구독자").closest("a");
    expect(subscribersLink).toHaveClass("bg-amber-100");
    expect(subscribersLink).toHaveClass("text-amber-800");

    // 다른 링크는 활성화되지 않아야 함
    const newsletterLink = screen.getByText("뉴스레터").closest("a");
    expect(newsletterLink).not.toHaveClass("bg-amber-100");

    console.log("다른 경로 활성화 스타일 테스트 완료");
  });
});
