"use client";

import "./globals.css";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import ErrorReporter from "@/components/ErrorReporter";
import { ErrorBoundary } from "@sentry/nextjs";

// 'use client' 디렉티브가 있는 파일에서는 metadata를 export할 수 없음.
// 대신 head 태그 내에서 직접 메타 정보를 설정.

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <title>Duck Herald - K-POP 뉴스레터</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="K-POP 최신 소식, 독점 인터뷰, 이벤트 정보를 전하는 프리미엄 뉴스레터 서비스"
        />
        <meta
          name="keywords"
          content="K-POP, 뉴스레터, 음악, 아이돌, 엔터테인먼트, 콘서트, 팬미팅"
        />
        <meta name="author" content="Duck Herald Team" />
        <meta name="creator" content="Duck Herald" />
        <meta name="publisher" content="Duck Herald" />
        <link rel="icon" href="/icons/character.png" />
        <link rel="apple-touch-icon" href="/icons/character.png" />
        <link rel="shortcut icon" type="image/png" href="/icons/character.png" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
              <ErrorReporter />
              <main className="relative">{children}</main>
            </ErrorBoundary>
            <Toaster />
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
