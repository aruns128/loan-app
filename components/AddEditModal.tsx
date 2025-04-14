"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import isEqual from "lodash/isEqual";
import { IoCloseCircleOutline } from "react-icons/io5";
import { fetcher } from "@/app/lib/apiService";


// Yup validation schema
const loanValidationSchema = yup.object({
  borrower_name: yup.string().required("Borrower name is required."),
  address: yup.string().required("Address is required."),
  roi_per_month: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .positive("ROI per month should be greater than zero.")
    .required("ROI per month is required."),
  period_month: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .positive("Loan period should be greater than zero.")
    .required("Loan period is required."),
  start_date: yup.date().required("Start date is required."),
  principal: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .positive("Principal amount should be greater than zero.")
    .required("Principal amount is required."),
  status: yup.string().oneOf(["Live", "Returned"]).required("Loan status is required."),
  earned_amount: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .when("status", {
      is: "Returned",
      then: (schema) => schema.required("Earned amount is required."),
      otherwise: (schema) => schema.notRequired(),
    }),
});

const AddEditModal = ({
  initialData,
  closeModal,
  refreshData
}: {
  initialData?: any;
  closeModal: () => void;
  refreshData:()=>void;
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(loanValidationSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const statusValue = watch("status");
  const watchedValues = watch();

  useEffect(() => {
    if (initialData) {
      const formattedData = {
        ...initialData,
        start_date: new Date(initialData.start_date).toISOString().split("T")[0],
      };
      reset(formattedData);
    }
  }, [initialData, reset]);

  useEffect(() => {
    if (!initialData) {
      setIsFormChanged(true);
      return;
    }

    const cleanedInitialData = {
      ...initialData,
      start_date: new Date(initialData.start_date).toISOString().split("T")[0],
      earned_amount: initialData.status === "Returned" ? initialData.earned_amount : undefined,
    };

    const cleanedWatchedValues = {
      ...watchedValues,
      earned_amount: watchedValues.status === "Returned" ? watchedValues.earned_amount : undefined,
    };

    setIsFormChanged(!isEqual(cleanedInitialData, cleanedWatchedValues));
  }, [watchedValues, initialData]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    // Calculate interest_per_month
    const interest_per_month = (data.roi_per_month / 100) * data.principal;
    const months_elapsed = Math.floor(
      (new Date().getTime() - new Date(data.start_date).getTime()) / (1000 * 3600 * 24 * 30)
    );
    const total_year = months_elapsed / 12;

    const updatedData = {
      ...data,
      interest_per_month,
      months_elapsed,
      total_year,
      earned_amount: data.earned_amount || 0

    };

    try {
      const res = await fetch(
        initialData ? `/api/loans/${initialData._id}` : "/api/loans",
        {
          method: initialData ? "PATCH" : "POST",
          body: JSON.stringify(updatedData),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (res.ok) {
        refreshData(); // Refresh local data
        closeModal(); // Close the modal
      } else {
        const error = await res.json();
        console.error("Error:", error.message || "Unknown error");
        alert("Failed to save loan.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black opacity-50 z-10" onClick={closeModal}></div>

      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center z-20 px-2 sm:px-6">
        <div
          className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md sm:max-w-3xl overflow-y-auto max-h-[90vh] p-6 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-700">
                {initialData ? "Update Loan" : "Create Loan"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-red-600 hover:text-red-400 text-2xl font-bold cursor-pointer"
              >
                <IoCloseCircleOutline />
              </button>
            </div>

            <div className="space-y-5">
              {/* Borrower Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Borrower Name</label>
                <input
                  {...register("borrower_name")}
                  className={`w-full px-4 py-2 mt-1 border rounded-md shadow-sm ${errors.borrower_name ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter borrower's name"
                />
                {errors.borrower_name && <p className="text-xs text-red-500">{errors.borrower_name.message}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  {...register("address")}
                  className={`w-full px-4 py-2 mt-1 border rounded-md shadow-sm ${errors.address ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter address"
                />
                {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
              </div>

              {/* ROI Per Month */}
              <div>
                <label className="block text-sm font-medium text-gray-700">ROI Per Month (%)</label>
                <input
                  type="number"
                  {...register("roi_per_month")}
                  className={`w-full px-4 py-2 mt-1 border rounded-md shadow-sm ${errors.roi_per_month ? "border-red-500" : "border-gray-300"}`}
                  placeholder="e.g., 2"
                />
                {errors.roi_per_month && <p className="text-xs text-red-500">{errors.roi_per_month.message}</p>}
              </div>

              {/* Loan Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Loan Period (Months)</label>
                <input
                  type="number"
                  {...register("period_month")}
                  className={`w-full px-4 py-2 mt-1 border rounded-md shadow-sm ${errors.period_month ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.period_month && <p className="text-xs text-red-500">{errors.period_month.message}</p>}
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  {...register("start_date")}
                  className={`w-full px-4 py-2 mt-1 border rounded-md shadow-sm ${errors.start_date ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.start_date && <p className="text-xs text-red-500">{errors.start_date.message}</p>}
              </div>

              {/* Principal */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Principal (₹)</label>
                <input
                  type="number"
                  {...register("principal")}
                  className={`w-full px-4 py-2 mt-1 border rounded-md shadow-sm ${errors.principal ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.principal && <p className="text-xs text-red-500">{errors.principal.message}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  {...register("status")}
                  className={`w-full px-4 py-2 mt-1 border rounded-md shadow-sm ${errors.status ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="Live">Live</option>
                  <option value="Returned">Returned</option>
                </select>
                {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
              </div>

              {/* Earned Amount (if status is Returned) */}
              {statusValue === "Returned" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Earned Amount (₹)</label>
                  <input
                    type="number"
                    {...register("earned_amount")}
                    className={`w-full px-4 py-2 mt-1 border rounded-md shadow-sm ${errors.earned_amount ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.earned_amount  && <p className="text-xs text-red-500">{errors.earned_amount.message}</p>}
                </div>
              )}

              {/* Submit Button */}
              <div className="text-center mt-6">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
                  disabled={isSubmitting || (initialData && !isFormChanged)}
                >
                  {isSubmitting ? "Submitting..." : initialData ? "Update Loan" : "Create Loan"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddEditModal;
