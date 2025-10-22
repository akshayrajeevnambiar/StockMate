import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { itemsService } from "../services/items";
import { ItemCategory } from "../types";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function ItemsPage() {
  const [searchParams] = useSearchParams();
  const filter = searchParams.get("filter");
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<
    ItemCategory | undefined
  >();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: items, isLoading } = useQuery({
    queryKey: ["items", selectedCategory, filter],
    queryFn: () =>
      filter === "low-stock"
        ? itemsService.getLowStockItems()
        : itemsService.getItems(selectedCategory),
  });

  const deleteMutation = useMutation({
    mutationFn: itemsService.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredItems = items?.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryOptions = Object.values(ItemCategory);

  const getStockStatus = (item: any) => {
    const percentage = (item.current_quantity / item.par_level) * 100;
    if (percentage <= 25)
      return { status: "critical", color: "red", text: "Critical" };
    if (percentage <= 50)
      return { status: "low", color: "yellow", text: "Low" };
    if (percentage <= 75)
      return { status: "medium", color: "blue", text: "Medium" };
    return { status: "good", color: "green", text: "Good" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-3">
            {filter === "low-stock" ? (
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
            ) : (
              <CubeIcon className="w-8 h-8 text-blue-500" />
            )}
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {filter === "low-stock"
                  ? "Critical Stock Items"
                  : "Inventory Items"}
              </h1>
              <p className="mt-1 text-gray-600">
                {filter === "low-stock"
                  ? "Items requiring immediate attention"
                  : "Manage your pantry inventory items"}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/items/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Item
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory || ""}
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value ? (e.target.value as ItemCategory) : undefined
                )
              }
              className="block rounded-lg border border-gray-200 bg-white/50 backdrop-blur-sm py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            >
              <option value="">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading items...</p>
        </div>
      ) : filteredItems && filteredItems.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const stockStatus = getStockStatus(item);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
              >
                {/* Stock Status Bar */}
                <div
                  className={`h-2 bg-gradient-to-r ${
                    stockStatus.color === "red"
                      ? "from-red-400 to-red-600"
                      : stockStatus.color === "yellow"
                      ? "from-yellow-400 to-orange-500"
                      : stockStatus.color === "blue"
                      ? "from-blue-400 to-indigo-500"
                      : "from-green-400 to-green-600"
                  }`}
                ></div>

                <div className="p-6">
                  {/* Item Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        stockStatus.color === "red"
                          ? "bg-red-100"
                          : stockStatus.color === "yellow"
                          ? "bg-yellow-100"
                          : stockStatus.color === "blue"
                          ? "bg-blue-100"
                          : "bg-green-100"
                      }`}
                    >
                      <CubeIcon
                        className={`w-5 h-5 ${
                          stockStatus.color === "red"
                            ? "text-red-600"
                            : stockStatus.color === "yellow"
                            ? "text-yellow-600"
                            : stockStatus.color === "blue"
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {item.category.replace("_", " ")}
                    </span>
                  </div>

                  {/* Quantity Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Current Stock
                      </span>
                      <span className="font-semibold text-gray-900">
                        {item.current_quantity} {item.unit_of_measure}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Par Level</span>
                      <span className="font-semibold text-gray-900">
                        {item.par_level} {item.unit_of_measure}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          stockStatus.color === "red"
                            ? "bg-gradient-to-r from-red-400 to-red-600"
                            : stockStatus.color === "yellow"
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                            : stockStatus.color === "blue"
                            ? "bg-gradient-to-r from-blue-400 to-indigo-500"
                            : "bg-gradient-to-r from-green-400 to-green-600"
                        }`}
                        style={{
                          width: `${Math.min(
                            (item.current_quantity / item.par_level) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-between items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          stockStatus.color === "red"
                            ? "bg-red-100 text-red-800"
                            : stockStatus.color === "yellow"
                            ? "bg-yellow-100 text-yellow-800"
                            : stockStatus.color === "blue"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {stockStatus.text}
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round(
                          (item.current_quantity / item.par_level) * 100
                        )}
                        %
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/items/${item.id}/edit`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                    >
                      <PencilIcon className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      disabled={deleteMutation.isPending}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
          <CubeIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || selectedCategory ? "No items found" : "No items yet"}
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            {searchTerm || selectedCategory
              ? "Try adjusting your search or filter criteria."
              : "Get started by adding your first inventory item."}
          </p>
          <Link
            to="/items/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Your First Item
          </Link>
        </div>
      )}
    </div>
  );
}
