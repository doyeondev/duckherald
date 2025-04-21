/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "",
        pathname: "**",
      },
    ],
  },
  // compiler: {
  // 	removeConsole: true, // production 에서 console 제거
  // },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
    ];
  },

  // 'sentry' 키는 Next.js에서 직접 지원하지 않음 - 제거
  /* config options here */
};

// Sentry 웹팩 플러그인 옵션
const sentryWebpackPluginOptions = {
  // 조직 설정
  org: "do-yeon",
  project: "duckherald-frontend",

  // 소스맵 업로드 설정
  // 주의: 토큰이 없는 경우 dryRun 모드로 실행
  dryRun: process.env.SENTRY_AUTH_TOKEN ? false : true,
  silent: false, // 콘솔에 로그 출력

  // 성능 최적화
  transpileClientSDK: true,
  // 디버그 모드 (필요시 활성화)
  debug: false,
};

// Sentry 설정 적용 - 테스트 환경에서는 건너뛰기
module.exports =
  // 테스트 모드이거나 Sentry DSN이 없으면 Sentry 설정을 적용하지 않음
  process.env.NODE_ENV === "test" || !process.env.NEXT_PUBLIC_SENTRY_DSN_FRONTEND
    ? nextConfig
    : withSentryConfig(nextConfig, sentryWebpackPluginOptions);
