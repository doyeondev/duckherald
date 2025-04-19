// NewsletterItem.test.tsx
// NewsletterItem 컴포넌트 테스트
// 테스트 항목:
// 1. 컴포넌트가 정상적으로 렌더링되는지 확인
// 2. 제목과 날짜가 정상적으로 표시되는지 확인
// 3. 내용이 정상적으로 렌더링되는지 확인

import React from "react";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import NewsletterItem from "../NewsletterItem";
import "@testing-library/jest-dom";

describe("NewsletterItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 기본 렌더링 테스트
  test("뉴스레터 아이템이 정상적으로 렌더링되어야 함", () => {
    render(
      <NewsletterItem
        title="테스트 뉴스레터"
        created_at="2023-04-01T12:00:00"
        content="<p>테스트 내용입니다.</p>"
      />,
    );

    // 뉴스레터 제목이 표시되는지 확인
    expect(screen.getByText("테스트 뉴스레터")).toBeInTheDocument();

    // 날짜가 표시되는지 확인 (formatDate 함수에 의해 포맷팅됨)
    expect(screen.getByText(/2023년 4월 1일/)).toBeInTheDocument();

    // DUCK HERALD 표시 확인
    expect(screen.getByText("DUCK HERALD")).toBeInTheDocument();

    console.log("뉴스레터 아이템 기본 렌더링 테스트 완료");
  });

  // 내용 렌더링 테스트
  test("내용이 HTML로 정상적으로 렌더링되어야 함", () => {
    const { container } = render(
      <NewsletterItem
        title="HTML 테스트"
        created_at="2023-04-01T12:00:00"
        content="<p>테스트 <strong>내용</strong>입니다.</p>"
      />,
    );

    // HTML 내용이 렌더링되는지 확인 (dangerouslySetInnerHTML 사용)
    // container.querySelector를 사용하여 실제 DOM에 렌더링된 HTML 확인
    const paragraph = container.querySelector("p");
    expect(paragraph).toBeInTheDocument();
    expect(paragraph?.innerHTML).toContain("<strong>내용</strong>");

    console.log("HTML 내용 렌더링 테스트 완료");
  });

  // 날짜 포맷팅 테스트
  test("날짜가 올바른 형식으로 포맷팅되어야 함", () => {
    render(
      <NewsletterItem
        title="날짜 테스트"
        created_at="2023-12-25T15:30:00"
        content="<p>크리스마스 내용</p>"
      />,
    );

    // 날짜가 한국어 형식으로 포맷팅되었는지 확인
    expect(screen.getByText(/2023년 12월 25일/)).toBeInTheDocument();

    console.log("날짜 포맷팅 테스트 완료");
  });
});
