"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  UsersIcon,
  ArrowPathIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  FunnelIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

// shadcn UI 컴포넌트
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Subscriber {
  id: number;
  email: string;
  status: string;
  createdAt: string;
  confirmedAt?: string;
}

const SubscribersPage = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [includeDeleted, setIncludeDeleted] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [subscriberCount, setSubscriberCount] = useState({
    all: 0,
    active: 0,
    pending: 0,
    deleted: 0,
  });

  // 구독자 목록 로드 함수
  const loadSubscribers = async (includeDeleted: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:8080/api/admin/subscribers?includeDeleted=${includeDeleted}`,
      );
      console.log("구독자 목록 로드:", response.data);

      const allSubscribers = response.data;
      setSubscribers(allSubscribers);

      // 구독자 카운트 업데이트
      const counts = {
        all: allSubscribers.length,
        active: allSubscribers.filter((s: Subscriber) => s.status === "ACTIVE")
          .length,
        pending: allSubscribers.filter(
          (s: Subscriber) => s.status === "PENDING",
        ).length,
        deleted: allSubscribers.filter(
          (s: Subscriber) => s.status === "DELETED",
        ).length,
      };
      setSubscriberCount(counts);
    } catch (err) {
      console.error("Error fetching subscribers:", err);
      setError("구독자 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 실행
  useEffect(() => {
    loadSubscribers(includeDeleted);
  }, [includeDeleted]); // includeDeleted 값이 변경될 때마다 다시 로드

  const handleDelete = async (id: number) => {
    if (!confirm("정말 이 구독자를 삭제하시겠습니까?")) return;

    setActionLoading(id);
    try {
      await axios.delete(`http://localhost:8080/api/admin/subscribers/${id}`);

      // 목록 새로고침 (삭제된 항목이 표시되도록 includeDeleted 유지)
      await loadSubscribers(includeDeleted);

      // 성공 메시지 설정
      setSuccessMessage("구독자가 성공적으로 삭제되었습니다.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error deleting subscriber:", err);
      setError("구독자 삭제 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(null);
    }
  };

  // 필터 변경 핸들러
  const handleFilterChange = (value: string) => {
    setFilter(value);

    // 삭제된 항목은 'deleted' 필터에서만 포함
    if (value === "deleted") {
      setIncludeDeleted(true);
    } else if (value === "all") {
      // '전체' 필터에서는 체크박스 설정에 따름 (변경 없음)
    } else {
      // 'active'와 'pending' 필터에서는 삭제된 항목 제외
      setIncludeDeleted(false);
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    // YY-MM-DD, 오전/오후 HH:MM 형식
    const year = date.getFullYear().toString().substring(2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "오후" : "오전";
    const hour12 = hours % 12 || 12;

    return `${year}-${month}-${day}, ${ampm} ${hour12}:${minutes}`;
  };

  // 필터링된 구독자 목록 계산
  const filteredSubscribers =
    filter === "all"
      ? subscribers
      : filter === "active"
        ? subscribers.filter((s) => s.status === "ACTIVE")
        : filter === "pending"
          ? subscribers.filter((s) => s.status === "PENDING")
          : subscribers.filter((s) => s.status === "DELETED");

  // 상태 아이콘 컴포넌트
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircleIcon className="h-4 w-4 text-green-600 mr-1" />;
      case "PENDING":
        return <ClockIcon className="h-4 w-4 text-yellow-600 mr-1" />;
      case "DELETED":
        return <XCircleIcon className="h-4 w-4 text-red-600 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-page container max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">구독자 관리</h1>
          <p className="text-gray-500 mt-2">
            총 {subscriberCount.all}명의 구독자를 관리하고 분석하세요
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadSubscribers(includeDeleted)}
          disabled={loading}
        >
          <ArrowPathIcon
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          새로고침
        </Button>
      </div>

      {/* 성공/에러 메시지 표시 */}
      {successMessage && (
        <Alert variant="success" className="mb-6">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 구독자 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              총 구독자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <UsersIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-2xl font-bold">{subscriberCount.all}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              활성 구독자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-2xl font-bold">
                {subscriberCount.active}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              대기 중인 구독자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-2xl font-bold">
                {subscriberCount.pending}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              삭제된 구독자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-2xl font-bold">
                {subscriberCount.deleted}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <CardTitle className="flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2" />
              구독자 필터링
            </CardTitle>

            <div className="flex items-center">
              <Switch
                id="include-deleted"
                checked={includeDeleted}
                onCheckedChange={setIncludeDeleted}
                className="mr-2"
              />
              <label
                htmlFor="include-deleted"
                className="text-sm text-gray-700 cursor-pointer"
              >
                삭제된 구독자 포함
              </label>
            </div>
          </div>

          <div className="mt-2">
            <Tabs
              defaultValue="all"
              value={filter}
              onValueChange={handleFilterChange}
            >
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all" className="gap-1">
                  <UsersIcon className="h-4 w-4" />
                  <span>전체 ({subscriberCount.all})</span>
                </TabsTrigger>
                <TabsTrigger value="active" className="gap-1">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>활성 ({subscriberCount.active})</span>
                </TabsTrigger>
                <TabsTrigger value="pending" className="gap-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>대기 ({subscriberCount.pending})</span>
                </TabsTrigger>
                <TabsTrigger value="deleted" className="gap-1">
                  <XCircleIcon className="h-4 w-4" />
                  <span>삭제됨 ({subscriberCount.deleted})</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <ArrowPathIcon className="h-12 w-12 animate-spin text-gray-400" />
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <EnvelopeIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">표시할 구독자가 없습니다</p>
              <p className="text-sm mt-1">
                필터 설정을 변경하거나 새로고침을 시도해보세요
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[300px]">이메일</TableHead>
                  <TableHead className="w-32 text-center">상태</TableHead>
                  <TableHead className="w-44">구독일</TableHead>
                  <TableHead className="w-44">확인일</TableHead>
                  <TableHead className="w-32">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.map((subscriber) => (
                  <TableRow
                    key={subscriber.id}
                    className="group hover:bg-slate-50"
                  >
                    <TableCell className="font-medium">
                      {subscriber.email}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          subscriber.status === "ACTIVE"
                            ? "success"
                            : subscriber.status === "PENDING"
                              ? "outline"
                              : "destructive"
                        }
                        className="inline-flex items-center justify-center"
                      >
                        <StatusIcon status={subscriber.status} />
                        {subscriber.status === "ACTIVE"
                          ? "활성"
                          : subscriber.status === "PENDING"
                            ? "대기"
                            : "삭제됨"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(subscriber.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {subscriber.confirmedAt
                        ? formatDate(subscriber.confirmedAt)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(subscriber.id)}
                        disabled={
                          actionLoading === subscriber.id ||
                          subscriber.status === "DELETED"
                        }
                        className="inline-flex items-center justify-center border-red-200 bg-red-50 hover:bg-red-100 text-red-700 w-20"
                      >
                        {actionLoading === subscriber.id ? (
                          <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <TrashIcon className="h-4 w-4 mr-1" />
                        )}
                        삭제
                      </Button>
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

export default SubscribersPage;
