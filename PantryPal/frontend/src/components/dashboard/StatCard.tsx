import { MoreVertical, TrendingUp, TrendingDown } from "lucide-react";
import type { ComponentType } from "react";

interface StatCardProps {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  onClick,
}: StatCardProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl p-5 shadow-sm ${
        onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      }`}
      onClick={onClick}
    >
      {/* Top Row: Icon and Menu */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-700" strokeWidth={2} />
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Label */}
      <p className="text-sm text-gray-500 mb-1">{label}</p>

      {/* Value and Trend */}
      <div className="flex items-end justify-between">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>

        {trend && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
              trend.isPositive
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  );
}
