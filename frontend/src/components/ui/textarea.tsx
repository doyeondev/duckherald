import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * 멀티라인 텍스트 입력 컴포넌트
 *
 * 여러 줄의 텍스트를 입력받을 수 있는 컴포넌트입니다.
 * 긴 텍스트나 설명 등을 입력받을 때 사용합니다.
 *
 * 예시:
 * ```tsx
 * <Textarea
 *   placeholder="설명을 입력하세요"
 *   value={description}
 *   onChange={(e) => setDescription(e.target.value)}
 *   rows={4}
 * />
 * ```
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
