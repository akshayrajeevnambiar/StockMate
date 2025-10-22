import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { itemsService } from "../services/items";
import { ItemCategory, type ItemCreate } from "../types";

export default function ItemFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: item } = useQuery({
    queryKey: ["item", id],
    queryFn: () => itemsService.getItem(id!),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemCreate>();

  useEffect(() => {
    if (item) {
      reset(item);
    }
  }, [item, reset]);

  const createMutation = useMutation({
    mutationFn: itemsService.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      navigate("/items");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ItemCreate) => itemsService.updateItem(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item", id] });
      navigate("/items");
    },
  });

  const onSubmit = (data: ItemCreate) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Edit Item" : "Create New Item"}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {isEdit
            ? "Update the item details below"
            : "Fill in the details to create a new item"}
        </p>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-4 py-5 sm:p-6 space-y-6"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Item Name *
              </label>
              <input
                {...register("name", { required: "Name is required" })}
                type="text"
                id="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category *
              </label>
              <select
                {...register("category", { required: "Category is required" })}
                id="category"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select a category</option>
                {Object.values(ItemCategory).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                {...register("description")}
                id="description"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="unit_of_measure"
                className="block text-sm font-medium text-gray-700"
              >
                Unit of Measure *
              </label>
              <input
                {...register("unit_of_measure", {
                  required: "Unit of measure is required",
                })}
                type="text"
                id="unit_of_measure"
                placeholder="e.g., piece, kg, liter"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.unit_of_measure && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.unit_of_measure.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="par_level"
                className="block text-sm font-medium text-gray-700"
              >
                Par Level *
              </label>
              <input
                {...register("par_level", {
                  required: "Par level is required",
                  min: { value: 0, message: "Must be 0 or greater" },
                  valueAsNumber: true,
                })}
                type="number"
                id="par_level"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.par_level && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.par_level.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="current_quantity"
                className="block text-sm font-medium text-gray-700"
              >
                Current Quantity *
              </label>
              <input
                {...register("current_quantity", {
                  required: "Current quantity is required",
                  min: { value: 0, message: "Must be 0 or greater" },
                  valueAsNumber: true,
                })}
                type="number"
                id="current_quantity"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.current_quantity && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.current_quantity.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/items")}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Saving..." : isEdit ? "Update Item" : "Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
