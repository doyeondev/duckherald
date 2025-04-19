import { useQuery } from "@tanstack/react-query";
import apiAxios from "@/lib/apiClient";
import type { Newsletter } from "@/types/newsletter";

export const useNewsletterQuery = () => {
  return useQuery<Newsletter[]>({
    queryKey: ["newsletterList"],
    queryFn: async () => {
      const { data } = await apiAxios.get("/api/newsletters");
      // PUBLISHED 상태의 뉴스레터만 필터링
      const publishedNewsletters = data.filter(
        (newsletter: Newsletter) => newsletter.status === "PUBLISHED",
      );

      // 생성일 기준 최신순 정렬
      return publishedNewsletters.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    },
  });
};
