"use client";

import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

const SubscriptionForm = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage("이메일을 입력해주세요.");
      return;
    }

    try {
      setStatus("loading");
      await axios.post("/api/subscribers/subscribe", { email });
      setStatus("success");
      setMessage("구독 신청이 완료되었습니다! 이메일을 확인해주세요.");
      setEmail("");
    } catch (err: any) {
      console.error("Error subscribing:", err);
      if (err.response?.status === 409) {
        setMessage("이미 구독 중인 이메일입니다.");
      } else {
        setMessage("구독 신청 중 오류가 발생했습니다. 다시 시도해주세요.");
        console.error("Error subscribing:", err);
      }
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex flex-col items-centersm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소를 입력하세요"
          className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:ring-amber-500"
          required
        />
        <Button
          type="submit"
          className="bg-amber-500 hover:bg-amber-600 text-white px-6"
          disabled={status === "loading"}
        >
          {status === "loading" ? "구독 중..." : "구독하기"}
        </Button>
      </div>
      {status === "error" && <p className="text-red-500 mt-2">{message}</p>}
      {status === "success" && <p className="text-green-500 mt-2">{message}</p>}
    </form>
  );
};

export default SubscriptionForm;
