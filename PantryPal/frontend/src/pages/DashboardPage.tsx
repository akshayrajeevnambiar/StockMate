import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { itemsService } from "../services/items";
import { 
  ExclamationTriangleIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  PlusIcon,
  SparklesIcon,
  BellIcon
} from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const { data: lowStockItems, isLoading } = useQuery({
    queryKey: ["lowStockItems"],
    queryFn: itemsService.getLowStockItems,
  });

  const stats = [
    {
      name: 'Critical Stock',
      value: isLoading ? '...' : lowStockItems?.length || 0,
      icon: ExclamationTriangleIcon,
      color: 'from-red-500 via-pink-500 to-rose-600',
      bgColor: 'from-red-50 via-pink-50 to-rose-50',
      textColor: 'text-red-700',
      iconColor: 'text-red-600',
      link: '/items?filter=low-stock',
      linkText: 'Review critical items',
      description: 'Items requiring immediate attention'
    },
    {
      name: 'Inventory',
      value: 'Manage',
      icon: CubeIcon,
      color: 'from-blue-500 via-indigo-500 to-purple-600',
      bgColor: 'from-blue-50 via-indigo-50 to-purple-50',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-600',
      link: '/items',
      linkText: 'View all items',
      description: 'Complete inventory overview'
    },
    {
      name: 'Reports',
      value: 'Counts',
      icon: ClipboardDocumentListIcon,
      color: 'from-emerald-500 via-teal-500 to-cyan-600',
      bgColor: 'from-emerald-50 via-teal-50 to-cyan-50',
      textColor: 'text-emerald-700',
      iconColor: 'text-emerald-600',
      link: '/counts',
      linkText: 'Generate reports',
      description: 'Analytics and insights'
    }
  ];

  return (
    <div className="space-y-10">
      {/* Enhanced Header with Better Spacing */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl opacity-60"></div>
        <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 p-8 lg:p-12 shadow-xl shadow-slate-900/5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <SparklesIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <p className="text-lg text-slate-600 font-medium mt-2">
                    Welcome back to your inventory control center
                  </p>
                </div>
              </div>
              <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
                Monitor stock levels, track performance, and manage your inventory with professional-grade tools designed for modern businesses.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/items/new"
                className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
              >
                <PlusIcon className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                Add New Item
              </Link>
              <Link
                to="/items"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-700 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 hover:bg-white hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-500/20 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <CubeIcon className="w-5 h-5 mr-3" />
                View Inventory
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid with Better Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="group relative overflow-hidden"
            >
              {/* Background with Enhanced Glassmorphism */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} rounded-3xl opacity-80`}></div>
              <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/30"></div>
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 rounded-3xl group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative p-8 space-y-6">
                {/* Icon and Value Section */}
                <div className="flex items-start justify-between">
                  <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-500 font-medium">
                      {stat.description}
                    </div>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {stat.name}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {stat.description}
                    </p>
                  </div>
                  
                  {/* Action Link */}
                  <Link
                    to={stat.link}
                    className={`inline-flex items-center text-sm font-semibold ${stat.textColor} hover:opacity-80 transition-all duration-200 group-hover:translate-x-1`}
                  >
                    {stat.linkText}
                    <ArrowTrendingUpIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Critical Stock Alerts */}
      {lowStockItems && lowStockItems.length > 0 && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-50 via-pink-50 to-rose-50 rounded-3xl opacity-60"></div>
          <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl shadow-slate-900/5 overflow-hidden">
            {/* Alert Header */}
            <div className="bg-gradient-to-r from-red-500/10 via-pink-500/10 to-rose-500/10 px-8 py-6 border-b border-red-200/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 via-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <BellIcon className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Critical Stock Alert</h3>
                    <p className="text-slate-600 font-medium">
                      {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} require immediate attention
                    </p>
                  </div>
                </div>
                <div className="bg-red-100 text-red-800 px-4 py-2 rounded-xl font-semibold text-sm">
                  URGENT
                </div>
              </div>
            </div>
            
            {/* Alert Content */}
            <div className="p-8">
              <div className="grid gap-6">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 hover:bg-white hover:border-slate-300/60 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                          <CubeIcon className="w-7 h-7 text-red-600" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                          {item.name}
                        </h4>
                        <p className="text-sm text-slate-500 capitalize font-medium">
                          {item.category.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl font-bold text-red-600">
                          {item.current_quantity}
                        </span>
                        <span className="text-slate-400 text-lg">/</span>
                        <span className="text-lg text-slate-700 font-semibold">
                          {item.par_level} {item.unit_of_measure}
                        </span>
                      </div>
                      
                      {/* Enhanced Progress Bar */}
                      <div className="w-32 h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-pink-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((item.current_quantity / item.par_level) * 100, 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-end space-x-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                          {Math.round((item.current_quantity / item.par_level) * 100)}% Stock
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {lowStockItems.length > 5 && (
                <div className="mt-8 text-center">
                  <Link
                    to="/items?filter=low-stock"
                    className="inline-flex items-center px-8 py-4 text-base font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-2xl border border-red-200/60 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <ChartBarIcon className="w-5 h-5 mr-3" />
                    View All {lowStockItems.length} Critical Items
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Empty State */}
      {lowStockItems && lowStockItems.length === 0 && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl opacity-60"></div>
          <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 p-12 text-center shadow-xl shadow-slate-900/5">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <ChartBarIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Excellent Stock Management!</h3>
            <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
              Your inventory is optimally maintained with no critical stock alerts. Great job keeping everything in balance!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/items"
                className="inline-flex items-center px-6 py-3 text-base font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors duration-200"
              >
                <CubeIcon className="w-5 h-5 mr-2" />
                View Inventory
              </Link>
              <Link
                to="/items/new"
                className="inline-flex items-center px-6 py-3 text-base font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add New Items
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}