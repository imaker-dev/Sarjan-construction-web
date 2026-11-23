import React from "react";
import ModalBasic from "@components/ui/ModalBasic";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { rejectDailyReport } from "@store/slices/dailyReport.slice";
import { IconAlertTriangle, IconArrowBackUp } from "@tabler/icons-react";

const validationSchema = Yup.object({
  reason: Yup.string()
    .trim()
    .min(5, "Rejection reason must be at least 5 characters")
    .max(500, "Maximum 500 characters")
    .required("Please provide comments or corrections required for the site team"),
});

export default function RejectReportModal({
  isOpen,
  onClose,
  report,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const { isRejectingReport } = useSelector((state) => state.dailyReport);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      reason: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!report?.id) return;
      try {
        await dispatch(
          rejectDailyReport({
            id: report.id,
            reason: values.reason.trim(),
          })
        ).unwrap();
        formik.resetForm();
        onClose();
        if (onSuccess) onSuccess();
      } catch {
        // toast error handled in slice
      }
    },
  });

  if (!report) return null;

  return (
    <ModalBasic
      isOpen={isOpen}
      onClose={onClose}
      title="Request Revisions / Reject Report"
      description={`Site: ${report.site?.name || report.site?.code || "—"} • Date: ${report.businessDate}`}
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4 p-6">
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-400">
          <div className="flex items-center gap-2 font-semibold">
            <IconAlertTriangle size={17} className="shrink-0" />
            Return Report to Site Supervisor
          </div>
          <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">
            This daily report will be placed back into <strong>Rejected</strong> status. The Site In-Charge will be notified to review your remarks, adjust labour counts or notes, and resubmit.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Rejection Reason & Required Corrections <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            name="reason"
            value={formik.values.reason}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. Mason contractor headcount does not match biometric log. Please verify 2 helpers who left early at 2 PM."
            className={`form-textarea w-full text-xs ${
              formik.touched.reason && formik.errors.reason
                ? "border-rose-500 focus:border-rose-500"
                : ""
            }`}
          />
          {formik.touched.reason && formik.errors.reason && (
            <p className="text-[11px] font-medium text-rose-500">
              {formik.errors.reason}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Minimum 5 characters. This explanation is recorded permanently in the report audit trail.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
            disabled={isRejectingReport}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-danger btn-sm inline-flex items-center gap-1.5"
            disabled={isRejectingReport || !formik.isValid}
          >
            {isRejectingReport ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <IconArrowBackUp size={15} />
            )}
            <span>Reject & Request Revisions</span>
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}
