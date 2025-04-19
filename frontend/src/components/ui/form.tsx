"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
// import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from "react-hook-form"

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/**
 * 폼 컨트롤 컴포넌트
 *
 * 입력 필드와 라벨을 그룹화하고 포맷팅하는 컨테이너입니다.
 * 주로 폼 요소들을 일관된 방식으로 배치할 때 사용합니다.
 */
const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-2", className)} {...props} />;
});
FormItem.displayName = "FormItem";

/**
 * 폼 라벨 컴포넌트
 *
 * 폼 요소에 대한 라벨 컴포넌트입니다.
 * 접근성을 위해 입력 필드와 연결됩니다.
 */
const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  return <Label ref={ref} className={cn(className)} {...props} />;
});
FormLabel.displayName = "FormLabel";

/**
 * 폼 컨트롤 컴포넌트
 *
 * 입력 필드 주변의 컨테이너로, 스타일링과 접근성을 제공합니다.
 */
const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  return <Slot ref={ref} {...props} />;
});
FormControl.displayName = "FormControl";

export { FormItem, FormLabel, FormControl };
