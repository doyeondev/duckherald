import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * 텍스트 입력 필드 컴포넌트
 *
 * 기본적인 HTML input 요소를 스타일링하여 확장한 컴포넌트입니다.
 * 폼 입력 요소로 사용자 입력을 받을 때 사용합니다.
 *
 * 예시:
 * ```tsx
 * <Input
 *   type="text"
 *   placeholder="이름을 입력하세요"
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 * />
 * ```
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
