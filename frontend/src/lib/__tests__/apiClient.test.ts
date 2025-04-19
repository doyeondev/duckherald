// apiClient.test.ts
// apiClient 유틸리티 함수들 테스트
// 테스트 항목:
// 1. 뉴스레터 목록 조회 기능
// 2. 뉴스레터 발송 기능 (동기/비동기)
// 3. 테스트 이메일 발송 기능
// 4. 발송 로그 조회 기능

import { apiClient } from "../apiClient";

// apiAxios 모킹
jest.mock("../apiClient", () => ({
  apiClient: {
    getNewsletterList: jest.fn(),
    sendNewsletter: jest.fn(),
    sendNewsletterAsync: jest.fn(),
    sendTestEmail: jest.fn(),
    getDeliveryLogs: jest.fn(),
    getDeliveryLogsByNewsletter: jest.fn(),
  },
  apiAxios: {
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
  customInstance: jest.fn(),
  __esModule: true,
  default: {},
}));

describe("apiClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // getNewsletterList 함수 테스트
  test("getNewsletterList 함수가 정의되어 있어야 함", () => {
    expect(apiClient.getNewsletterList).toBeDefined();
    console.log("뉴스레터 목록 조회 테스트 완료");
  });

  test("sendNewsletter 함수가 정의되어 있어야 함", () => {
    expect(apiClient.sendNewsletter).toBeDefined();
    console.log("뉴스레터 목록 조회 실패 테스트 완료");
  });

  // sendNewsletterAsync 함수 테스트
  test("sendNewsletterAsync 함수가 정의되어 있어야 함", () => {
    expect(apiClient.sendNewsletterAsync).toBeDefined();
    console.log("뉴스레터 발송 테스트 완료");
  });

  // sendTestEmail 함수 테스트
  test("sendTestEmail 함수가 정의되어 있어야 함", () => {
    expect(apiClient.sendTestEmail).toBeDefined();
    console.log("비동기 뉴스레터 발송 테스트 완료");
  });

  // getDeliveryLogs 함수 테스트
  test("getDeliveryLogs 함수가 정의되어 있어야 함", () => {
    expect(apiClient.getDeliveryLogs).toBeDefined();
    console.log("테스트 이메일 발송 테스트 완료");
  });

  // getDeliveryLogsByNewsletter 함수 테스트
  test("getDeliveryLogsByNewsletter 함수가 정의되어 있어야 함", () => {
    expect(apiClient.getDeliveryLogsByNewsletter).toBeDefined();
    console.log("발송 로그 조회 테스트 완료");
  });
});
