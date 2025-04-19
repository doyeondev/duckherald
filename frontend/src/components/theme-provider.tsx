"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

/**
 * 테마 프로바이더 컴포넌트
 *
 * 라이트/다크 테마 전환 기능을 제공하는 컨텍스트 프로바이더
 * next-themes 라이브러리를 활용하여 테마 상태 관리
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
