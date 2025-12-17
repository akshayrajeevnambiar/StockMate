import { type ReactNode } from "react";

export interface ActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  ctaLabel: string;
  onCta: () => void;
  tone?: "neutral" | "danger" | "warning" | "success";
  badge?: number;
  footerHint?: string;
}

const toneStyles = {
  neutral: {
    bg: "bg-[#1a1d24]",
    border: "border-gray-800/50 hover:border-gray-700",
    title: "text-white",
    description: "text-gray-400",
    icon: "text-blue-400 bg-blue-500/10",
    badge: "bg-red-500/10 text-red-400 border border-red-500/20",
    badgeZero: "bg-gray-800 text-gray-500",
    button:
      "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20",
    footerHint: "text-gray-600",
  },
  danger: {
    bg: "bg-[#1a1d24]",
    border: "border-gray-800/50 hover:border-red-500/30",
    title: "text-white",
    description: "text-gray-400",
    icon: "text-red-400 bg-red-500/10",
    badge: "bg-red-500/10 text-red-400 border border-red-500/20",
    badgeZero: "bg-gray-800 text-gray-500",
    button:
      "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20",
    footerHint: "text-gray-600",
  },
  warning: {
    bg: "bg-[#1a1d24]",
    border: "border-gray-800/50 hover:border-orange-500/30",
    title: "text-white",
    description: "text-gray-400",
    icon: "text-orange-400 bg-orange-500/10",
    badge: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    badgeZero: "bg-gray-800 text-gray-500",
    button:
      "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-500/20",
    footerHint: "text-gray-600",
  },
  success: {
    bg: "bg-[#1a1d24]",
    border: "border-gray-800/50 hover:border-green-500/30",
    title: "text-white",
    description: "text-gray-400",
    icon: "text-green-400 bg-green-500/10",
    badge: "bg-green-500/10 text-green-400 border border-green-500/20",
    badgeZero: "bg-gray-800 text-gray-500",
    button:
      "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20",
    footerHint: "text-gray-600",
  },
};

export default function ActionCard({
  title,
  description,
  icon,
  ctaLabel,
  onCta,
  tone = "neutral",
  badge,
  footerHint,
}: ActionCardProps) {
  const styles = toneStyles[tone];

  return (
    <div
      className={`
        ${styles.bg} ${styles.border}
        border rounded-xl p-6 shadow-lg
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01] will-change-transform group
      `}
    >
      {/* Header with Icon and Badge */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div
          className={`
            ${styles.icon}
            p-3 rounded-xl flex items-center justify-center flex-shrink-0
            transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-110 group-hover:rotate-12
          `}
          aria-hidden="true"
        >
          {icon}
        </div>
        {badge !== undefined && badge > 0 && (
          <span
            className={`
              ${styles.badge}
              inline-flex items-center justify-center
              px-3 py-1 rounded-full
              text-xs font-semibold
            `}
            aria-label={`${badge} items`}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="mb-5">
        <h3 className={`text-lg font-bold ${styles.title} mb-2`}>{title}</h3>
        <p className={`text-sm ${styles.description} leading-relaxed`}>
          {description}
        </p>
      </div>

      {/* Footer */}
      <div className="space-y-3">
        <button
          onClick={onCta}
          type="button"
          className={`
            w-full px-4 py-3 rounded-lg
            font-semibold
            ${styles.button}
            transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
            hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-offset-2
            dark:focus:ring-offset-slate-900
            will-change-transform
          `}
          aria-label={ctaLabel}
        >
          {ctaLabel}
        </button>
        {footerHint && (
          <p className={`text-xs ${styles.footerHint} text-center`}>
            {footerHint}
          </p>
        )}
      </div>
    </div>
  );
}
