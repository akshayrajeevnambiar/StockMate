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
    {
      name: "Pending Requests",
      href: "/pending-requests",
      icon: Map,
      hasChevron: true,
    },
    { name: "Users", href: "/users", icon: Users },
  ];

  const helpNavItems = [
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Delisas-style Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col bg-white border-r border-gray-200 shrink-0 p-4 transition-[width] duration-300 ease-in-out will-change-[width] ${
          sidebarCollapsed ? "w-24" : "w-[280px]"
        }`}
      >
        {/* Top Brand Row */}
        <div
          className={`mb-4 h-8 ${
            sidebarCollapsed ? "mx-3 flex justify-center" : "flex items-center"
          }`}
        >
          <div
            className={`flex items-center space-x-2.5 min-w-0 ${
              sidebarCollapsed ? "" : ""
            }`}
          >
            {/* Circular Logo */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-8 h-8 rounded-full border-2 border-gray-900 flex items-center justify-center bg-white shrink-0 cursor-pointer hover:bg-gray-50 transition-colors"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <Boxes className="w-4 h-4 text-gray-900" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-900" />
              )}
            </button>
            {/* Brand Name & Subheading */}
            <div
              className={`flex flex-col transition-opacity duration-300 ${
                sidebarCollapsed
                  ? "opacity-0 w-0 overflow-hidden"
                  : "opacity-100"
              }`}
            >
              <span className="text-lg font-semibold text-gray-900 leading-tight whitespace-nowrap">
                PantryPal
              </span>
              <span className="text-xs text-gray-500 leading-tight whitespace-nowrap">
                Inventory Management
              </span>
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav
          className={`flex-1 overflow-y-auto ${
            sidebarCollapsed ? "space-y-3" : "space-y-0.5"
          }`}
        >
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                title={sidebarCollapsed ? item.name : undefined}
                className={`flex items-center h-10 rounded-[10px] text-sm ${
                  active
                    ? "bg-gray-50 border border-gray-200 text-gray-900 font-semibold"
                    : "text-gray-900 hover:bg-gray-100"
                } ${
                  sidebarCollapsed
                    ? "justify-center mx-3"
                    : "justify-between px-3"
                }`}
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
                className={`flex items-center h-10 rounded-[10px] text-sm ${
                  active
                    ? "bg-gray-50 border border-gray-200 text-gray-900 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                } ${sidebarCollapsed ? "justify-center mx-3" : "px-3"}`}
              >
                {sidebarCollapsed ? (
                  <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                ) : (
                  <>
                    <Icon
                      className="w-[18px] h-[18px] mr-2.5"
                      strokeWidth={2}
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Profile & Sign Out */}
        <div className={`mt-auto ${sidebarCollapsed ? "space-y-2" : ""}`}>
          {sidebarCollapsed ? (
            <>
              {/* User Profile - Collapsed */}
              <div className="flex items-center justify-center transition-opacity duration-300">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold border-2 border-white shadow-sm transition-all duration-300 ease-in-out">
                  {user?.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>
              {/* Sign Out Button - Collapsed */}
              <button
                onClick={handleLogout}
                className="w-10 h-10 mx-auto flex items-center justify-center bg-white border-2 border-gray-200 rounded-full hover:bg-red-50 hover:border-red-200 transition-all duration-300 ease-in-out group shadow-sm"
                title="Sign out"
              >
                <LogOut
                  className="w-[18px] h-[18px] text-gray-700 group-hover:text-red-600 transition-colors duration-300"
                  strokeWidth={2}
                />
              </button>
            </>
          ) : (
            /* User Profile with Sign Out - Expanded */
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 transition-all duration-300 ease-in-out">
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
              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 transition-colors group"
                title="Sign out"
              >
                <LogOut
                  className="w-4 h-4 text-gray-700 group-hover:text-red-600"
                  strokeWidth={2}
                />
              </button>
            </div>
          )}
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
