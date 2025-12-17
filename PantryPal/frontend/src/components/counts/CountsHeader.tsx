import { Download, Plus } from "lucide-react";
import { ButtonPrimary, ButtonSecondary } from "../ui/Button";

export default function CountsHeader({
  onNewCount,
  onExport,
  onShare,
}: {
  onNewCount?: () => void;
  onExport?: () => void;
  onShare?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Counts</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track and manage inventory count submissions
        </p>
      </div>
      <div className="flex items-center gap-3">
        <ButtonSecondary onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </ButtonSecondary>
        <ButtonPrimary onClick={onNewCount}>
          <Plus className="w-4 h-4 mr-2" />
          New Count
        </ButtonPrimary>
      </div>
    </div>
  );
}
