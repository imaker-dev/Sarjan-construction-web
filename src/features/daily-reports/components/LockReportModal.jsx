import React, { useState } from "react";
import ModalBasic from "@components/ui/ModalBasic";
import { useDispatch, useSelector } from "react-redux";
import { lockDailyReport } from "@store/slices/dailyReport.slice";
import { IconAlertTriangle, IconLock, IconShieldCheck } from "@tabler/icons-react";

export default function LockReportModal({ isOpen, onClose, report, onSuccess }) {
  const dispatch = useDispatch();
  const { isLockingReport } = useSelector((state) => state.dailyReport);
  const [reason, setReason] = useState("");

  if (!report) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        lockDailyReport({
          id: report.id,
          reason: reason.trim() || undefined,
        })
      ).unwrap();
      onClose();
      if (onSuccess) onSuccess();
    } catch {
      // toast error handled in slice
    }
  };

  const isApproved = report.status === "APPROVED";

  return (
    <ModalBasic
      isOpen={isOpen}
      onClose={onClose}
      title="Lock Daily Report for Payroll"
      description={`Site: ${report.site?.name || report.site?.code || "—"} • Date: ${report.businessDate}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        {/* Warning Alert */}
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-700 dark:text-rose-400">
          <div className="flex items-center gap-2 font-semibold">
            <IconAlertTriangle size={18} className="shrink-0" />
            Permanent & Irreversible Action
          </div>
          <p className="mt-1 leading-relaxed">
            Locking this report is permanent. Once locked, no site supervisor, engineer, or project manager can modify headcount, hazri units, or overtime. It becomes the legal basis for payroll disbursements and subcontractor billing.
          </p>
        </div>

        {!isApproved && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
            <strong>Warning:</strong> Current status is <strong>{report.status}</strong>. Only reports in <strong>APPROVED</strong> status can be locked. Attempting to lock this report will result in a 409 Conflict.
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Audit Reason / Billing Cycle Notes
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Audited and verified against turnstile logs for November Payroll cycle"
            className="form-textarea w-full text-xs"
          />
          <p className="text-[11px] text-muted-foreground">
            Optional notes for internal accounting and compliance audits.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            disabled={isLockingReport}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-danger"
            disabled={isLockingReport}
          >
            <IconLock size={16} />
            <span>{isLockingReport ? "Locking..." : "Confirm & Lock Report"}</span>
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}
