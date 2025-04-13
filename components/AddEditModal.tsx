"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import isEqual from "lodash/isEqual";


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
  interest_per_month: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value
    )
    .required("Interest per month is required."),
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
}: {
  initialData?: any;
  closeModal: () => void;
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

  const onSubmit = (data: any) => {
    setIsSubmitting(true);
    console.log("Form Submitted:", data);

    setTimeout(() => {
      setIsSubmitting(false);
      closeModal();
      alert(initialData ? "Loan updated successfully!" : "Loan created successfully!");
    }, 1000);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black opacity-50 z-10" onClick={closeModal}></div>

      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center z-20 px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-3xl overflow-y-auto max-h-screen p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-semibold text-gray-700">
                {initialData ? "Update Loan" : "Create Loan"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-600 hover:text-gray-800 text-2xl font-bold"
              >
                &times;
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

              {/* Interest Per Month */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Interest Per Month (₹)</label>
                <input
                  type="number"
                  {...register("interest_per_month")}
                  className={`w-full px-4 py-2 mt-1 border rounded-md shadow-sm ${errors.interest_per_month ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.interest_per_month && <p className="text-xs text-red-500">{errors.interest_per_month.message}</p>}
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
                  {errors.earned_amount && <p className="text-xs text-red-500">{errors.earned_amount.message}</p>}
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
