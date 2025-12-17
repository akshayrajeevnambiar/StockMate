import { Search } from "lucide-react";
import { Input } from "../ui/Input";

export function CountsFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  statusOptions = [
    { value: "", label: "All" },
    { value: "Draft", label: "Draft" },
    { value: "Submitted", label: "Submitted" },
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
  ],
}: {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  statusOptions?: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-end">
      <div className="relative w-full sm:w-64">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </span>
        <Input
          className="pl-9"
          placeholder="Search counts..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <select
        className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-gray-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
