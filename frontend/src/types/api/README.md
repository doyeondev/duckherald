# 자동 생성 API 타입

이 디렉토리는 백엔드 API를 기반으로 자동 생성된 TypeScript 타입 정의를 포함합니다.

## 개요

- 모든 타입은 백엔드 OpenAPI 문서에서 자동으로 생성됩니다.
- 이 파일들은 자동 생성되므로 직접 수정하지 마세요.
- API 변경 시 `npm run generate-api` 명령어로 타입을 업데이트할 수 있습니다.

## 주요 타입

- `NewsletterResponse`: 뉴스레터 데이터 타입
- `NewsletterRequest`: 뉴스레터 생성/수정 요청 타입
- 그 외 추가적인 API 응답 타입들

## 직접 사용 방법

자동 생성된 API 클라이언트 대신 타입만 직접 사용하려면:

```tsx
import { NewsletterResponse } from "../types/api/newsletterResponse";

// 타입 명시
const newsletter: NewsletterResponse = {
  id: 1,
  title: "샘플 뉴스레터",
  content: "<p>내용</p>",
  status: "PUBLISHED",
  createdAt: "2023-04-01T00:00:00Z",
  // ...기타 필드
};

// 컴포넌트 props 타입 지정
interface NewsletterCardProps {
  newsletter: NewsletterResponse;
}

const NewsletterCard = ({ newsletter }: NewsletterCardProps) => {
  return (
    <div>
      <h2>{newsletter.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: newsletter.content }} />
    </div>
  );
};
```

## 참고 사항

- 백엔드에서 필드가 추가, 수정 또는 삭제될 경우 자동으로 타입도 업데이트됩니다.
- OpenAPI 스키마에 설명이 포함되어 있다면 각 필드에 JSDoc 코멘트로 설명이 추가됩니다.
