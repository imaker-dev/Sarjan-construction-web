import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import ModalBasic from "@components/ui/ModalBasic";
import { InputField } from "@components/fields/InputField";
import { TextareaField } from "@components/fields/TextareaField";
import {
  formatInr,
  formikFieldProps,
  newIdempotencyKey,
} from "@utils/wallet.utils";

export default function ConfirmReceiptModal({
  isOpen,
  onClose,
  transfer,
  onSubmit,
  isSubmitting,
}) {
  const maxAmt = Number(transfer?.amount || 0);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      receivedAmount: maxAmt ? maxAmt.toFixed(2) : "",
      discrepancyNote: "",
    },
    validationSchema: Yup.object({
      receivedAmount: Yup.number()
        .typeError("Enter a valid INR amount")
        .min(0, "Cannot be negative")
        .max(maxAmt || Infinity, `Cannot exceed ${formatInr(maxAmt)}`)
        .required("Received amount is required"),
      discrepancyNote: Yup.string().when("receivedAmount", {
        is: (val) => Number(val) < maxAmt,
        then: (s) =>
          s
            .trim()
            .required("Discrepancy note is required when received amount is less than transferred"),
        otherwise: (s) => s.notRequired(),
      }),
    }),
    onSubmit: async (values) => {
      const received = Number(values.receivedAmount).toFixed(2);
      await onSubmit({
        transferId: transfer.id,
        values: {
          receivedAmount: received,
          ...(values.discrepancyNote?.trim()
            ? { discrepancyNote: values.discrepancyNote.trim() }
            : {}),
          idempotencyKey: newIdempotencyKey("pi-cf"),
        },
      });
    },
  });

  const isPartial = Number(formik.values.receivedAmount || 0) < maxAmt;

  return (
    <ModalBasic
      id="confirm-receipt-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Physical Receipt"
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-800/30 p-3 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Recorded Transfer</span>
            <span className="font-bold text-slate-800 dark:text-white tabular-nums">
              {formatInr(maxAmt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Reference</span>
            <span className="font-mono text-slate-600 dark:text-slate-300">
              {transfer?.reference || "—"}
            </span>
          </div>
        </div>

        <p className="text-xs text-emerald-600 dark:text-emerald-400">
          Only the amount you confirm here will be credited to the site wallet.
        </p>

        <InputField
          label="Received Amount (INR)"
          {...formikFieldProps(formik, "receivedAmount")}
          type="number"
          required
        />

        {isPartial && (
          <TextareaField
            label="Discrepancy Note (Partial / Zero Receipt)"
            {...formikFieldProps(formik, "discrepancyNote")}
            required
            rows={3}
            placeholder="Explain why the received amount is less than the recorded transfer..."
          />
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
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
            className="btn btn-primary btn-sm"
          >
            {isSubmitting ? "Confirming..." : "Confirm Receipt"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}
