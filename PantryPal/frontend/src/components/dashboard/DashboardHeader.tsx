import { Download, Plus } from "lucide-react";

interface DashboardHeaderProps {
  onExport?: () => void;
  onCreateCount?: () => void;
}

export default function DashboardHeader({ onExport, onCreateCount }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="flex items-center gap-3">
        {/* Icon Button */}
        <button
          onClick={onExport}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          title="Download"
        >
          <Download className="w-4 h-4 text-gray-700" />
        </button>
        
        {/* Export CSV Button */}
        <button
          onClick={onExport}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Export CSV
        </button>
        
        {/* Record Count Button */}
        <button
          onClick={onCreateCount}
          className="px-4 py-2 rounded-lg bg-gray-900 text-sm font-medium text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Record Count
        </button>
      </div>
    </div>
  );
}
