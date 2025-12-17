import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { UserRole } from "../types";
import {
  HomeIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Base navigation for all users
  const baseNavigation = [
    { name: "Dashboard", href: "/", icon: HomeIcon },
    { name: "Items", href: "/items", icon: CubeIcon },
    { name: "Counts", href: "/counts", icon: ClipboardDocumentListIcon },
  ];

  // Additional navigation for admins and managers
  const adminNavigation = [
    { name: "Pending Requests", href: "/pending-requests", icon: ClockIcon },
  ];

  // Combine navigation based on user role
  const navigation = [
    ...baseNavigation,
    ...(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER
      ? adminNavigation
      : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Enhanced Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-lg shadow-slate-900/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center group cursor-pointer">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-all duration-300 group-hover:scale-105">
                    <CubeIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-sm"></div>
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                    PantryPal
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Inventory Management
                  </p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex lg:ml-12 lg:space-x-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive(item.href)
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                          : "text-slate-700 hover:text-blue-600 hover:bg-blue-50/80"
                      } group flex items-center px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md`}
                    >
                      <Icon
                        className={`${
                          isActive(item.href)
                            ? "text-white"
                            : "text-slate-500 group-hover:text-blue-600"
                        } mr-3 h-5 w-5 transition-colors duration-300`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {/* User Profile */}
              <div className="hidden md:flex items-center space-x-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl px-5 py-3 border border-slate-200/60 shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <UserCircleIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 via-pink-500 to-red-600 rounded-xl hover:from-red-600 hover:via-pink-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                Sign Out
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden inline-flex items-center justify-center p-3 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-xl">
            <div className="px-6 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`${
                      isActive(item.href)
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                        : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                    } group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200`}
                  >
                    <Icon
                      className={`${
                        isActive(item.href)
                          ? "text-white"
                          : "text-slate-500 group-hover:text-blue-600"
                      } mr-3 h-5 w-5`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
