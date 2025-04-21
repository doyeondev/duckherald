// Jest 설정 파일
// Next.js 프로젝트를 위한 Jest 설정
// 테스트 환경: jsdom (브라우저 환경 시뮬레이션)
// 모듈/파일 변환: babel-jest를 사용하여 TS/TSX 파일 변환
// setupFilesAfterEnv: @testing-library/jest-dom의 매처(matcher) 확장 기능 추가

const nextJest = require("next/jest");
const path = require("path");

const createJestConfig = nextJest({
  // Next.js 앱의 경로 지정
  dir: "./",
});

// Jest에 전달할 사용자 정의 설정
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    // src 폴더 내부의 모듈 경로 별칭 처리
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/app/api/**",
  ],
  // TypeScript 인식을 위한 변환기 설정
  transform: {
    "^.+\\.(ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  // 테스트 결과 출력 형식 설정
  verbose: true,
  // 테스트 실행 시간 측정
  testTimeout: 10000,
  // 테스트 실행 전 콘솔 메시지 지우기
  clearMocks: true,
  // 테스트 파일 패턴 설정
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  // 테스트 실행 후 결과 저장 설정
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: path.resolve(__dirname, "..", "_test_log", "frontend"),
        outputName: `frontend-test-results-${new Date().toISOString().replace(/:/g, "-")}.xml`,
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
        ancestorSeparator: " › ",
      },
    ],
  ],
  // 커버리지 리포트 저장 경로
  coverageDirectory: path.resolve(__dirname, "..", "_test_log", "frontend", "coverage"),
};

// createJestConfig를 내보내 Next.js의 설정을 Jest에 적용
module.exports = createJestConfig(customJestConfig);
