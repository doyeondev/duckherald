"use client";

import { useNewsletterQuery } from "./useNewsletterQuery";
import NewsletterItem from "./NewsletterItem";
import Link from "next/link";
import type { Newsletter } from "@/types/newsletter";
import { Button } from "@/components/ui/button";

export default function NewsletterList() {
  const { data, isLoading, isError } = useNewsletterQuery();

  if (isLoading) return <p>불러오는 중...</p>;
  if (isError) return <p>에러가 발생했습니다. 다시 시도해주세요.</p>;
  if (!data || data.length === 0) return <p>표시할 뉴스레터가 없습니다.</p>;

  return (
    <>
      <div className="space-y-10">
        {data.map((item: Newsletter) => (
          <Link
            key={item.id}
            href={`/p/${item.id}`}
            className="flex flex-col md:flex-row items-start gap-8 group"
          >
            {/* 텍스트 영역 */}
            <div className="flex-1 w-120 my-auto">
              <h2 className="listlink text-xl font-semibold group-hover:underline">
                {" "}
                {item.title}{" "}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {item.summary || "요약 내용이 없습니다."}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {formatDate(item.createdAt)} · DUCK HERALD
              </p>
            </div>

            {/* 썸네일 이미지 (있으면) */}
            {item.thumbnail && (
              <img
                src={`${item.thumbnail}`}
                alt="썸네일"
                className="w-40 h-full object-cover rounded-sm"
              />
            )}
          </Link>
        ))}
      </div>
    </>
  );
}

{
  /* <Image
src={`http://localhost:8055/assets/${item.thumbnailImg}`}
alt="썸네일"
className="w-32 h-20 object-cover rounded-md border"
width={128}
height={80}
/> */
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
