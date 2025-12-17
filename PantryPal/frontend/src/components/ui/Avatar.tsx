import type { SVGProps } from "react";

export function Avatar({
  name,
  size = 24,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-semibold text-xs ${className}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </span>
  );
}
