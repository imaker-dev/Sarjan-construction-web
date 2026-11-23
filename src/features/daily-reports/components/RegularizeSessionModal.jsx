import React from "react";
import ModalBasic from "@components/ui/ModalBasic";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { regularizeAttendanceSession } from "@store/slices/attendance.slice";
import {
  IconClock,
  IconAlertTriangle,
  IconCheck,
  IconUser,
} from "@tabler/icons-react";

/**
 * Format ISO date string into datetime-local input format: "YYYY-MM-DDTHH:mm"
 */
function toDateTimeLocal(isoStr, fallbackDateStr) {
  if (!isoStr) {
    if (fallbackDateStr) {
      return `${fallbackDateStr}T08:00`;
    }
    return "";
  }
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const validationSchema = Yup.object({
  punchInAt: Yup.string().required("Punch-in timestamp is required"),
  punchOutAt: Yup.string().nullable(),
  presentUnits: Yup.number()
    .min(0, "Cannot be negative")
    .max(5, "Maximum 5 units")
    .required("Present Hazri units is required"),
  overtimeHours: Yup.number()
    .min(0, "Cannot be negative")
    .max(24, "Maximum 24 hours")
    .required("Overtime hours is required"),
  remarks: Yup.string()
    .trim()
    .min(3, "Audit justification must be at least 3 characters")
    .max(500, "Maximum 500 characters")
    .required("Mandatory reason is required for attendance audit log"),
});

export default function RegularizeSessionModal({
  isOpen,
  onClose,
  session,
  businessDate,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const { isRegularizing } = useSelector((state) => state.attendance);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      punchInAt: toDateTimeLocal(session?.punchInAt, businessDate),
      punchOutAt: toDateTimeLocal(session?.punchOutAt, businessDate),
      presentUnits: session?.presentUnits ?? 1.0,
      overtimeHours: session?.overtimeHours ?? 0,
      remarks: session?.regularizationReason || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!session?.id) return;
      try {
        const payload = {
          id: session.id,
          values: {
            punchInAt: new Date(values.punchInAt).toISOString(),
            punchOutAt: values.punchOutAt
              ? new Date(values.punchOutAt).toISOString()
              : undefined,
            presentUnits: Number(values.presentUnits),
            overtimeHours: Number(values.overtimeHours),
            remarks: values.remarks.trim(),
          },
        };

        await dispatch(regularizeAttendanceSession(payload)).unwrap();
        formik.resetForm();
        onClose();
        if (onSuccess) onSuccess();
      } catch {
        // toast error handled in slice
      }
    },
  });

  if (!session) return null;

  const empName = session.employee?.displayName || "Worker";
  const empCode = session.employee?.employeeCode || "—";
  const isAutoClosed = session.status === "AUTO_CLOSED";

  return (
    <ModalBasic
      isOpen={isOpen}
      onClose={onClose}
      title="Regularize Worker Attendance"
      description={`Employee: ${empName} (${empCode}) • Date: ${businessDate || session.businessDate}`}
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4 p-6">
        {/* Flag Alert if session was auto-closed or missing punch */}
        {isAutoClosed && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-700 dark:text-amber-300">
            <div className="flex items-center gap-2 font-semibold">
              <IconAlertTriangle size={16} className="shrink-0" />
              Missing Punch-Out (Auto-Closed Session)
            </div>
            <p className="mt-1 leading-relaxed">
              This session was auto-closed by the end-of-day cutoff because no departure punch was recorded. Please provide the verified departure time and audit reason below.
            </p>
          </div>
        )}

        {/* Timestamps Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Punch-In Time <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="punchInAt"
              value={formik.values.punchInAt}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`form-input w-full text-xs ${
                formik.touched.punchInAt && formik.errors.punchInAt
                  ? "border-rose-500"
                  : ""
              }`}
            />
            {formik.touched.punchInAt && formik.errors.punchInAt && (
              <p className="text-[11px] font-medium text-rose-500">
                {formik.errors.punchInAt}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Punch-Out Time
            </label>
            <input
              type="datetime-local"
              name="punchOutAt"
              value={formik.values.punchOutAt}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="form-input w-full text-xs"
            />
            {formik.touched.punchOutAt && formik.errors.punchOutAt && (
              <p className="text-[11px] font-medium text-rose-500">
                {formik.errors.punchOutAt}
              </p>
            )}
          </div>
        </div>

        {/* Hazri Units & Overtime */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Attendance Units (Hazri) <span className="text-rose-500">*</span>
            </label>
            <select
              name="presentUnits"
              value={formik.values.presentUnits}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="form-select w-full text-xs"
            >
              <option value="1.0">1.0 — Full Day Hazri</option>
              <option value="0.5">0.5 — Half Day Hazri</option>
              <option value="0.0">0.0 — Absent / Under-hours</option>
              <option value="1.5">1.5 — Extended 1.5 Shift</option>
              <option value="2.0">2.0 — Double Shift</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Overtime Hours
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              name="overtimeHours"
              value={formik.values.overtimeHours}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="form-input w-full text-xs"
              placeholder="0.0"
            />
          </div>
        </div>

        {/* Audit Justification */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Mandatory Justification / Remarks <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            name="remarks"
            value={formik.values.remarks}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. Worker departure verified by Site Engineer at 17:30. Biometric kiosk was offline at Gate 2."
            className={`form-textarea w-full text-xs ${
              formik.touched.remarks && formik.errors.remarks
                ? "border-rose-500 focus:border-rose-500"
                : ""
            }`}
          />
          {formik.touched.remarks && formik.errors.remarks && (
            <p className="text-[11px] font-medium text-rose-500">
              {formik.errors.remarks}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Minimum 3 characters. This explanation is permanently logged in the employee attendance audit trail.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
            disabled={isRegularizing}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
            disabled={isRegularizing || !formik.isValid}
          >
            {isRegularizing ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <IconCheck size={15} />
            )}
            <span>Save Regularization</span>
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}
