import * as React from "react";
import { cn } from "@/lib/utils";

// 전체 카드 컨테이너 컴포넌트
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // 카드 기본 스타일: 테두리, 배경, 그림자 등
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className, // 사용자 정의 클래스 덧붙임
    )}
    {...props} // 나머지 props (style, onClick 등)
  />
));
Card.displayName = "Card"; // 디버깅 및 DevTools 표시 이름

// 카드 상단(header) 영역 (주로 제목과 설명 위치)
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // 세로 정렬, 간격, 패딩
      "flex flex-col space-y-1.5 p-6",
      className,
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// 카드 제목 (보통 h3)
const CardTitle = React.forwardRef<
  HTMLParagraphElement, // 실제는 h3 태그지만 p로 설정되어 있음
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      // 큰 폰트, 두꺼운 글씨, 타이포 간격 조정
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// 카드 설명 텍스트 (부제나 보조 설명용)
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      // 작은 글씨, 약한 색상
      "text-sm text-muted-foreground",
      className,
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// 카드 본문 콘텐츠 영역 (주로 내용물 위치)
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // 기본 패딩 + 위쪽은 0으로 설정 (헤더와의 간격 조정)
      "p-6 pt-0",
      className,
    )}
    {...props}
  />
));
CardContent.displayName = "CardContent";

// 카드 하단 영역 (버튼이나 액션 위치)
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // 아이템 정렬, 패딩, 상단 여백 제거
      "flex items-center p-6 pt-0",
      className,
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// 각 컴포넌트를 외부에서 사용할 수 있도록 export
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

/**
 * 
 * <Card>
    <CardHeader>
        <CardTitle>계약서 요약</CardTitle>
        <CardDescription>자동 생성된 계약서 내용을 확인하세요.</CardDescription>
    </CardHeader>
    <CardContent>
    </CardContent>
    <CardFooter>
        <Button>자세히 보기</Button>
    </CardFooter>
    </Card>

 */
