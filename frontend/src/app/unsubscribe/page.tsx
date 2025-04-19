"use client";

import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const UnsubscribePage = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage("이메일을 입력해주세요.");
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");
      await axios.post("http://localhost:8080/api/subscribers/unsubscribe", {
        email,
      });
      setStatus("success");
      setMessage("성공적으로 구독을 취소했습니다.");
      setEmail("");
    } catch (err) {
      console.error("Error unsubscribing:", err);
      setStatus("error");
      setMessage("구독 취소 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-purple-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-purple-800/30 bg-gradient-to-b from-gray-900/90 to-purple-900/40 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-6">
              <div className="h-12 w-12 rounded-full bg-purple-600/20 flex items-center justify-center">
                <Mail className="h-6 w-6 text-purple-300" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white text-center">
              뉴스레터 구독 취소
            </CardTitle>
            {status !== "success" && (
              <CardDescription className="text-gray-300 text-center mt-2">
                Duck Herald 뉴스레터 구독을 취소하려면 아래에 이메일 주소를
                입력해주세요
              </CardDescription>
            )}
          </CardHeader>

          <CardContent>
            {status === "success" ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center mb-2">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <AlertTitle className="text-green-400 text-lg font-medium">
                  구독이 취소되었습니다
                </AlertTitle>
                <AlertDescription className="text-gray-300">
                  <p className="mb-4">
                    Duck Herald 뉴스레터 구독이 성공적으로 취소되었습니다.
                  </p>
                  <p>마음이 바뀌면 언제든지 다시 구독해주세요!</p>
                </AlertDescription>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200">
                    이메일 주소
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    className="bg-gray-800/40 border-gray-700 text-white placeholder:text-gray-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div
                  data-testid="error-alert"
                  style={{ display: status === "error" ? "block" : "none" }}
                >
                  <Alert
                    variant="destructive"
                    className="bg-red-900/50 border-red-800 text-red-200"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "처리 중..." : "구독 취소하기"}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex justify-center border-t border-gray-800 pt-4">
            <Link
              href="/"
              className="text-purple-300 hover:text-purple-200 inline-flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              홈으로 돌아가기
            </Link>
          </CardFooter>
        </Card>

        <p className="text-gray-400 text-xs text-center mt-4">
          문의사항은{" "}
          <a
            href="mailto:support@duckherald.com"
            className="text-purple-300 hover:underline"
          >
            support@duckherald.com
          </a>
          으로 연락주세요
        </p>
      </div>
    </div>
  );
};

export default UnsubscribePage;
