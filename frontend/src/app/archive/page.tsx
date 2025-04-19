"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// 뉴스레터 아이템 타입 정의
type NewsletterItem = {
  id: number;
  title: string;
  date: string;
  summary: string;
  thumbnail: string;
  status: string;
  publishedAt: string;
  createdAt: string;
  content: string;
  category: string;
};

export default function ArchivePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newsletters, setNewsletters] = useState<NewsletterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 카테고리 목록은 백엔드에서 가져오거나 고정 목록 사용
  const categories = [
    "연말결산",
    "플레이리스트",
    "분석",
    "역사",
    "비즈니스",
    "기술",
    "아티스트",
    "산업",
    "차트",
    "팬덤",
  ];

  useEffect(() => {
    const fetchNewsletters = async () => {
      setLoading(true);
      try {
        // 발행된 뉴스레터만 가져오기
        const response = await axios.get(
          "http://localhost:8080/api/newsletters/published",
        );

        // 최신순 정렬 (발행일 기준)
        const sortedNewsletters = response.data.sort(
          (a: NewsletterItem, b: NewsletterItem) => {
            return (
              new Date(b.publishedAt || b.createdAt).getTime() -
              new Date(a.publishedAt || a.createdAt).getTime()
            );
          },
        );

        // 데이터 형식 변환
        const formattedNewsletters = sortedNewsletters.map((item: any) => ({
          id: item.id,
          title: item.title,
          date: formatDate(item.publishedAt || item.createdAt),
          summary: item.summary || "요약 정보가 없습니다.",
          thumbnail: item.thumbnail || "/images/newsletters/default.jpg",
          status: item.status,
          publishedAt: item.publishedAt,
          createdAt: item.createdAt,
          content: item.content,
          // 카테고리 정보가 없으면 임의로 하나 할당
          category:
            item.category ||
            categories[Math.floor(Math.random() * categories.length)],
        }));

        setNewsletters(formattedNewsletters);
        setError(null);
      } catch (err) {
        console.error("뉴스레터 로드 실패:", err);
        setError("뉴스레터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsletters();
  }, []);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}년 ${month}월 ${day}일`;
  };

  // 검색어와 카테고리에 따라 필터링된 뉴스레터 목록
  const filteredNewsletters = newsletters.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.summary &&
        item.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="py-16">
        <div className="container mx-auto px-[25vw]">
          <h1 className="text-4xl font-bold mb-8 text-center">
            뉴스레터 아카이브
          </h1>

          {/* 검색 및 필터 섹션 */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Input
                type="text"
                placeholder="뉴스레터 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  className={
                    selectedCategory === null
                      ? "bg-amber-500 hover:bg-amber-600"
                      : ""
                  }
                  onClick={() => setSelectedCategory(null)}
                >
                  전체
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    className={
                      selectedCategory === category
                        ? "bg-amber-500 hover:bg-amber-600"
                        : ""
                    }
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* 뉴스레터 목록 */}
          <div className="space-y-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                <p className="mt-4 text-gray-500">뉴스레터를 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <p>{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  다시 시도
                </Button>
              </div>
            ) : filteredNewsletters.length === 0 ? (
              <p className="text-center text-gray-500 py-12">
                검색 결과가 없습니다.
              </p>
            ) : (
              filteredNewsletters.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row gap-6 border-b border-gray-200 pb-8"
                >
                  <div className="md:w-1/3">
                    <Link href={`/newsletters/${item.id}`}>
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-lg"
                        // 이미지가 없는 경우 더미 이미지 사용
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://placehold.co/600x400/FFA500/white?text=Duck+Herald";
                        }}
                      />
                    </Link>
                  </div>
                  <div className="md:w-2/3">
                    <span className="inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm font-medium mb-2">
                      {item.category}
                    </span>
                    <h2 className="text-xl font-bold mb-2">
                      <Link
                        href={`/newsletters/${item.id}`}
                        className="hover:text-amber-500"
                      >
                        {item.title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 mb-3">{item.summary}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">
                        {item.date} • DUCK HERALD
                      </span>
                      <Link href={`/newsletters/${item.id}`}>
                        <Button
                          variant="outline"
                          className="text-amber-500 border-amber-500 hover:bg-amber-50"
                        >
                          읽기
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 페이지네이션 (심플 버전) - 필요시 구현 */}
          {filteredNewsletters.length > 0 && (
            <div className="mt-12 flex justify-center">
              <nav className="flex space-x-2" aria-label="Pagination">
                <Button variant="outline" className="text-gray-500" disabled>
                  이전
                </Button>
                <Button variant="outline" className="bg-amber-500 text-white">
                  1
                </Button>
                <Button variant="outline" disabled>
                  다음
                </Button>
              </nav>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
