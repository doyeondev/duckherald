"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // 컴포넌트 마운트 시 로컬 스토리지에서 토큰 확인
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("authToken");

      if (token) {
        console.log("기존 인증 토큰 발견:", token.substring(0, 20) + "...");
        // 토큰 존재 여부만 확인하여 인증 상태 설정 (실제 검증은 API 호출 시 수행)
        setIsAuthenticated(true);
      } else {
        console.log("인증 토큰이 없습니다. 로그인이 필요합니다.");
        setIsAuthenticated(false);
      }
    }
  }, []);

  const login = (token: string) => {
    try {
      console.log("인증 처리 시작 - 토큰 저장 전:", token.substring(0, 20) + "...");
      localStorage.setItem("authToken", token);
      console.log("새 인증 토큰 저장 완료:", token.substring(0, 20) + "...");
      setIsAuthenticated(true);
    } catch (err) {
      console.error("토큰 저장 중 오류 발생:", err);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("authToken");
      console.log("인증 토큰 삭제 (로그아웃)");
      setIsAuthenticated(false);
      router.push("/admin");
    } catch (err) {
      console.error("로그아웃 처리 중 오류 발생:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
