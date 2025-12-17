import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
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
  Settings,
  ChevronUp,
  LogOut,
} from "lucide-react";
import { useState } from "react";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Navigation configuration matching Delisas reference
  const primaryNavItems = [
    { name: "Dashboard", href: "/", icon: LayoutGrid },
    { name: "Counts", href: "/counts", icon: FileText },
    { name: "Inventory", href: "/items", icon: Package },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Pending Requests", href: "/pending-requests", icon: Map, hasChevron: true },
    { name: "Users", href: "/users", icon: Users },
  ];

  const helpNavItems = [
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Delisas-style Sidebar */}
      <aside className={`hidden lg:flex lg:flex-col bg-white border-r border-gray-200 shrink-0 p-4 transition-all duration-300 ${
        sidebarCollapsed ? "w-20" : "w-[280px]"
      }`}>
        {/* Top Brand Row */}
        <div className={`flex items-center mb-4 ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2.5">
              {/* Circular Logo */}
              <button
                onClick={() => sidebarCollapsed && setSidebarCollapsed(false)}
                className="w-8 h-8 rounded-full border-2 border-gray-900 flex items-center justify-center bg-white shrink-0 cursor-default transition-colors"
              >
                <Boxes className="w-4 h-4 text-gray-900" />
              </button>
              {/* Brand Name & Subheading */}
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-gray-900 leading-tight">PantryPal</span>
                <span className="text-xs text-gray-500 leading-tight">Inventory Management</span>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-8 h-8 rounded-full border-2 border-gray-900 flex items-center justify-center bg-white shrink-0 cursor-pointer hover:bg-gray-50 transition-colors"
              title="Expand sidebar"
            >
              <Boxes className="w-4 h-4 text-gray-900" />
            </button>
          )}
          {/* Collapse Button */}
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4 text-gray-900" />
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className={`relative mb-4 transition-opacity duration-300 ${
          sidebarCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
        }`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full h-10 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-[10px] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-shadow"
          />
        </div>

        {/* Primary Navigation */}
        <nav className={`flex-1 overflow-y-auto ${sidebarCollapsed ? 'space-y-3' : 'space-y-0.5'}`}>
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                title={sidebarCollapsed ? item.name : undefined}
                className={`flex items-center h-10 rounded-[10px] text-sm transition-all duration-150 ${
                  active
                    ? "bg-gray-50 border border-gray-200 text-gray-900 font-semibold"
                    : "text-gray-900 hover:bg-gray-100"
                } ${sidebarCollapsed ? "justify-center mx-3" : "justify-between px-3"}`}
              >
                {sidebarCollapsed ? (
                  <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                ) : (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                      <span>{item.name}</span>
                    </div>
                    {item.hasChevron && (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}
                  </>
                )}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-3 border-t border-gray-200" />

          {/* Help Section */}
          {helpNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                title={sidebarCollapsed ? item.name : undefined}
                className={`flex items-center h-10 rounded-[10px] text-sm transition-all duration-150 ${
                  active
                    ? "bg-gray-50 border border-gray-200 text-gray-900 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                } ${sidebarCollapsed ? "justify-center mx-3" : "px-3"}`}
              >
                {sidebarCollapsed ? (
                  <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                ) : (
                  <>
                    <Icon className="w-[18px] h-[18px] mr-2.5" strokeWidth={2} />
                    <span>{item.name}</span>
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Profile & Sign Out */}
        <div className="mt-auto space-y-2">
          {/* User Profile */}
          <div className={`flex items-center bg-white border border-gray-200 rounded-xl p-3 ${
            sidebarCollapsed ? "justify-center p-2" : ""
          }`}>
            {sidebarCollapsed ? (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                {user?.full_name?.charAt(0).toUpperCase() || "U"}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {user?.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
                {/* User Info */}
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-gray-900 leading-tight">
                    {user?.full_name || "User"}
                  </span>
                  <span className="text-xs text-gray-500 capitalize leading-tight">
                    {user?.role || "Admin"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? "Sign out" : undefined}
            className={`w-full flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors ${
              sidebarCollapsed ? "justify-center p-2" : "p-3"
            }`}
          >
            <LogOut className="w-[18px] h-[18px] text-gray-700" strokeWidth={2} />
            {!sidebarCollapsed && (
              <span className="text-sm font-medium text-gray-700">Sign out</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
