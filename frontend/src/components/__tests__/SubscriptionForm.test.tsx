// SubscriptionForm.test.tsx
// SubscriptionForm 컴포넌트 테스트
// 테스트 항목:
// 1. 컴포넌트가 정상적으로 렌더링되는지 확인
// 2. 이메일 입력 시 상태가 업데이트되는지 확인
// 3. 폼 제출 시 API 호출이 이루어지는지 확인
// 4. 성공/실패 메시지가 정상적으로 표시되는지 확인

import React from "react";
import { render } from "@testing-library/react";
import { screen, fireEvent, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import SubscriptionForm from "../SubscriptionForm";
import axios from "axios";
import "@testing-library/jest-dom"; // 명시적으로 추가

// axios 모킹
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("SubscriptionForm", () => {
  beforeEach(() => {
    // 각 테스트 전에 모킹 초기화
    jest.clearAllMocks();
  });

  // 기본 렌더링 테스트
  test("컴포넌트가 렌더링 되어야 함", () => {
    render(<SubscriptionForm />);

    // 이메일 입력창과 버튼이 존재하는지 확인
    expect(
      screen.getByPlaceholderText(/이메일 주소를 입력하세요/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /구독하기/i }),
    ).toBeInTheDocument();

    // 콘솔 로그를 통해 확인
    console.log("기본 폼이 정상적으로 렌더링됨");
  });

  // 이메일 입력 테스트
  test("이메일 입력 필드가 변경되면 상태가 업데이트되어야 함", async () => {
    render(<SubscriptionForm />);
    const inputElement = screen.getByPlaceholderText(
      /이메일 주소를 입력하세요/i,
    ) as HTMLInputElement;

    // 사용자 이벤트 생성
    const user = userEvent.setup();

    // 이메일 입력
    await user.type(inputElement, "test@example.com");

    // 입력된 값이 반영되었는지 확인
    expect(inputElement.value).toBe("test@example.com");
    console.log("이메일 입력 시 상태가 정상적으로 업데이트됨");
  });

  // 폼 제출 성공 테스트 - 타임아웃 증가 및 안정화
  test("폼 제출 성공 시 성공 메시지가 표시되어야 함", async () => {
    // axios 응답 모킹
    mockedAxios.post.mockResolvedValueOnce({
      data: { success: true },
      status: 200
    });

    render(<SubscriptionForm />);

    // 이메일 입력 및 제출 - fireEvent 사용으로 변경
    const inputElement = screen.getByPlaceholderText(/이메일 주소를 입력하세요/i) as HTMLInputElement;
    fireEvent.change(inputElement, { target: { value: "test@example.com" } });

    // 입력값 확인
    expect(inputElement.value).toBe("test@example.com");

    // 폼 제출
    const submitButton = screen.getByRole("button", { name: /구독하기/i });
    fireEvent.click(submitButton);

    // API 호출 확인
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/api/subscribers/subscribe",
      { email: "test@example.com" },
    );

    // 성공 메시지 확인 - 타임아웃 증가 및 디버깅 정보 추가
    await waitFor(() => {
      const successMessage = screen.queryByText(/구독 신청이 완료되었습니다/i);
      console.log("성공 메시지 표시 여부:", !!successMessage);
      expect(successMessage).toBeInTheDocument();
    }, { timeout: 3000 });

    console.log("폼 제출 성공 시 API 호출 및 성공 메시지 표시 확인");
  });

  // 폼 제출 실패 테스트 - 에러 객체 수정 및 타임아웃 증가
  test("폼 제출 실패 시 에러 메시지가 표시되어야 함", async () => {
    // axios 에러 응답 모킹 (이미 구독 중인 경우)
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 409,
        data: { message: "이미 구독 중인 이메일입니다" }
      },
    });

    render(<SubscriptionForm />);

    // 이메일 입력 및 제출 - fireEvent 사용으로 변경
    const inputElement = screen.getByPlaceholderText(/이메일 주소를 입력하세요/i) as HTMLInputElement;
    fireEvent.change(inputElement, { target: { value: "existing@example.com" } });

    // 폼 제출
    const submitButton = screen.getByRole("button", { name: /구독하기/i });
    fireEvent.click(submitButton);

    // 에러 메시지 확인 - 타임아웃 증가 및 디버깅 정보 추가
    await waitFor(() => {
      const errorMessage = screen.queryByText(/이미 구독 중인 이메일입니다/i);
      console.log("에러 메시지 표시 여부:", !!errorMessage);
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 3000 });

    console.log("폼 제출 실패 시 에러 메시지 표시 확인");
  });
});
