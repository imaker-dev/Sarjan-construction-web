import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import ModalBasic from "@components/ui/ModalBasic";
import { InputField } from "@components/fields/InputField";
import { TextareaField } from "@components/fields/TextareaField";
import {
  formatInr,
  formikFieldProps,
  newIdempotencyKey,
} from "@utils/wallet.utils";

export default function PostExpenseModal({
  isOpen,
  onClose,
  accountHeads = [],
  onSubmit,
  isSubmitting,
}) {
  const activeHeads = accountHeads.filter((h) => h.status === "ACTIVE");

  const formik = useFormik({
    initialValues: {
      amount: "",
      expenseDate: new Date().toISOString().slice(0, 10),
      description: "",
      payee: "",
      reference: "",
      generateVoucher: true,
      narration: "",
      accountLines: [{ accountHeadId: "", amount: "" }],
    },
    validationSchema: Yup.object({
      amount: Yup.number()
        .typeError("Enter valid INR amount")
        .positive("Must be greater than 0")
        .required("Total amount is required"),
      expenseDate: Yup.string().required("Expense date is required"),
      description: Yup.string().trim().required("Description is required"),
      payee: Yup.string().trim().required("Payee name is required"),
      reference: Yup.string(),
    }),
    onSubmit: async (values, { resetForm }) => {
      const total = Number(values.amount || 0);
      const validLines = values.accountLines.filter(
        (l) => l.accountHeadId && Number(l.amount) > 0
      );
      const linesSum = validLines.reduce((s, l) => s + Number(l.amount), 0);

      if (validLines.length === 0) {
        formik.setFieldError("amount", "Add at least one account head line");
        return;
      }
      if (Math.abs(linesSum - total) > 0.009) {
        formik.setFieldError(
          "amount",
          `Account lines sum (${formatInr(linesSum)}) must equal total (${formatInr(total)})`
        );
        return;
      }

      const payload = {
        amount: total.toFixed(2),
        expenseDate: values.expenseDate,
        description: values.description.trim(),
        payee: values.payee.trim(),
        ...(values.reference.trim() ? { reference: values.reference.trim() } : {}),
        accountLines: validLines.map((l) => ({
          accountHeadId: l.accountHeadId,
          amount: Number(l.amount).toFixed(2),
        })),
        idempotencyKey: newIdempotencyKey("pi-exp"),
        ...(values.generateVoucher
          ? {
              voucher: {
                paidTo: values.payee.trim(),
                narration: (values.narration || values.description).trim(),
              },
            }
          : {}),
      };

      await onSubmit(payload);
      resetForm();
    },
  });

  const addLine = () => {
    formik.setFieldValue("accountLines", [
      ...formik.values.accountLines,
      { accountHeadId: "", amount: "" },
    ]);
  };

  const removeLine = (idx) => {
    if (formik.values.accountLines.length <= 1) return;
    formik.setFieldValue(
      "accountLines",
      formik.values.accountLines.filter((_, i) => i !== idx)
    );
  };

  const updateLine = (idx, field, val) => {
    const next = formik.values.accountLines.map((l, i) =>
      i === idx ? { ...l, [field]: val } : l
    );
    formik.setFieldValue("accountLines", next);
  };

  return (
    <ModalBasic
      id="post-expense-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Post Site Expense"
      size="lg"
    >
      <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField
            label="Total Amount (INR)"
            {...formikFieldProps(formik, "amount")}
            type="number"
            required
            placeholder="e.g. 1250.00"
          />
          <InputField
            label="Expense Date"
            {...formikFieldProps(formik, "expenseDate")}
            type="date"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField
            label="Payee"
            {...formikFieldProps(formik, "payee")}
            required
            placeholder="e.g. Ramesh Kumar"
          />
          <InputField
            label="Bill / Invoice Reference"
            {...formikFieldProps(formik, "reference")}
            placeholder="e.g. INV-881"
          />
        </div>

        <TextareaField
          label="Description"
          {...formikFieldProps(formik, "description")}
          required
          rows={2}
          placeholder="Cement for footing work..."
        />

        {/* Account Head Split Lines */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Account Head Breakdown
            </span>
            <button
              type="button"
              onClick={addLine}
              className="btn btn-outline btn-xs inline-flex items-center gap-1"
            >
              <IconPlus size={13} />
              <span>Add Line</span>
            </button>
          </div>

          {formik.values.accountLines.map((line, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <select
                value={line.accountHeadId}
                onChange={(e) =>
                  updateLine(idx, "accountHeadId", e.target.value)
                }
                className="form-select form-sm flex-1"
                required
              >
                <option value="">Select Account Head</option>
                {activeHeads.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.code} — {h.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={line.amount}
                onChange={(e) => updateLine(idx, "amount", e.target.value)}
                className="form-input form-sm w-32 tabular-nums"
                required
              />
              {formik.values.accountLines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLine(idx)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg"
                >
                  <IconTrash size={15} />
                </button>
              )}
            </div>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={formik.values.generateVoucher}
            onChange={(e) =>
              formik.setFieldValue("generateVoucher", e.target.checked)
            }
            className="rounded border-slate-300"
          />
          <span>Generate Sarjan Cash Voucher automatically</span>
        </label>

        {formik.values.generateVoucher && (
          <InputField
            label="Voucher Narration (Optional)"
            {...formikFieldProps(formik, "narration")}
            placeholder="Defaults to description if blank"
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
            {isSubmitting ? "Posting..." : "Post Expense"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}
