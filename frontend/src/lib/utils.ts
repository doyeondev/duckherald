import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 클래스 이름을 병합하는 유틸리티 함수
 *
 * Tailwind CSS 클래스와 조건부 클래스를 효율적으로 병합합니다.
 * clsx와 tailwind-merge를 함께 사용하여 충돌 없이 클래스를 결합합니다.
 *
 * 예시:
 * ```tsx
 * const className = cn(
 *   "base-class",
 *   isActive && "active-class",
 *   variant === "primary" ? "primary-class" : "secondary-class"
 * )
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
