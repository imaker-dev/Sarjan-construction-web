import React from "react";
import {
  IconArrowLeft,
  IconRefresh,
  IconPrinter,
  IconPencil,
  IconCalculator,
  IconCheck,
  IconAlertTriangle,
  IconLock,
  IconFileTypePdf,
  IconFileTypeXls,
} from "@tabler/icons-react";

/**
 * Top navigation and lifecycle action bar for DailyReportDetailsPage.
 */
export default function DailyReportActionBar({
  status,
  isLocked,
  isApproved,
  isLoadingDetails,
  isSubmittingReport,
  isApprovingReport,
  isExportingReport,
  onBack,
  onRefresh,
  onPrint,
  onExportPdf,
  onExportExcel,
  onEditHeader,
  onRecalculate,
  onSubmit,
  onReject,
  onApprove,
  onLock,
}) {
  const canSubmit = !isLocked && (status === "DRAFT" || status === "REJECTED");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <IconArrowLeft size={16} />
        <span>Back to All Daily Reports</span>
      </button>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          className="btn btn-outline btn-sm"
          title="Refresh details"
        >
          <IconRefresh size={15} className={isLoadingDetails ? "animate-spin" : ""} />
        </button>

        <button
          type="button"
          onClick={onPrint}
          className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
          title="Print DSR"
        >
          <IconPrinter size={15} />
          <span>Print</span>
        </button>

        <button
          type="button"
          onClick={onExportPdf}
          disabled={isExportingReport}
          className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
          title="Download DSR as PDF"
        >
          <IconFileTypePdf size={15} className="text-rose-500" />
          <span>PDF</span>
        </button>

        <button
          type="button"
          onClick={onExportExcel}
          disabled={isExportingReport}
          className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
          title="Download DSR as Excel (.xlsx)"
        >
          <IconFileTypeXls size={15} className="text-emerald-600" />
          <span>Excel</span>
        </button>

        {!isLocked && (
          <>
            <button
              type="button"
              onClick={onEditHeader}
              className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
              title="Edit Weather & Diary Notes"
            >
              <IconPencil size={15} />
              <span>Edit Details</span>
            </button>

            <button
              type="button"
              onClick={onRecalculate}
              className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
            >
              <IconCalculator size={15} />
              <span>Recalculate Day</span>
            </button>
          </>
        )}

        {canSubmit && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmittingReport}
            className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
          >
            {isSubmittingReport ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <IconCheck size={15} />
            )}
            <span>Submit for Review</span>
          </button>
        )}

        {status === "SUBMITTED" && (
          <>
            <button
              type="button"
              onClick={onReject}
              className="btn btn-outline btn-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 inline-flex items-center gap-1.5"
            >
              <IconAlertTriangle size={15} />
              <span>Request Revisions</span>
            </button>

            <button
              type="button"
              onClick={onApprove}
              disabled={isApprovingReport}
              className="btn btn-success btn-sm inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isApprovingReport ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <IconCheck size={15} />
              )}
              <span>Approve Report</span>
            </button>
          </>
        )}

        {isApproved && (
          <button
            type="button"
            onClick={onLock}
            className="btn btn-danger btn-sm inline-flex items-center gap-1.5"
          >
            <IconLock size={15} />
            <span>Lock Report</span>
          </button>
        )}
      </div>
    </div>
  );
}
