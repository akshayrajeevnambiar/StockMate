import { ClipboardList } from "lucide-react";
import { ButtonPrimary } from "../ui/Button";

export function CountsEmptyState({ onNewCount }: { onNewCount: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 mb-4">
        <ClipboardList className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        No counts yet
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Create your first count to start tracking inventory accuracy.
      </p>
      <ButtonPrimary onClick={onNewCount}>+ New Count</ButtonPrimary>
    </div>
  );
}
