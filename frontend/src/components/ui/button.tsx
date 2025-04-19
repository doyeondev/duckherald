import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority"; // variant 기반 클래스 조건부 적용 도구
import { cn } from "@/lib/utils";

// 버튼 클래스 변형 정의 (variant + size)
const buttonVariants = cva(
  // 공통 기본 클래스 (모든 버튼에 공통 적용됨)
  "inline-flex items-center justify-center rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:opacity-70",
  {
    variants: {
      // 버튼 스타일 종류
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      // 버튼 사이즈
      size: {
        default: "h-10 px-4 py-2", // 기본
        sm: "h-9 rounded-md px-3", // 작은 버튼
        lg: "h-11 rounded-md px-8", // 큰 버튼
        icon: "h-10 w-10", // 아이콘 전용 버튼
      },
    },
    // 기본 variant와 size 설정
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// 버튼 컴포넌트 props 타입 정의
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, // 기본 HTML 버튼 속성
    VariantProps<typeof buttonVariants> {
  // variant와 size를 props로 받을 수 있게 함
  asChild?: boolean; // 버튼 대신 다른 요소(<a> 등)로 렌더링할 때 사용
}

// 버튼 컴포넌트 정의 (forwardRef 사용)
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // asChild가 true면 React.Fragment(보통 Slot)로 감싸고, 아니면 button 태그 사용
    const Comp = asChild ? React.Fragment : "button";

    return (
      <Comp
        // variant/size/className 조합 후 className으로 지정
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props} // 나머지 props (onClick, disabled 등)
      />
    );
  },
);
Button.displayName = "Button"; // 디버깅 시 표시될 이름

// 컴포넌트와 스타일 유틸 export
export { Button, buttonVariants };
