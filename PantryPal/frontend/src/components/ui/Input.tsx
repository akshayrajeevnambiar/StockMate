import type { InputHTMLAttributes } from "react";
import { cn } from "../../utils";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm",
        className
      )}
      {...props}
    />
  );
}
