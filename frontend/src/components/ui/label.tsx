"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * 레이블 컴포넌트
 *
 * 폼 요소에 레이블을 붙이기 위한 접근성 있는 컴포넌트입니다.
 * 사용자에게 입력 필드의 목적을 설명해 줍니다.
 *
 * 예시:
 * ```tsx
 * <Label htmlFor="email">이메일</Label>
 * <Input id="email" type="email" />
 * ```
 */
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
