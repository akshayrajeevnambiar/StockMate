import { cn } from "../../utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function ButtonPrimary({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "h-10 px-4 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors flex items-center gap-2",
        className
      )}
      {...props}
    />
  );
}

export function ButtonSecondary({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "h-10 px-4 rounded-lg border border-gray-200 bg-white text-gray-900 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2",
        className
      )}
      {...props}
    />
  );
}

export function IconButton({
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={cn(
        "w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
