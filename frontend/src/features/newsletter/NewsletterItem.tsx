"use client";

import React from "react";

interface Props {
  title: string;
  created_at: string;
  content: string;
}

export default function NewsletterItem({ title, created_at, content }: Props) {
  console.log("created_at", created_at);
  return (
    <article className="prose prose-lg max-w-none">
      {/* 헤더 영역 */}
      <div className="border-b pb-6 mb-8">
        <div className="text-center">
          <h1 className="text-3xl text-left font-extrabold mb-2">{title}</h1>
          <div className="flex items-center space-x-3 pt-4">
            <img
              src="/images/iconLogo.webp"
              alt="Duck Herald"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-800 tracking-wide uppercase">
                DUCK HERALD
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 본문 영역 */}
      <div
        className="space-y-4"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* 공유 버튼 등 확장 영역은 여기 추가 가능 */}
    </article>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
