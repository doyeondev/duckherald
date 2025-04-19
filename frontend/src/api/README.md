# API 자동 생성 클라이언트

이 디렉토리는 백엔드 API를 기반으로 자동 생성된 TypeScript 클라이언트를 포함합니다.

## 사용 방법

1. 백엔드 API 서버가 실행 중인지 확인하세요.
2. 다음 명령어로 API 클라이언트를 생성합니다:

```bash
npm run generate-api
```

3. 생성된 API 클라이언트는 `src/api/generated` 디렉토리에, 타입 정의는 `src/types/api` 디렉토리에 저장됩니다.

## 컴포넌트에서 사용 예시

```tsx
import { useGetNewslettersPublished } from "../api/generated/newsletter";

const NewsletterList = () => {
  const { data: newsletters, isLoading, error } = useGetNewslettersPublished();

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생: {error.message}</div>;

  return (
    <div>
      <h1>뉴스레터 목록</h1>
      <ul>
        {newsletters?.map((newsletter) => (
          <li key={newsletter.id}>{newsletter.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default NewsletterList;
```

## 뮤테이션 사용 예시

```tsx
import { useCreateNewsletterCreateJson } from "../api/generated/newsletter";

const CreateNewsletter = () => {
  const { mutate, isLoading } = useCreateNewsletterCreateJson();

  const handleSubmit = (e) => {
    e.preventDefault();

    mutate(
      {
        data: {
          title: "새 뉴스레터",
          content: "<p>내용</p>",
          status: "DRAFT",
        },
      },
      {
        onSuccess: (data) => {
          console.log("생성 성공:", data);
        },
        onError: (error) => {
          console.error("생성 실패:", error);
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 폼 필드들 */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "생성 중..." : "뉴스레터 생성"}
      </button>
    </form>
  );
};

export default CreateNewsletter;
```

## 참고 사항

- API 클라이언트는 백엔드 OpenAPI 스키마를 기반으로 생성됩니다.
- 백엔드 API가 변경되면 클라이언트를 다시 생성해야 합니다.
- 자동 생성된 코드는 수정하지 않는 것이 좋습니다.
