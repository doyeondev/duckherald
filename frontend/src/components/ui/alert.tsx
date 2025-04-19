import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Alert 스타일 variant 정의
const alertVariants = cva(
  // 공통 기본 스타일
  "relative w-full rounded-lg border p-4" +
    // SVG 아이콘 오른쪽 여백 확보
    " [&>svg~*]:pl-7" +
    // SVG 바로 다음에 div가 오면 약간 위로 올리기 (아이콘 정렬 개선)
    " [&>svg+div]:translate-y-[-3px]" +
    // SVG 자체를 왼쪽 상단에 고정 배치
    " [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        // 기본: 배경/텍스트는 일반적인 색상
        default: "bg-background text-foreground",
        // 에러 등 alert 스타일
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        // 성공 alert 스타일
        success:
          "border-green-500/50 text-green-700 dark:border-green-500 [&>svg]:text-green-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// Alert 컴포넌트
const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants> // variant prop 타입도 포함
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert" // 접근성용 role
    className={cn(alertVariants({ variant }), className)} // variant에 따른 클래스 적용
    {...props}
  />
));
Alert.displayName = "Alert";

// 알림 제목 (보통 굵은 글씨, 상단에 위치)
const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)} // 약간의 하단 마진, 두께
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

// 알림 본문 내용
const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)} // 내부 p 태그는 줄 간격 여유 있게
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

// 외부에서 사용할 수 있도록 export
export { Alert, AlertTitle, AlertDescription };
