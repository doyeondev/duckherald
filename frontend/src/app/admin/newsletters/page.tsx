"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  RocketLaunchIcon,
  CalendarIcon,
  ClockIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

// shadcn 컴포넌트 가져오기
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Newsletter {
  id: number;
  title: string;
  status: string;
  createdAt: string;
  publishedAt: string | null;
}

const NewslettersPage = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [filteredNewsletters, setFilteredNewsletters] = useState<Newsletter[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL"); // 상태 필터 (ALL, DRAFT, PUBLISHED)
  const [searchTerm, setSearchTerm] = useState<string>(""); // 검색어

  // 뉴스레터 목록 가져오기
  const fetchNewsletters = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/newsletters");

      // 최신순 정렬 (생성일 기준)
      const sortedNewsletters = response.data.sort(
        (a: Newsletter, b: Newsletter) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        },
      );

      console.log("뉴스레터 목록 로드:", sortedNewsletters);
      setNewsletters(sortedNewsletters);
      applyFilters(sortedNewsletters, statusFilter, searchTerm);
      setError(null);
    } catch (err) {
      console.error("Error fetching newsletters:", err);
      setError("뉴스레터 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsletters();
  }, []);

  // 필터 적용 함수
  const applyFilters = (
    newsletters: Newsletter[],
    status: string,
    search: string,
  ) => {
    let filtered = [...newsletters];

    // 상태 필터 적용
    if (status !== "ALL") {
      filtered = filtered.filter((newsletter) => newsletter.status === status);
    }

    // 검색어 필터 적용
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((newsletter) =>
        newsletter.title.toLowerCase().includes(searchLower),
      );
    }

    setFilteredNewsletters(filtered);
  };

  // 상태 필터 변경 시
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    applyFilters(newsletters, value, searchTerm);
  };

  // 검색어 변경 시
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(newsletters, statusFilter, value);
  };

  // 뉴스레터 발행
  const handlePublish = async (id: number) => {
    setActionLoading(id);
    try {
      await axios.post(
        `http://localhost:8080/api/admin/newsletters/${id}/publish`,
      );
      await fetchNewsletters();
      // 성공 메시지 표시
      setError(`뉴스레터가 성공적으로 발행되었습니다.`);
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error("Error publishing newsletter:", err);
      setError("뉴스레터 발행 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  // 뉴스레터 삭제
  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    setActionLoading(id);
    try {
      await axios.delete(`http://localhost:8080/api/admin/newsletters/${id}`);

      // 삭제 후 목록 업데이트 (삭제된 항목 제외)
      const updatedNewsletters = newsletters.filter(
        (newsletter) => newsletter.id !== id,
      );
      setNewsletters(updatedNewsletters);
      applyFilters(updatedNewsletters, statusFilter, searchTerm);

      // 성공 메시지 표시
      setError(`뉴스레터가 삭제되었습니다.`);
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error("Error deleting newsletter:", err);
      setError("뉴스레터 삭제 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  // 날짜 포맷팅 함수 수정 - "YY-MM-DD, 오전/오후 HH:MM" 형식으로 변경
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    // 년-월-일
    const year = date.getFullYear().toString().substring(2); // YY
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // MM
    const day = date.getDate().toString().padStart(2, "0"); // DD

    // 시간
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "오후" : "오전";
    const hour12 = hours % 12 || 12; // 12시간제로 변환

    return `${year}-${month}-${day}, ${ampm} ${hour12}:${minutes}`;
  };

  return (
    <div className="admin-page container max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">뉴스레터 관리</h1>
          <p className="text-gray-500 mt-2">
            모든 뉴스레터를 관리하고 새 콘텐츠를 발행하세요
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNewsletters}
            disabled={loading}
          >
            <ArrowPathIcon
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            새로고침
          </Button>

          {/* Fragment 오류 해결: Link로 Button을 감싸는 방식으로 변경 */}
          <Link href="/admin/newsletters/create">
            <Button
              size="sm"
              variant="outline"
              className="inline-flex items-center gap-2 bg-green-100"
            >
              <PlusIcon className="h-4 w-4" />새 뉴스레터 작성
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert
          variant={error.includes("성공") ? "success" : "destructive"}
          className="mb-6"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>뉴스레터 목록</CardTitle>

            <div className="flex flex-col md:flex-row gap-3">
              {/* 검색 기능 */}
              <div className="relative w-full md:w-64">
                <Input
                  type="text"
                  placeholder="제목으로 검색..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-8"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* 상태 필터링 */}
              <Select
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="w-full md:w-40">
                  <FunnelIcon className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="DRAFT">초안</SelectItem>
                  <SelectItem value="PUBLISHED">발행됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <ArrowPathIcon className="h-12 w-12 animate-spin text-gray-400" />
            </div>
          ) : filteredNewsletters.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="mx-auto w-16 h-16 mb-4 border-2 rounded-full flex items-center justify-center border-dashed border-gray-300">
                <PlusIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium">표시할 뉴스레터가 없습니다</p>
              <p className="text-sm mt-1">새 뉴스레터를 작성하여 시작하세요</p>

              {/* Fragment 오류 해결: Link로 Button을 감싸는 방식으로 변경 */}
              <Link
                href="/admin/newsletters/create"
                className="mt-4 inline-block"
              >
                <Button variant="outline">새 뉴스레터 작성</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>제목</TableHead>
                  <TableHead className="w-24 text-center">상태</TableHead>
                  <TableHead className="w-44">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      생성일
                    </div>
                  </TableHead>
                  <TableHead className="w-44">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      발행일
                    </div>
                  </TableHead>
                  <TableHead className="w-68">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNewsletters.map((newsletter) => (
                  <TableRow
                    key={newsletter.id}
                    className="group hover:bg-slate-50"
                  >
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/newsletters/edit/${newsletter.id}`}
                        className="text-blue-600 hover:underline transition-colors"
                      >
                        {newsletter.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          newsletter.status === "PUBLISHED"
                            ? "success"
                            : "outline"
                        }
                        className="font-medium"
                      >
                        {newsletter.status === "PUBLISHED" ? "발행됨" : "초안"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(newsletter.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {newsletter.publishedAt
                        ? formatDate(newsletter.publishedAt)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {/* 버튼들을 가로로 정렬하고 일관된 순서로 배치 */}
                      <div className="flex flex-row gap-2">
                        {/* 1. 발행 버튼 (항상 같은 위치에 표시, 필요 없을 때는 투명 플레이스홀더로 대체) */}
                        {newsletter.status !== "PUBLISHED" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePublish(newsletter.id)}
                            disabled={actionLoading === newsletter.id}
                            className="inline-flex items-center justify-center border-green-200 bg-green-50 hover:bg-green-100 text-green-700 w-20" // 너비 고정
                          >
                            {actionLoading === newsletter.id ? (
                              <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <RocketLaunchIcon className="h-4 w-4 mr-1" />
                            )}
                            발행
                          </Button>
                        ) : (
                          // 발행됨 상태일 때는 빈 자리 확보 (투명 플레이스홀더)
                          <div className="w-20"></div> // 동일한 너비의 빈 공간으로 자리 유지
                        )}

                        {/* 2. 편집 버튼 (항상 중앙에 배치) */}
                        <Link href={`/admin/newsletters/edit/${newsletter.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="inline-flex items-center justify-center border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 w-20" // 너비 고정
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            편집
                          </Button>
                        </Link>

                        {/* 3. 삭제 버튼 (항상 오른쪽에 배치) */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(newsletter.id)}
                          disabled={actionLoading === newsletter.id}
                          className="inline-flex items-center justify-center border-red-200 bg-red-50 hover:bg-red-100 text-red-700 w-20" // 너비 고정
                        >
                          {actionLoading === newsletter.id ? (
                            <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <TrashIcon className="h-4 w-4 mr-1" />
                          )}
                          삭제
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewslettersPage;
