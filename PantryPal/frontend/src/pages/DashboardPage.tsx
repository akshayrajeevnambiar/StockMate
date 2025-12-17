import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { itemsService } from "../services/items";
import apiClient from "../services/api";
import { useAuth } from "../hooks/useAuth";
import {
  Package,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DashboardHeader, StatCard, ChartCard, DataTable } from "../components/dashboard";

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
      return items.slice(0, 10);
    },
  });

  // Mock data for charts - replace with real API data
  const usageData = [
    { name: "Mon", value: 4000 },
    { name: "Tue", value: 3000 },
    { name: "Wed", value: 2000 },
    { name: "Thu", value: 2780 },
    { name: "Fri", value: 1890 },
    { name: "Sat", value: 2390 },
    { name: "Sun", value: 3490 },
  ];

  const categoryData = [
    { category: "Produce", value: 4500, percentage: 30 },
    { category: "Dairy", value: 3800, percentage: 25 },
    { category: "Meat", value: 3200, percentage: 21 },
    { category: "Dry Goods", value: 2400, percentage: 16 },
    { category: "Spices", value: 1200, percentage: 8 },
  ];

  // Calculate total inventory value (mock - replace with real calculation)
  const totalValue = stats?.total_items ? stats.total_items * 25.5 : 0;

  // Calculate last count time
  const getLastCountLabel = () => {
    if (!stats?.recent_counts?.[0]?.date) return "Never";
    
    const lastCount = new Date(stats.recent_counts[0].date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastCount.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  // Transform low stock items into table data
  const tableData = lowStockItems.map((item) => ({
    id: item.id,
    item: item.name,
    sku: item.sku || undefined,
    category: item.category || "Uncategorized",
    lastUpdated: new Date(item.updated_at || Date.now()).toLocaleDateString(),
    countedBy: user?.full_name || "System",
    variance: item.current_quantity && item.par_level
      ? `${Math.round(((item.current_quantity - item.par_level) / item.par_level) * 100)}%`
      : undefined,
    status: (item.current_quantity || 0) < (item.par_level || 0) * 0.3
      ? "Low Stock" as const
      : (item.current_quantity || 0) < (item.par_level || 0) * 0.5
      ? "Needs Review" as const
      : "OK" as const,
  }));

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded-xl" />
            <div className="h-80 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] p-8">
      {/* Header */}
      <DashboardHeader
        onExport={() => console.log("Export CSV")}
        onCreateCount={() => navigate("/counts/new")}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={DollarSign}
          label="Total Inventory Value"
          value={`$${totalValue.toLocaleString()}`}
          trend={{ value: 16, isPositive: true }}
          onClick={() => navigate("/items")}
        />
        <StatCard
          icon={AlertTriangle}
          label="Items Below Par"
          value={stats?.low_stock_count || 0}
          trend={{ value: 8, isPositive: false }}
          onClick={() => navigate("/items")}
        />
        <StatCard
          icon={CheckCircle2}
          label="Pending Approvals"
          value={stats?.pending_approvals || 0}
          onClick={() => navigate("/pending-requests")}
        />
        <StatCard
          icon={Clock}
          label="Last Count"
          value={getLastCountLabel()}
          onClick={() => navigate("/counts")}
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Total Usage Chart */}
        <ChartCard title="Total Usage" dropdown="Monthly">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="value" fill="#111827" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category Breakdown */}
        <ChartCard title="Category Breakdown" dropdown="Yearly">
          <div className="space-y-4 pt-4">
            {categoryData.map((cat, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${cat.value.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Data Table */}
      <DataTable
        title="Recent Stock Movements"
        data={tableData}
        onSearch={(query) => console.log("Search:", query)}
        onSort={() => console.log("Sort clicked")}
      />
    </div>
  );
}
