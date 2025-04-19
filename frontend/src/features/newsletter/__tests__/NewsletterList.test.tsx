// NewsletterList.test.tsx
// 뉴스레터 목록 컴포넌트 테스트
// 테스트 항목:
// 1. 로딩 상태 표시 테스트
// 2. 오류 상태 표시 테스트
// 3. 뉴스레터 목록이 비어있을 때 메시지 표시 테스트
// 4. 뉴스레터 목록이 정상적으로 렌더링되는지 테스트
// 5. 뉴스레터 아이템별 링크가 올바르게 설정되는지 테스트

import React from "react";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import "@testing-library/jest-dom"; // 명시적으로 추가
import NewsletterList from "../NewsletterList";
import { useNewsletterQuery } from "../useNewsletterQuery";
import { Newsletter } from "@/types/newsletter";

// useNewsletterQuery 훅 모킹
jest.mock("../useNewsletterQuery");

// next/link 모킹 (모듈을 모킹하는 올바른 방법)
jest.mock("next/link", () => {
  const Link = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => {
    return (
      <a href={href} data-testid={`link-${href}`}>
        {children}
      </a>
    );
  };
  return Link;
});

// 테스트용 뉴스레터 타입 (실제 타입과 다를 경우 대비)
type TestNewsletter = {
  id: string;
  title: string;
  content: string;
  summary: string;
  createdAt: string;
  thumbnail: string | null;
  status?: string;
};

describe("NewsletterList", () => {
  // 샘플 뉴스레터 데이터
  const mockNewsletters: TestNewsletter[] = [
    {
      id: "1",
      title: "테스트 뉴스레터 1",
      content: "<p>테스트 내용 1</p>",
      summary: "테스트 요약 1",
      createdAt: "2023-04-01T09:00:00.000Z",
      thumbnail: "/images/test1.jpg",
      status: "PUBLISHED",
    },
    {
      id: "2",
      title: "테스트 뉴스레터 2",
      content: "<p>테스트 내용 2</p>",
      summary: "테스트 요약 2",
      createdAt: "2023-04-02T09:00:00.000Z",
      thumbnail: null,
      status: "PUBLISHED",
    },
  ];

  beforeEach(() => {
    // 모킹 초기화
    jest.clearAllMocks();
  });

  // 로딩 상태 테스트
  test('로딩 상태일 때 "불러오는 중..." 메시지가 표시되어야 함', () => {
    // 로딩 상태 모킹
    (useNewsletterQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    });

    render(<NewsletterList />);

    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
    console.log("로딩 상태 메시지 테스트 완료");
  });

  // 오류 상태 테스트
  test("오류 상태일 때 에러 메시지가 표시되어야 함", () => {
    // 오류 상태 모킹
    (useNewsletterQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    });

    render(<NewsletterList />);

    expect(
      screen.getByText("에러가 발생했습니다. 다시 시도해주세요."),
    ).toBeInTheDocument();
    console.log("오류 상태 메시지 테스트 완료");
  });

  // 빈 목록 테스트
  test("뉴스레터 목록이 비어있을 때 안내 메시지가 표시되어야 함", () => {
    // 빈 목록 상태 모킹
    (useNewsletterQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(<NewsletterList />);

    expect(screen.getByText("표시할 뉴스레터가 없습니다.")).toBeInTheDocument();
    console.log("빈 목록 메시지 테스트 완료");
  });

  // 뉴스레터 목록 렌더링 테스트
  test("뉴스레터 목록이 정상적으로 렌더링되어야 함", () => {
    // 뉴스레터 데이터가 있는 상태 모킹
    (useNewsletterQuery as jest.Mock).mockReturnValue({
      data: mockNewsletters,
      isLoading: false,
      isError: false,
    });

    render(<NewsletterList />);

    // 뉴스레터 제목 확인
    expect(screen.getByText("테스트 뉴스레터 1")).toBeInTheDocument();
    expect(screen.getByText("테스트 뉴스레터 2")).toBeInTheDocument();

    // 요약 확인
    expect(screen.getByText("테스트 요약 1")).toBeInTheDocument();
    expect(screen.getByText("테스트 요약 2")).toBeInTheDocument();

    // 날짜 포맷팅 확인 (2023년 4월 1일)
    expect(screen.getByText(/2023년 4월 1일/)).toBeInTheDocument();
    expect(screen.getByText(/2023년 4월 2일/)).toBeInTheDocument();

    // 링크 확인
    const links = screen.getAllByTestId(/^link-\/p\//);
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/p/1");
    expect(links[1]).toHaveAttribute("href", "/p/2");

    // 썸네일 확인 (첫 번째 아이템만 썸네일 있음)
    const thumbnails = screen.getAllByRole("img");
    expect(thumbnails).toHaveLength(1);
    expect(thumbnails[0]).toHaveAttribute("src", "/images/test1.jpg");

    console.log("뉴스레터 목록 렌더링 테스트 완료");
  });
});
