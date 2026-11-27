import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import ModalBasic from "@components/ui/ModalBasic";
import StatusBadge, { getStatusTone } from "@components/ui/StatusBadge";
import { TextareaField } from "@components/fields/TextareaField";
import {
  getLeaveBalance,
  reviewLeaveRequest,
  cancelLeaveRequest,
} from "@store/slices/leave.slice";
import { formatDate } from "@utils/date.utils";

const MODE_META = {
  APPROVE: {
    title: "Approve Leave Request",
    btn: "Approve",
    btnClass: "btn-primary",
    requireRemarks: false,
  },
  REJECT: {
    title: "Reject Leave Request",
    btn: "Reject",
    btnClass: "btn-danger",
    requireRemarks: true,
  },
  RETURN: {
    title: "Return Leave Request for Changes",
    btn: "Return to Employee",
    btnClass: "btn-warning",
    requireRemarks: true,
  },
  CANCEL: {
    title: "Cancel Leave Request",
    btn: "Confirm Cancel",
    btnClass: "btn-danger",
    requireRemarks: false,
  },
};

export default function LeaveReviewModal({
  isOpen,
  onClose,
  request,
  mode = "APPROVE",
  onSuccess,
}) {
  const dispatch = useDispatch();
  const { balance, isLoadingBalance, isMutatingLeave } = useSelector((state) => state.leave);
  const meta = MODE_META[mode] || MODE_META.APPROVE;
  const isCancel = mode === "CANCEL";

  useEffect(() => {
    if (!isOpen || isCancel || !request?.employeeId) return;
    const year = request.startDate
      ? new Date(request.startDate).getFullYear()
      : new Date().getFullYear();
    dispatch(
      getLeaveBalance({
        employeeId: request.employeeId,
        params: { leaveType: request.leaveType || "CASUAL", year },
      })
    );
  }, [dispatch, isOpen, isCancel, request]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { remarks: "" },
    validationSchema: Yup.object({
      remarks: meta.requireRemarks
        ? Yup.string().trim().min(3, "Remarks are required").required("Remarks are required")
        : Yup.string().nullable(),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (!request) return;
      try {
        if (isCancel) {
          await dispatch(
            cancelLeaveRequest({
              id: request.id,
              values: {
                ...(values.remarks.trim() ? { reason: values.remarks.trim() } : {}),
                expectedVersion: request.version ?? 0,
              },
            })
          ).unwrap();
        } else {
          await dispatch(
            reviewLeaveRequest({
              id: request.id,
              values: {
                action: mode,
                ...(values.remarks.trim() ? { remarks: values.remarks.trim() } : {}),
                expectedVersion: request.version ?? 0,
              },
            })
          ).unwrap();
        }
        resetForm();
        onClose();
        onSuccess?.();
      } catch {
        // handled in slice
      }
    },
  });

  if (!request) return null;

  const allocated = Number(balance?.allocatedDays ?? 0);
  const carried = Number(balance?.carriedOverDays ?? 0);
  const used = Number(balance?.usedDays ?? 0);
  const pending = Number(balance?.pendingDays ?? 0);
  const available = allocated + carried - used - pending;

  return (
    <ModalBasic isOpen={isOpen} onClose={onClose} title={meta.title} size="md">
      <form onSubmit={formik.handleSubmit} className="space-y-4 p-6 text-xs">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <strong className="text-sm text-slate-800 dark:text-white">
              {request.employee?.displayName || "Employee"}
            </strong>
            <StatusBadge
              label={request.leaveType || "CASUAL"}
              tone={getStatusTone(request.status || "PENDING")}
              size="xs"
            />
          </div>
          <p className="text-slate-500 tabular-nums">
            {formatDate(request.startDate || request.fromDate)} →{" "}
            {formatDate(request.endDate || request.toDate)}
            {request.totalDays != null ? ` (${request.totalDays} days)` : ""}
          </p>
          {request.reason && (
            <p className="text-slate-600 dark:text-slate-300">Reason: {request.reason}</p>
          )}
        </div>

        {!isCancel && (
          <div className="rounded-lg border border-slate-200 dark:border-slate-700/60 px-3.5 py-2.5 flex items-center justify-between tabular-nums">
            <span className="text-slate-500">Available balance ({request.leaveType})</span>
            {isLoadingBalance ? (
              <span className="text-slate-400">Checking...</span>
            ) : (
              <strong className={available > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}>
                {available} days ({allocated}+{carried} − {used} used − {pending} pending)
              </strong>
            )}
          </div>
        )}

        <TextareaField
          id="reviewRemarks"
          name="remarks"
          label={
            isCancel
              ? "Cancellation Reason (Optional)"
              : meta.requireRemarks
                ? "Remarks"
                : "Remarks (Optional)"
          }
          required={meta.requireRemarks}
          placeholder={
            mode === "RETURN"
              ? "e.g. End date crosses site shutdown — split request"
              : "Add remarks..."
          }
          value={formik.values.remarks}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.remarks && formik.errors.remarks}
        />

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
            Close
          </button>
          <button
            type="submit"
            disabled={isMutatingLeave}
            className={`btn ${meta.btnClass} btn-sm`}
          >
            {isMutatingLeave ? "Processing..." : meta.btn}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}
