import { ReactNode } from "react";
import { ChevronDown, MoreVertical } from "lucide-react";

interface ChartCardProps {
  title: string;
  dropdown?: string;
  children: ReactNode;
}

export default function ChartCard({
  title,
  dropdown,
  children,
}: ChartCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

        <div className="flex items-center gap-2">
          {dropdown && (
            <button className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              {dropdown}
              <ChevronDown className="w-3 h-3" />
            </button>
          )}
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Content */}
      <div className="w-full h-64">{children}</div>
    </div>
  );
}
