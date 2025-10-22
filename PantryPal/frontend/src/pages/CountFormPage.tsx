import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useCount, useCreateCount, useUpdateCount } from "../services/counts";
import { itemsService } from "../services/items";
import type { CountCreate, Item, Count } from "../types";

interface CountFormData {
  count_date: string;
  notes: string;
  items: Array<{
    item_id: string;
    expected_quantity: number;
    actual_quantity: number;
    notes: string;
  }>;
}

export default function CountFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const { data: count, isLoading: isLoadingCount } = useCount(id || "");
  const { data: items = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ["items"],
    queryFn: () => itemsService.getItems(),
  });
  const createCount = useCreateCount();
  const updateCount = useUpdateCount();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CountFormData>({
    defaultValues: {
      count_date: new Date().toISOString().split("T")[0],
      notes: "",
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");

  // Populate form when editing
  useEffect(() => {
    if (isEditing && count && !isLoadingCount) {
      setValue("count_date", count.count_date.split("T")[0]);
      setValue("notes", count.notes || "");
      setValue(
        "items",
        count.items.map((item) => ({
          item_id: item.item_id,
          expected_quantity: item.expected_quantity,
          actual_quantity: item.actual_quantity,
          notes: item.notes || "",
        }))
      );

      const itemIds = new Set(count.items.map((item) => item.item_id));
      setSelectedItems(itemIds);
    }
  }, [count, isEditing, isLoadingCount, setValue]);

  const handleAddItem = (itemId: string) => {
    const item = items.find((i: Item) => i.id === itemId);
    if (!item || selectedItems.has(itemId)) return;

    append({
      item_id: itemId,
      expected_quantity: item.current_quantity,
      actual_quantity: 0,
      notes: "",
    });

    setSelectedItems((prev) => new Set([...prev, itemId]));
  };

  const handleRemoveItem = (index: number) => {
    const itemId = watchedItems[index]?.item_id;
    if (itemId) {
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
    remove(index);
  };

  const onSubmit = async (data: CountFormData) => {
    try {
      const countData: CountCreate = {
        count_date: data.count_date,
        notes: data.notes,
        items: data.items.map((item) => ({
          item_id: item.item_id,
          expected_quantity: item.expected_quantity,
          actual_quantity: item.actual_quantity,
          notes: item.notes,
        })),
      };

      if (isEditing) {
        // For editing, we need to convert to the correct format
        const updateData: Partial<Count> = {
          count_date: data.count_date,
          notes: data.notes,
          // Note: In a real implementation, you might need a different endpoint for updating items
        };
        await updateCount.mutateAsync({ id: id!, data: updateData });
      } else {
        await createCount.mutateAsync(countData);
      }

      navigate("/counts");
    } catch (error) {
      console.error("Failed to save count:", error);
    }
  };

  const getItemName = (itemId: string) => {
    const item = items.find((i: Item) => i.id === itemId);
    return item ? item.name : itemId;
  };

  if (isLoadingCount || isLoadingItems) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const availableItems = items.filter(
    (item: Item) => !selectedItems.has(item.id)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            to="/counts"
            className="rounded-full bg-white/70 backdrop-blur-sm border border-white/50 p-2 shadow-lg shadow-blue-500/10 transition-all hover:bg-white/80 hover:shadow-xl hover:shadow-blue-500/20"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              {isEditing ? "Edit Count" : "New Count"}
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              {isEditing
                ? "Update inventory count details"
                : "Create a new inventory count"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-blue-500/10 overflow-hidden">
            <div className="border-b border-gray-200 bg-white/50 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Count Information
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="count_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Count Date
                  </label>
                  <div className="mt-1 relative">
                    <CalendarDaysIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      id="count_date"
                      {...register("count_date", {
                        required: "Count date is required",
                      })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  {errors.count_date && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.count_date.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700"
                >
                  Notes (Optional)
                </label>
                <div className="mt-1 relative">
                  <DocumentTextIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    id="notes"
                    rows={3}
                    {...register("notes")}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Add any notes about this count..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Add Items Section */}
          {availableItems.length > 0 && (
            <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-blue-500/10 overflow-hidden">
              <div className="border-b border-gray-200 bg-white/50 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Items to Count
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Select items to include in this inventory count
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAddItem(item.id)}
                      className="group relative rounded-xl bg-white/50 border border-gray-200 p-4 text-left transition-all hover:bg-white/70 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-600">
                            Category: {item.category}
                          </p>
                          <p className="text-xs text-gray-600">
                            Current: {item.current_quantity}{" "}
                            {item.unit_of_measure}
                          </p>
                        </div>
                        <PlusIcon className="h-5 w-5 text-blue-500 group-hover:text-blue-600" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Count Items */}
          <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 shadow-xl shadow-blue-500/10 overflow-hidden">
            <div className="border-b border-gray-200 bg-white/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Count Items
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {fields.length} {fields.length === 1 ? "item" : "items"} in
                    this count
                  </p>
                </div>
                <ClipboardDocumentListIcon className="h-6 w-6 text-gray-400" />
              </div>
            </div>

            {fields.length === 0 ? (
              <div className="p-12 text-center">
                <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No items yet
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Add items from the section above to start counting.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {fields.map((field, index) => {
                  const expectedQty =
                    watchedItems[index]?.expected_quantity || 0;
                  const actualQty = watchedItems[index]?.actual_quantity || 0;
                  const discrepancy = actualQty - expectedQty;

                  return (
                    <div key={field.id} className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {getItemName(field.item_id)}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Expected Quantity
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            {...register(`items.${index}.expected_quantity`, {
                              required: "Expected quantity is required",
                              min: {
                                value: 0,
                                message: "Quantity must be 0 or greater",
                              },
                              valueAsNumber: true,
                            })}
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          {errors.items?.[index]?.expected_quantity && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.items[index]?.expected_quantity?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Actual Quantity
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            {...register(`items.${index}.actual_quantity`, {
                              required: "Actual quantity is required",
                              min: {
                                value: 0,
                                message: "Quantity must be 0 or greater",
                              },
                              valueAsNumber: true,
                            })}
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          {errors.items?.[index]?.actual_quantity && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.items[index]?.actual_quantity?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Discrepancy
                          </label>
                          <div className="mt-1 flex items-center h-10">
                            <span
                              className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                                discrepancy === 0
                                  ? "bg-green-100 text-green-800"
                                  : discrepancy > 0
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {discrepancy > 0 ? "+" : ""}
                              {discrepancy}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Notes (Optional)
                        </label>
                        <input
                          type="text"
                          {...register(`items.${index}.notes`)}
                          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Add notes about this item count..."
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Link
              to="/counts"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || fields.length === 0}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update Count"
                : "Create Count"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
