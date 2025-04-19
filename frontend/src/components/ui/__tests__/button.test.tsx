// button.test.tsx
// Button 컴포넌트 테스트
// 테스트 항목:
// 1. 기본 렌더링 확인
// 2. 다양한 버튼 variant 테스트
// 3. 다양한 버튼 크기 테스트
// 4. 비활성화 상태 테스트
// 5. 클릭 이벤트 테스트

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../button";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

describe("Button", () => {
  // 기본 렌더링 테스트
  test("버튼이 정상적으로 렌더링되어야 함", () => {
    render(<Button>버튼 텍스트</Button>);

    const button = screen.getByRole("button", { name: /버튼 텍스트/i });
    expect(button).toBeInTheDocument();

    // 기본 스타일 클래스가 적용되어 있는지 확인
    expect(button).toHaveClass("bg-primary");

    console.log("기본 렌더링 테스트 완료");
  });

  // 버튼 variant 테스트
  test("버튼의 다양한 variant가 올바르게 적용되어야 함", () => {
    // 기본(default) variant
    const { rerender } = render(<Button>Default</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-primary");

    // Destructive variant
    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-destructive");

    // Outline variant
    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button")).toHaveClass("border");

    // Secondary variant
    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-secondary");

    // Ghost variant
    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button")).toHaveClass("hover:bg-accent");

    // Link variant
    rerender(<Button variant="link">Link</Button>);
    expect(screen.getByRole("button")).toHaveClass("text-primary");

    console.log("버튼 variant 테스트 완료");
  });

  // 버튼 크기 테스트
  test("버튼의 다양한 크기가 올바르게 적용되어야 함", () => {
    // 기본(default) 크기
    const { rerender } = render(<Button>Default Size</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-10 px-4 py-2");

    // Small 크기
    rerender(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-9 px-3");

    // Large 크기
    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-11 px-8");

    // Icon 크기
    rerender(<Button size="icon">Icon</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-10 w-10");

    console.log("버튼 크기 테스트 완료");
  });

  // 비활성화 상태 테스트
  test("비활성화된 버튼이 올바르게 동작해야 함", () => {
    const handleClick = jest.fn();

    render(
      <Button disabled onClick={handleClick}>
        비활성화 버튼
      </Button>,
    );

    const button = screen.getByRole("button", { name: /비활성화 버튼/i });

    // 비활성화 속성이 적용되었는지 확인
    expect(button).toBeDisabled();

    // 비활성화된 버튼을 클릭해도 핸들러가 호출되지 않아야 함
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();

    console.log("비활성화 상태 테스트 완료");
  });

  // 클릭 이벤트 테스트
  test("버튼 클릭 시 onClick 핸들러가 호출되어야 함", async () => {
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>클릭 버튼</Button>);

    // 사용자 이벤트 설정
    const user = userEvent.setup();

    // 버튼 클릭
    const button = screen.getByRole("button", { name: /클릭 버튼/i });
    await user.click(button);

    // onClick 핸들러가 호출되었는지 확인
    expect(handleClick).toHaveBeenCalledTimes(1);

    console.log("클릭 이벤트 테스트 완료");
  });

  // 추가 className 테스트
  test("추가 className이 올바르게 적용되어야 함", () => {
    render(<Button className="custom-class">추가 클래스</Button>);

    const button = screen.getByRole("button", { name: /추가 클래스/i });
    expect(button).toHaveClass("custom-class");

    console.log("추가 className 테스트 완료");
  });
});
