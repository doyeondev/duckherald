"use client";

import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/AuthProvider";

/**
 * 관리자 페이지의 루트 레이아웃
 *
 * 모든 관리자 페이지에 적용되는 레이아웃 컴포넌트입니다.
 * 사이드바, 네비게이션, 통일된 스타일을 제공합니다.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayout>{children}</AdminLayout>
      <Toaster />
    </AuthProvider>
  );
}
