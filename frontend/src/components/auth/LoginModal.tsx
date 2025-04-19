import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/components/auth/AuthProvider";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (token: string) => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();

    // API 기본 URL 설정
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        console.log('로그인 시도:', { email, password });

        try {
            const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log('로그인 응답 상태:', response.status);
            const data = await response.json();
            console.log('로그인 응답 데이터:', data);

            if (!response.ok) {
                console.error('로그인 실패:', data);
                setError(data.message || '로그인에 실패했습니다.');
                setIsLoading(false);
                return;
            }

            console.log('로그인 성공! 토큰 저장 및, 모달 닫기, 컨텍스트 업데이트');

            // 로그인 성공 시 토큰 저장 및 상태 업데이트
            if (data.token) {
                console.log('토큰 저장:', data.token.substring(0, 20) + '...');
                localStorage.setItem('authToken', data.token);

                if (data.user) {
                    console.log('사용자 정보:', data.user);
                }

                login(data.token);
                onLoginSuccess(data.token);
            } else {
                console.error('토큰이 없음:', data);
                setError('로그인은 성공했으나 토큰이 없습니다.');
            }
        } catch (err) {
            console.error('로그인 요청 중 오류 발생:', err);
            setError('로그인 처리 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen}>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-2xl">관리자 로그인</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">이메일</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@duckherald.com"
                            className="bg-white dark:bg-gray-700"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">비밀번호</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white dark:bg-gray-700"
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isLoading}
                    >
                        {isLoading ? "로그인 중..." : "로그인"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
