import { defineConfig } from "orval";

export default defineConfig({
  duckherald: {
    output: {
      mode: "tags-split",
      target: "src/api/generated/index.ts",
      schemas: "src/types/api",
      client: "react-query",
      override: {
        mutator: {
          path: "src/lib/apiClient.ts",
          name: "customInstance",
        },
        query: {
          useQuery: true,
          useInfinite: false,
          useInfiniteQueryParam: "page",
          options: {
            staleTime: 10000,
          },
        },
      },
    },
    input: {
      target: "http://localhost:8080/v3/api-docs",
      // 개발 시에는 로컬 서버에서, 배포 시에는 실제 서버 URL에서 스키마를 가져옵니다.
      // production 환경에서는 다음 URL을 사용:
      // target: 'https://api.duckherald.com/v3/api-docs',
    },
    hooks: {
      afterAllFilesWrite: "prettier --write",
    },
  },
});
