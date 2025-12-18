import { MoreVertical } from "lucide-react";

import { StatusPill } from "../ui/StatusPill";
import { Avatar } from "../ui/Avatar";
import type { Count } from "../../types";
import { shortId } from "../../utils/shortId";

interface CountsTableProps {
  counts: Count[];
  onAction: (action: string, count: Count) => void;
}

export function CountsTable({ counts, onAction }: CountsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Count ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Created By
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Items
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Last Updated
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {counts.map((count) => (
            <tr
              key={count.id}
              className="border-b border-gray-200 hover:bg-gray-50"
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="font-medium text-gray-900">
                  #CT-{shortId(count.id)}
                </div>
                <div className="text-xs text-gray-400">
                  {count.count_date?.slice(0, 10)}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Avatar
                    name={count.created_by_name || count.created_by}
                    size={24}
                  />
                  <span className="text-gray-900 text-sm">
                    {count.created_by_name || count.created_by}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-900 text-sm">
                {count.items?.length ?? 0}
              </td>
              <td className="px-4 py-3 text-gray-900 text-sm">
                {count.updated_at?.slice(0, 10)}
              </td>
              <td className="px-4 py-3">
                <StatusPill status={count.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                  onClick={() => onAction("menu", count)}
                  title="Actions"
                >
                  <MoreVertical className="w-4 h-4 text-gray-700" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
