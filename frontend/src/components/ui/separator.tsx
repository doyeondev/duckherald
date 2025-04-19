"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "@/lib/utils";

/**
 * 구분선(Separator) 컴포넌트
 *
 * 콘텐츠를 시각적으로 구분하기 위한 수평 또는 수직 라인입니다.
 * 메뉴 항목, 버튼 그룹 등을 구분할 때 사용합니다.
 *
 * 예시:
 * ```tsx
 * <Separator className="my-4" />
 * <Separator orientation="vertical" className="h-6 mx-2" />
 * ```
 */
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref,
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
