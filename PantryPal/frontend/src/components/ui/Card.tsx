import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-2xl shadow-sm p-6",
        className
      )}
      {...props}
    />
  );
}
