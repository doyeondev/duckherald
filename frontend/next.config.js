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

  // Sentry 관련 Next.js 설정
  sentry: {
    // 웹팩 플러그인 비활성화 (필요시 활성화)
    disableServerWebpackPlugin: false,
    disableClientWebpackPlugin: false,
    // 소스맵 업로드
    hideSourceMaps: false,
    // 오류 페이지
    tunnelRoute: "/monitoring-tunnel",
  },
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

// Sentry 설정 적용
module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN_FRONTEND
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
