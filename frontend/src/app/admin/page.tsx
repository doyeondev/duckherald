// 관리자 대시보드 페이지
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
    ArrowRightIcon,
    PencilIcon,
    NewspaperIcon,
    UsersIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/components/auth/AuthProvider";
import { LoginModal } from "@/components/auth/LoginModal";

// shadcn 컴포넌트 가져오기
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface NewsletterSummary {
    id: number;
    title: string;
    status: string;
    createdAt: string;
    publishedAt?: string;
}

interface DashboardData {
    newsletterCount: number;
    subscriberCount: number;
    recentNewsletters: NewsletterSummary[];
}

const AdminDashboard = () => {
    const { isAuthenticated, login } = useAuth();
    const [data, setData] = useState<DashboardData>({
        newsletterCount: 0,
        subscriberCount: 0,
        recentNewsletters: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // 페이지 로드 시 항상 토큰 확인
        const token = localStorage.getItem("authToken");
        console.log("대시보드 로드 시 토큰 확인:", token ? `${token.substring(0, 20)}...` : "없음");

        // 토큰이 있으면 데이터 가져오기
        if (token) {
            fetchDashboardData();
        }
    }, [isAuthenticated]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("authToken");
            console.log("API 호출에 사용되는 토큰:", token ? `${token.substring(0, 20)}...` : "없음");

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            // 인증 헤더 로깅
            console.log("인증 헤더:", headers);

            const [newslettersRes, subscribersRes] = await Promise.all([
                axios.get("http://localhost:8080/api/newsletters", { headers })
                    .catch(err => {
                        console.error("뉴스레터 데이터 가져오기 실패:", err);
                        setError(`뉴스레터 데이터 가져오기 실패: ${err.message}`);
                        return { data: [] };
                    }),
                axios.get("http://localhost:8080/api/admin/subscribers", { headers })
                    .catch(err => {
                        console.error("구독자 데이터 가져오기 실패:", err);
                        setError(`구독자 데이터 가져오기 실패: ${err.message}`);
                        return { data: [] };
                    })
            ]);

            // 응답 데이터 로깅
            console.log("뉴스레터 응답:", newslettersRes.data);
            console.log("구독자 응답:", subscribersRes.data);

            // 최신순 정렬 (생성일 기준)
            const sortedNewsletters = newslettersRes.data.sort((a: any, b: any) => {
                return (
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            });

            setData({
                newsletterCount: newslettersRes.data.length,
                subscriberCount: subscribersRes.data.length,
                recentNewsletters: sortedNewsletters.slice(0, 5),
            });
            console.log("대시보드 데이터 로드 완료:", sortedNewsletters);
            setLoading(false);
        } catch (err: any) {
            console.error("대시보드 데이터 로드 실패:", err);
            setError(`데이터를 불러오는데 실패했습니다: ${err.message}`);
            setLoading(false);
        }
    };

    const handleLoginSuccess = (token: string) => {
        console.log("로그인 성공, 토큰 저장:", token.substring(0, 20) + "...");
        login(token);
        // 로그인 성공 후 즉시 데이터 가져오기
        setTimeout(() => {
            fetchDashboardData();
        }, 500); // 토큰 저장 후 약간의 지연을 두고 데이터 가져오기
    };

    const handleCloseLoginModal = () => {
        // 로그인 모달을 닫을 때의 동작 (현재는 닫을 수 없지만 필수 prop)
        console.log("로그인 모달 닫기 시도 (현재 구현되지 않음)");
    };

    const handleRefresh = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("authToken");
            const headers = {
                Authorization: `Bearer ${token}`,
            };

            console.log("데이터 새로고침 중... 토큰:", token ? token.substring(0, 20) + "..." : "없음");

            const [newslettersRes, subscribersRes] = await Promise.all([
                axios.get("http://localhost:8080/api/newsletters", { headers })
                    .catch(err => {
                        console.error("뉴스레터 데이터 새로고침 실패:", err);
                        return { data: [] };
                    }),
                axios.get("http://localhost:8080/api/admin/subscribers", { headers })
                    .catch(err => {
                        console.error("구독자 데이터 새로고침 실패:", err);
                        return { data: [] };
                    })
            ]);

            // 최신순 정렬 (생성일 기준)
            const sortedNewsletters = newslettersRes.data.sort((a: any, b: any) => {
                return (
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            });

            setData({
                newsletterCount: newslettersRes.data.length,
                subscriberCount: subscribersRes.data.length,
                recentNewsletters: sortedNewsletters.slice(0, 5),
            });
            console.log("대시보드 데이터 새로고침 완료");
        } catch (err: any) {
            console.error("데이터 새로고침 실패:", err);
            setError(`데이터를 새로고침하는데 실패했습니다: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // 날짜 포맷팅 함수
    const formatDate = (dateString: string) => {
        if (!dateString) return "-";

        const date = new Date(dateString);
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // 로그인되지 않은 상태에서는 배경을 블러 처리하고 로그인 모달 표시
    if (!isAuthenticated) {
        return (
            <>
                <div className="filter blur-sm">
                    <div className="admin-page container max-w-5xl mx-auto px-4 py-8">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold">관리자 대시보드</h1>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={loading}
                            >
                                <ArrowPathIcon
                                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                                />
                                새로고침
                            </Button>
                        </div>

                        {error && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-xl">뉴스레터</CardTitle>
                                    <NewspaperIcon className="h-5 w-5 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-4xl font-bold text-blue-600">
                                        {loading ? "로딩 중..." : data.newsletterCount}
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Link href="/admin/newsletters">
                                        <Button
                                            variant="ghost"
                                            className="flex items-center bg-gray-300/50 font-semibold"
                                        >
                                            뉴스레터 관리 <ArrowRightIcon className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-xl">구독자</CardTitle>
                                    <UsersIcon className="h-5 w-5 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-4xl font-bold text-green-600">
                                        {loading ? "로딩 중..." : data.subscriberCount}
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Link href="/admin/subscribers">
                                        <Button className="flex items-center bg-gray-300/50 font-semibold">
                                            구독자 관리 <ArrowRightIcon className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>최근 뉴스레터</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center items-center py-10">
                                        <ArrowPathIcon className="h-10 w-10 animate-spin text-gray-400" />
                                    </div>
                                ) : data.recentNewsletters.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">
                                        뉴스레터가 없습니다.
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>제목</TableHead>
                                                <TableHead>상태</TableHead>
                                                <TableHead>날짜</TableHead>
                                                <TableHead className="">작업</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.recentNewsletters.map((newsletter) => (
                                                <TableRow key={newsletter.id}>
                                                    <TableCell className="font-medium">
                                                        {newsletter.title}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                newsletter.status === "PUBLISHED"
                                                                    ? "success"
                                                                    : "outline"
                                                            }
                                                        >
                                                            {newsletter.status === "PUBLISHED"
                                                                ? "발행됨"
                                                                : "초안"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(newsletter.createdAt)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Link
                                                            href={`/admin/newsletters/edit/${newsletter.id}`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="bg-gray-300/50 font-semibold flex items-center gap-2"
                                                            >
                                                                <PencilIcon className="h-4 w-4 mr-1" />
                                                                수정
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-center">
                                <Link href="/admin/newsletters">
                                    <Button variant="outline" className="flex items-center">
                                        모든 뉴스레터 보기
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
                <LoginModal
                    isOpen={true}
                    onLoginSuccess={handleLoginSuccess}
                    onClose={handleCloseLoginModal}
                />
            </>
        );
    }

    return (
        <div className="admin-page container max-w-5xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">관리자 대시보드</h1>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    <ArrowPathIcon
                        className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                    />
                    새로고침
                </Button>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xl">뉴스레터</CardTitle>
                        <NewspaperIcon className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-blue-600">
                            {loading ? "로딩 중..." : data.newsletterCount}
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Link href="/admin/newsletters">
                            <Button
                                variant="ghost"
                                className="flex items-center bg-gray-300/50 font-semibold"
                            >
                                뉴스레터 관리 <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xl">구독자</CardTitle>
                        <UsersIcon className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-green-600">
                            {loading ? "로딩 중..." : data.subscriberCount}
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Link href="/admin/subscribers">
                            <Button className="flex items-center bg-gray-300/50 font-semibold">
                                구독자 관리 <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>최근 뉴스레터</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <ArrowPathIcon className="h-10 w-10 animate-spin text-gray-400" />
                        </div>
                    ) : data.recentNewsletters.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            뉴스레터가 없습니다.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>제목</TableHead>
                                    <TableHead>상태</TableHead>
                                    <TableHead>날짜</TableHead>
                                    <TableHead className="">작업</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.recentNewsletters.map((newsletter) => (
                                    <TableRow key={newsletter.id}>
                                        <TableCell className="font-medium">
                                            {newsletter.title}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    newsletter.status === "PUBLISHED"
                                                        ? "success"
                                                        : "outline"
                                                }
                                            >
                                                {newsletter.status === "PUBLISHED" ? "발행됨" : "초안"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(newsletter.createdAt)}</TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/admin/newsletters/edit/${newsletter.id}`}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="bg-gray-300/50 font-semibold flex items-center gap-2"
                                                >
                                                    <PencilIcon className="h-4 w-4 mr-1" />
                                                    수정
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/admin/newsletters">
                        <Button variant="outline" className="flex items-center">
                            모든 뉴스레터 보기
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default AdminDashboard;
