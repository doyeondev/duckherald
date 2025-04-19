// React 및 클래스 유틸 관련 라이브러리 임포트
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority"; // variant 유틸
import { cn } from "@/lib/utils"; // Tailwind 클래스 병합 유틸 함수

// cva를 사용해 badge의 스타일 variant를 선언
const badgeVariants = cva(
  // 기본 공통 스타일
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      // 뱃지 종류 (색상 및 스타일을 variant로 구분)
      variant: {
        // 기본 스타일 (primary 색상 배경)
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        // 보조 스타일
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // 오류/경고 스타일
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        // 외곽선만 있는 스타일
        outline: "text-foreground",
        // 성공 스타일 (고정된 초록색 사용)
        success:
          "border-transparent bg-green-500 text-white hover:bg-green-500/80",
      },
    },
    // variant 기본값 설정
    defaultVariants: {
      variant: "default",
    },
  },
);

// BadgeProps 타입 정의
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, // 기본 div 속성들 포함
    VariantProps<typeof badgeVariants> {} // variant 관련 props 허용

// Badge 컴포넌트 본체
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    // variant와 className을 조합하여 스타일링
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// 컴포넌트 및 스타일 유틸 export
export { Badge, badgeVariants };

{
  /* <Badge>일반</Badge>
<Badge variant="secondary">서브</Badge>
<Badge variant="destructive">위험</Badge>
<Badge variant="outline">외곽</Badge>
<Badge variant="success">완료됨</Badge> 

필요하면 Badge를 <span>이나 <button>으로 렌더링하도록 asChild 옵션도 추가 가능 */
}
