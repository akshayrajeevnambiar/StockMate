import { type ReactNode } from "react";

export interface StatTileProps {
  label: string;
  value: string | number;
  tone?: "neutral" | "danger" | "warning" | "success";
  icon?: ReactNode;
  subtext?: string;
  onClick?: () => void;
}

const toneStyles = {
  neutral: {
    bg: "bg-[#1a1d24]",
    border: "border-gray-800/50 hover:border-gray-700",
    text: "text-white",
    subtext: "text-gray-500",
    icon: "text-blue-400 bg-blue-500/10",
  },
  danger: {
    bg: "bg-[#1a1d24]",
    border: "border-gray-800/50 hover:border-red-500/30",
    text: "text-red-400",
    subtext: "text-red-400/70",
    icon: "text-red-400 bg-red-500/10",
  },
  warning: {
    bg: "bg-[#1a1d24]",
    border: "border-gray-800/50 hover:border-orange-500/30",
    text: "text-orange-400",
    subtext: "text-orange-400/70",
    icon: "text-orange-400 bg-orange-500/10",
  },
  success: {
    bg: "bg-[#1a1d24]",
    border: "border-gray-800/50 hover:border-green-500/30",
    text: "text-green-400",
    subtext: "text-green-400/70",
    icon: "text-green-400 bg-green-500/10",
  },
};

export default function StatTile({
  label,
  value,
  tone = "neutral",
  icon,
  subtext,
  onClick,
}: StatTileProps) {
  const styles = toneStyles[tone];
  const isClickable = !!onClick;

  const Component = isClickable ? "button" : "div";
  const clickableProps = isClickable
    ? {
        onClick,
        type: "button" as const,
        "aria-label": `${label}: ${value}`,
      }
    : {};

  return (
    <Component
      {...clickableProps}
      className={`
        ${styles.bg} ${styles.border}
        border rounded-xl px-5 py-4 shadow-lg
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform
        ${
          isClickable
            ? "cursor-pointer hover:scale-[1.03] hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 w-full text-left active:scale-[0.98] group"
            : ""
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${styles.subtext} mb-2`}>
            {label}
          </p>
          <p
            className={`text-3xl font-bold ${styles.text} tracking-tight mb-1`}
          >
            {value}
          </p>
          {subtext && (
            <p className={`text-xs ${styles.subtext} mt-2`}>{subtext}</p>
          )}
        </div>
        {icon && (
          <div
            className={`${
              styles.icon
            } flex-shrink-0 p-3 rounded-lg flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isClickable ? "group-hover:scale-110 group-hover:rotate-6" : ""
            }`}
          >
            {icon}
          </div>
        )}
      </div>
    </Component>
  );
}
