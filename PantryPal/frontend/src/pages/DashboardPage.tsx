import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { itemsService } from "../services/items";
import apiClient from "../services/api";
import { useAuth } from "../hooks/useAuth";
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";

interface DashboardStats {
  total_items: number;
  low_stock_count: number;
  pending_approvals: number;
  recent_counts?: Array<{
    id: string;
    date: string;
    status: string;
    items_count: number;
  }>;
  active_counts?: Array<{
    id: string;
    date: string;
    items_count: number;
  }>;
}

async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get("/dashboard/stats");
  return response.data;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
  });

  const { data: lowStockItems = [] } = useQuery({
    queryKey: ["lowStockItems"],
    queryFn: async () => {
      const items = await itemsService.getLowStockItems();
      return items.slice(0, 3);
    },
  });

  // Mock data for today's inventory status
  const todayStatus = {
    submitted: false,
    overdue: false,
    assignedTo: user?.role === "counter" ? "You" : "Counter",
    expectedBy: "11:00 AM",
    risk: "Stock variance",
  };

  if (statsLoading) {
    return (
      <div className="space-y-8">
        {/* Skeleton loader with premium feel */}
        <div className="space-y-3">
          <div className="h-10 w-56 bg-black/5 rounded-xl animate-pulse" />
          <div className="h-4 w-40 bg-black/5 rounded-lg animate-pulse" />
        </div>
        <div className="h-72 bg-black/5 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-black/5 rounded-2xl animate-pulse" />
          <div className="h-48 bg-black/5 rounded-2xl animate-pulse" />
          <div className="h-48 bg-black/5 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-semibold text-black mb-2 tracking-tight">
          Command Center
        </h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Today's Status */}
      <div className="bg-black/5 border border-black/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div
              className={`w-2 h-2 rounded-full ${
                todayStatus.submitted
                  ? "bg-green-500"
                  : todayStatus.overdue
                  ? "bg-amber-500"
                  : "bg-blue-500"
              }`}
            />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {todayStatus.submitted
                ? "Completed"
                : todayStatus.overdue
                ? "Overdue"
                : "Pending"}
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-black mb-6">
          Inventory Count —{" "}
          {todayStatus.submitted ? "Submitted" : "Not Submitted"}
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-black/5 border border-black/10 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Assigned to</p>
            <p className="text-sm font-medium text-black">
              {todayStatus.assignedTo}
            </p>
          </div>
          <div className="bg-black/5 border border-black/10 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Expected by</p>
            <p className="text-sm font-medium text-black">
              {todayStatus.expectedBy}
            </p>
          </div>
          <div className="bg-black/5 border border-black/10 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Risk if missed</p>
            <p className="text-sm font-medium text-amber-400">
              {todayStatus.risk}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/counts/new")}
            disabled={todayStatus.submitted}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
              todayStatus.submitted
                ? "bg-black/5 text-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {todayStatus.submitted ? "Count Complete ✓" : "Start Today's Count"}
          </button>
          <button
            onClick={() => navigate("/counts")}
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            View previous counts →
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Approaching Par */}
        {lowStockItems.length > 0 && (
          <div className="bg-black/5 border border-black/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-black">
                Approaching Par
              </h3>
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
            </div>
            <div className="space-y-3 mb-4">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-700 truncate">{item.name}</span>
                  <span className="text-xs text-amber-400 ml-2">
                    {Math.max(
                      1,
                      Math.floor(
                        ((item.current_quantity || 0) / (item.par_level || 1)) *
                          7
                      )
                    )}
                    d
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/inventory")}
              className="w-full py-2 text-sm text-gray-600 hover:text-black transition-colors"
            >
              Review all items →
            </button>
          </div>
        )}

        {/* Pending Approvals */}
        {stats && stats.pending_approvals > 0 && (
          <div className="bg-black/5 border border-black/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-black">
                Pending Approvals
              </h3>
              <ClipboardDocumentCheckIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div className="mb-4">
              <p className="text-3xl font-semibold text-black mb-1">
                {stats.pending_approvals}
              </p>
              <p className="text-sm text-gray-500">
                {stats.pending_approvals === 1 ? "count" : "counts"} awaiting
                review
              </p>
            </div>
            <button
              onClick={() => navigate("/approvals")}
              className="w-full py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Review {stats.pending_approvals === 1 ? "count" : "counts"} →
            </button>
          </div>
        )}

        {/* Last Verified */}
        <div className="bg-black/5 border border-black/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-black">Last Verified</h3>
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
          </div>
          <div className="mb-4">
            <p className="text-lg font-medium text-black mb-1">
              {stats?.recent_counts?.[0]?.date
                ? new Date(stats.recent_counts[0].date).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    }
                  )
                : "Yesterday, 9:42 AM"}
            </p>
            <p className="text-sm text-gray-500">Submitted by Counter</p>
          </div>
          <button
            onClick={() => navigate("/counts")}
            className="w-full py-2 text-sm text-gray-600 hover:text-black transition-colors"
          >
            View history →
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate("/inventory")}
          className="bg-black/5 border border-black/10 rounded-lg p-6 text-left hover:bg-black/10 transition-colors"
        >
          <ChartBarIcon className="w-6 h-6 text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">Inventory</h3>
          <p className="text-sm text-gray-500 mb-4">
            Manage items, par levels, and stock
          </p>
          <span className="text-sm text-gray-600">View inventory →</span>
        </button>

        <button
          onClick={() => navigate("/counts")}
          className="bg-black/5 border border-black/10 rounded-lg p-6 text-left hover:bg-black/10 transition-colors"
        >
          <ClipboardDocumentCheckIcon className="w-6 h-6 text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">
            Review Counts
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            View past submissions and analytics
          </p>
          <span className="text-sm text-gray-600">View counts →</span>
        </button>

        <button
          onClick={() => navigate("/reports")}
          className="bg-black/5 border border-black/10 rounded-lg p-6 text-left hover:bg-black/10 transition-colors"
        >
          <DocumentChartBarIcon className="w-6 h-6 text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-black mb-2">Reports</h3>
          <p className="text-sm text-gray-500 mb-4">
            Analytics and inventory insights
          </p>
          <span className="text-sm text-gray-600">View reports →</span>
        </button>
      </div>
    </div>
  );
}
