import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils";

const STATUS_STYLES: Record<string, string> = {
  Approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Pending: "bg-yellow-50 text-yellow-800 border border-yellow-200",
  Submitted: "bg-blue-50 text-blue-700 border border-blue-200",
  Draft: "bg-gray-100 text-gray-700 border border-gray-200",
  Rejected: "bg-red-50 text-red-700 border border-red-200",
};

export function StatusPill({
  status,
  className = "",
  children,
  ...props
}: {
  status: string;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        STATUS_STYLES[status] ||
          "bg-gray-100 text-gray-700 border border-gray-200",
        className
      )}
      {...props}
    >
      {children || status}
    </span>
  );
}
