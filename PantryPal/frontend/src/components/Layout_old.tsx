import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { UserRole } from "../types";
import {
  LayoutGrid,
  Box,
  FileText,
  Package,
  BarChart3,
  Wallet,
  Map,
  Users,
  BookOpen,
  HelpCircle,
  Headphones,
  Search,
  ChevronDown,
  ChevronLeft,
  Boxes,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../services/api";

interface DashboardStats {
  pending_approvals?: number;
  active_counts?: Array<{ id: string }>;
}

async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get("/dashboard/stats");
  return response.data;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
    refetchInterval: 30000,
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const pendingApprovals = stats?.pending_approvals || 0;
  const pendingCounts = stats?.active_counts?.length || 0;

  // Navigation configuration matching Delisas reference
  const primaryNavItems = [
    { name: "Dashboard", href: "/", icon: LayoutGrid },
    { name: "Logistics", href: "/logistics", icon: Box },
    { name: "Orders", href: "/orders", icon: FileText },
    { name: "Inventory", href: "/items", icon: Package },
    { name: "Report", href: "/reports", icon: BarChart3 },
    { name: "Cashflow", href: "/cashflow", icon: Wallet },
    { name: "Tracking", href: "/tracking", icon: Map, hasChevron: true },
    { name: "Customers", href: "/customers", icon: Users },
  ];

  const helpNavItems = [
    { name: "User Guide", href: "/guide", icon: BookOpen },
    { name: "FAQ", href: "/faq", icon: HelpCircle },
    { name: "Help Center", href: "/help", icon: Headphones },
  ];

  const isActive = (path: string) => location.pathname === path;

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Sidebar */}
      <aside className={`hidden lg:flex lg:flex-col bg-black border-r border-white/10 shrink-0 transition-all duration-300 ${
        sidebarCollapsed ? "w-20" : "w-64"
      }`}>
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
                <CubeIcon className="w-5 h-5 text-black" />
              </div>
              <h1 className={`text-base font-semibold text-white tracking-tight whitespace-nowrap transition-opacity duration-300 ${
                sidebarCollapsed ? "opacity-0 w-0" : "opacity-100"
              }`}>
                PantryPal
              </h1>
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeftIcon className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                sidebarCollapsed ? "rotate-180" : ""
              }`} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                title={sidebarCollapsed ? item.name : undefined}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                } ${sidebarCollapsed ? "justify-center" : ""}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className={`whitespace-nowrap transition-opacity duration-300 ${
                  sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                }`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              title={sidebarCollapsed ? user?.full_name : undefined}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
            >
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {user?.full_name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className={`flex-1 text-left transition-opacity duration-300 ${
                sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              }`}>
                <p className="text-sm font-medium text-white truncate">
                  {user?.full_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </p>
              </div>
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute bottom-full left-4 right-4 mb-2 bg-black border border-white/10 rounded-lg overflow-hidden z-40">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-400 hover:bg-white/5 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-black border-b border-white/10 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>

            <div className="hidden md:flex items-center text-sm text-gray-500">
              {currentDate}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
              <MagnifyingGlassIcon className="w-4 h-4" />
              <span>Search</span>
            </button>

            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <BellIcon className="w-5 h-5" />
              {(pendingApprovals > 0 || pendingCounts > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </button>

            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
              {user?.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-black">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-black border-r border-white/10 z-50 lg:hidden">
            <div className="px-6 py-6 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <CubeIcon className="w-5 h-5 text-black" />
                </div>
                <h1 className="text-base font-semibold text-white">
                  PantryPal
                </h1>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <nav className="px-4 py-4 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      )}
    </div>
  );
}
