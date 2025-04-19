// 경로: src/app/p/[id]/page.tsx
import NewsletterItem from "@/features/newsletter/NewsletterItem";

type Props = {
  params: { id: string };
};

export default async function NewsletterDetail({ params }: Props) {
  const res = await fetch(
    `http://localhost:8080/api/newsletters/${params.id}`,
    {
      // Spring API URL로 변경
      method: "GET", // GET 요청
      headers: {
        "Content-Type": "application/json", // JSON 형식으로 요청
      },
      cache: "no-store", // 최신 데이터 항상 가져오게 설정 (선택)
    },
  );

  if (!res.ok) {
    // 에러 핸들링 (예: 404, 500 등)
    return (
      <div className="p-6 text-red-500">
        에러가 발생했습니다. 데이터를 불러올 수 없습니다.
      </div>
    );
  }

  const newsletter = await res.json(); // JSON 응답을 직접 가져옴

  if (!newsletter) {
    return (
      <div className="p-6 text-gray-500">해당 뉴스레터를 찾을 수 없습니다.</div>
    );
  }

  console.log("newsletter", newsletter);
  return (
    <div className="max-w-3xl mx-auto p-8">
      <NewsletterItem
        title={newsletter.title}
        created_at={newsletter.createdAt}
        content={newsletter.content}
      />
    </div>
  );
}
