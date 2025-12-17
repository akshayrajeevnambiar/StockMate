import { SlidersHorizontal } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils";

export function SortButton({
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
    >
      <SlidersHorizontal className="w-4 h-4" />
      Sort by
    </button>
  );
}
