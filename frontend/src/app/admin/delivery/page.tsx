"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  ArrowPathIcon,
  PaperAirplaneIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  publishedAt: string;
}

interface DeliveryLog {
  id: number;
  newsletterId: number;
  newsletterTitle: string;
  sentAt: string;
  status: string;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    failed: number;
  };
}

export default function DeliveryPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);
  const [selectedNewsletterId, setSelectedNewsletterId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "success" | "destructive";
    text: string;
  } | null>(null);

  // 발행된 뉴스레터 목록 가져오기
  useEffect(() => {
    const fetchNewsletters = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:8080/api/newsletters/published",
        );
        setNewsletters(response.data);
      } catch (error) {
        console.error("뉴스레터 가져오기 실패:", error);
        setMessage({
          type: "destructive",
          text: "발행된 뉴스레터를 불러오는데 실패했습니다.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletters();
  }, []);

  // 발송 기록 가져오기
  useEffect(() => {
    const fetchDeliveryLogs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:8080/api/delivery/logs",
        );
        setDeliveryLogs(response.data);
      } catch (error) {
        console.error("발송 기록 가져오기 실패:", error);
        // 발송 기록이 없는 경우는 오류가 아닐 수 있으므로 메시지 표시하지 않음
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryLogs();
  }, []);

  // 뉴스레터 발송 처리
  const handleSendNewsletter = async () => {
    if (!selectedNewsletterId) {
      setMessage({
        type: "destructive",
        text: "발송할 뉴스레터를 선택해주세요.",
      });
      return;
    }

    setSending(true);
    setMessage(null);

    const newsletterId = Number(selectedNewsletterId);
    console.log(`뉴스레터 발송 요청: ID=${newsletterId}`);

    try {
      // 요청 전송 및 응답 확인
      const response = await axios.post(
        `http://localhost:8080/api/delivery/newsletters/${newsletterId}/send`,
      );
      console.log("발송 응답:", response.data);

      setMessage({
        type: "success",
        text: "뉴스레터 발송이 성공적으로 요청되었습니다.",
      });

      // 발송 기록 새로고침
      const logsResponse = await axios.get(
        "http://localhost:8080/api/delivery/logs",
      );
      setDeliveryLogs(logsResponse.data);
    } catch (error: any) {
      console.error("뉴스레터 발송 실패:", error);
      // 더 상세한 오류 메시지
      const errorMessage =
        error.response?.data?.message ||
        "뉴스레터 발송 중 오류가 발생했습니다.";
      setMessage({ type: "destructive", text: errorMessage });
    } finally {
      setSending(false);
    }
  };

  // 대량 발송 비동기 처리
  const handleSendNewsletterAsync = async () => {
    if (!selectedNewsletterId) {
      setMessage({
        type: "destructive",
        text: "발송할 뉴스레터를 선택해주세요.",
      });
      return;
    }

    setSending(true);
    setMessage(null);

    try {
      await axios.post(
        `http://localhost:8080/api/delivery/newsletters/${selectedNewsletterId}/send-async`,
      );
      setMessage({
        type: "success",
        text: "뉴스레터 발송이 백그라운드에서 시작되었습니다.",
      });
    } catch (error) {
      console.error("뉴스레터 비동기 발송 실패:", error);
      setMessage({
        type: "destructive",
        text: "뉴스레터 발송 요청 중 오류가 발생했습니다.",
      });
    } finally {
      setSending(false);
    }
  };

  // 발송 통계 갱신
  const handleRefreshStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8080/api/delivery/logs",
      );
      setDeliveryLogs(response.data);
      setMessage({ type: "success", text: "발송 통계가 갱신되었습니다." });
    } catch (error) {
      console.error("발송 통계 갱신 실패:", error);
      setMessage({
        type: "destructive",
        text: "발송 통계 갱신 중 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">뉴스레터 발송 관리</h1>

      {message && (
        <Alert variant={message.type} className="mb-6">
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>뉴스레터 발송</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label
              htmlFor="newsletterSelect"
              className="block text-sm font-medium mb-2"
            >
              발송할 뉴스레터 선택
            </label>
            <Select
              value={selectedNewsletterId}
              onValueChange={setSelectedNewsletterId}
            >
              <SelectTrigger>
                <SelectValue placeholder="뉴스레터를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {newsletters.map((newsletter) => (
                  <SelectItem key={newsletter.id} value={String(newsletter.id)}>
                    {newsletter.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSendNewsletter}
              disabled={!selectedNewsletterId || sending}
            >
              {sending ? (
                <>
                  <ClockIcon className="mr-2 h-4 w-4 animate-spin" />
                  발송 중...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="mr-2 h-4 w-4" />
                  발송하기
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleSendNewsletterAsync}
              disabled={!selectedNewsletterId || sending}
            >
              비동기 발송 (대량 발송)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>발송 내역</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleRefreshStats}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            갱신
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <ClockIcon className="h-10 w-10 animate-spin text-gray-400" />
            </div>
          ) : deliveryLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>뉴스레터</TableHead>
                  <TableHead>발송일시</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>발송</TableHead>
                  <TableHead>열람</TableHead>
                  <TableHead>클릭</TableHead>
                  <TableHead>실패</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.id}</TableCell>
                    <TableCell>{log.newsletterTitle}</TableCell>
                    <TableCell>
                      {new Date(log.sentAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.status === "COMPLETED" ? "success" : "destructive"
                        }
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.stats.sent}</TableCell>
                    <TableCell>{log.stats.opened}</TableCell>
                    <TableCell>{log.stats.clicked}</TableCell>
                    <TableCell>{log.stats.failed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              발송 내역이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
