import React, { useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import ModalBasic from "@components/ui/ModalBasic";
import { InputField } from "@components/fields/InputField";
import { TextareaField } from "@components/fields/TextareaField";
import { formikFieldProps, newIdempotencyKey } from "@utils/wallet.utils";

export default function FundingRequestModal({
  isOpen,
  onClose,
  editingRequest,
  onSubmit,
  isSubmitting,
}) {
  const isEdit = Boolean(editingRequest);
  const submitNowRef = useRef(false);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      amount: editingRequest?.draftAmount || "",
      purpose: editingRequest?.draftPurpose || "",
      neededByDate: editingRequest?.draftNeededByDate
        ? String(editingRequest.draftNeededByDate).slice(0, 10)
        : "",
    },
    validationSchema: Yup.object({
      amount: Yup.number()
        .typeError("Enter a valid INR amount")
        .positive("Amount must be greater than 0")
        .required("Amount is required"),
      purpose: Yup.string()
        .trim()
        .min(1)
        .max(500, "Max 500 characters")
        .required("Purpose is required"),
      neededByDate: Yup.string().nullable(),
    }),
    onSubmit: async (values, { resetForm }) => {
      const submitToFinance = submitNowRef.current;
      submitNowRef.current = false;

      if (isEdit) {
        await onSubmit({
          isEdit: true,
          submitToFinance,
          requestId: editingRequest.id,
          values: {
            amount: Number(values.amount).toFixed(2),
            purpose: values.purpose.trim(),
            neededByDate: values.neededByDate || null,
            expectedVersion: editingRequest.version ?? 0,
          },
        });
      } else {
        await onSubmit({
          isEdit: false,
          submitToFinance,
          values: {
            amount: Number(values.amount).toFixed(2),
            purpose: values.purpose.trim(),
            ...(values.neededByDate ? { neededByDate: values.neededByDate } : {}),
            idempotencyKey: newIdempotencyKey("pi-fr"),
          },
        });
        resetForm();
      }
    },
  });

  return (
    <ModalBasic
      id="site-funding-request-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Funding Request" : "New Funding Request"}
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
        <InputField
          label="Amount (INR)"
          {...formikFieldProps(formik, "amount")}
          type="number"
          required
          placeholder="e.g. 50000.00"
        />

        <TextareaField
          label="Purpose"
          {...formikFieldProps(formik, "purpose")}
          required
          rows={3}
          placeholder="Site consumables and petty purchases..."
        />

        <InputField
          label="Needed By Date (Optional)"
          {...formikFieldProps(formik, "neededByDate")}
          type="date"
        />

        <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={() => {
              submitNowRef.current = false;
            }}
            className="btn btn-outline btn-sm"
          >
            {isSubmitting ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={() => {
              submitNowRef.current = true;
            }}
            className="btn btn-primary btn-sm"
          >
            {isSubmitting ? "Submitting..." : "Save & Submit to Finance"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}
