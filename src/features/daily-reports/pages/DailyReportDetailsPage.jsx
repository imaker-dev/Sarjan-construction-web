import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  IconArrowLeft,
  IconLock,
  IconCheck,
  IconClock,
  IconSun,
  IconCloudRain,
  IconAlertTriangle,
  IconShieldCheck,
  IconPencil,
  IconCalculator,
  IconHistory,
  IconUsers,
  IconFileText,
  IconRefresh,
  IconPrinter,
  IconClipboardList,
} from "@tabler/icons-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import LockReportModal from "../components/LockReportModal";
import RecalculateReportModal from "../components/RecalculateReportModal";
import EditLabourSummaryModal from "../components/EditLabourSummaryModal";
import RejectReportModal from "../components/RejectReportModal";
import EditDailyReportHeaderModal from "../components/EditDailyReportHeaderModal";
import RegularizeSessionModal from "../components/RegularizeSessionModal";
import PrintableDailyReport from "../components/PrintableDailyReport";
import {
  getDailyReportDetails,
  getDailyReportAuditTrail,
  clearCurrentReport,
  submitDailyReport,
  approveDailyReport,
} from "@store/slices/dailyReport.slice";
import { getMusterRoll } from "@store/slices/attendance.slice";
import { ROUTES } from "@constants/routes";

const STATUS_BADGES = {
  DRAFT:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
  SUBMITTED:
    "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40",
  APPROVED:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-semibold",
  REJECTED:
    "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40",
  LOCKED:
    "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 font-bold",
};

const CATEGORY_LABELS = {
  CAT_A_STAFF: "Staff",
  CAT_B_DIRECT_LABOUR: "Site Workers",
  CAT_C_SUBCONTRACTOR: "Contractors",
};

const CATEGORY_BADGES = {
  CAT_A_STAFF:
    "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border-blue-200",
  CAT_B_DIRECT_LABOUR:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200",
  CAT_C_SUBCONTRACTOR:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-200",
};

export default function DailyReportDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    currentReport,
    isLoadingDetails,
    auditLogs,
    isLoadingAuditTrail,
    isSubmittingReport,
    isApprovingReport,
  } = useSelector((state) => state.dailyReport);

  const { musterRoll, isFetchingMusterRoll } = useSelector(
    (state) => state.attendance
  );

  const [activeTab, setActiveTab] = useState("workforce"); // "workforce" | "sessions" | "notes" | "audit"
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isRecalcModalOpen, setIsRecalcModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isEditHeaderModalOpen, setIsEditHeaderModalOpen] = useState(false);
  const [editLabourItem, setEditLabourItem] = useState(null);
  const [selectedSessionForRegularize, setSelectedSessionForRegularize] = useState(null);

  const loadData = () => {
    if (id) {
      dispatch(getDailyReportDetails(id));
      dispatch(getDailyReportAuditTrail(id));
    }
  };

  const loadSessions = () => {
    if (currentReport?.siteId && currentReport?.businessDate) {
      dispatch(
        getMusterRoll({
          siteId: currentReport.siteId,
          period: "DAILY",
          date: currentReport.businessDate,
        })
      );
    }
  };

  useEffect(() => {
    loadSessions();
  }, [dispatch, currentReport?.siteId, currentReport?.businessDate]);

  const dailySessions = Array.isArray(musterRoll?.sessions)
    ? musterRoll.sessions
    : Array.isArray(musterRoll?.data?.sessions)
      ? musterRoll.data.sessions
      : [];

  const formatTimeStr = (isoStr) => {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSubmitReport = async () => {
    if (!id) return;
    try {
      await dispatch(submitDailyReport(id)).unwrap();
      loadData();
    } catch {
      // toast error handled in slice
    }
  };

  const handleApproveReport = async () => {
    if (!id) return;
    try {
      await dispatch(approveDailyReport(id)).unwrap();
      loadData();
    } catch {
      // toast error handled in slice
    }
  };

  useEffect(() => {
    loadData();
    return () => {
      dispatch(clearCurrentReport());
    };
  }, [dispatch, id]);

  if (isLoadingDetails && !currentReport) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!currentReport) {
    return (
      <div className="p-8 text-center space-y-4">
        <IconAlertTriangle size={42} className="mx-auto text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">
          Daily Report Not Found
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          The requested daily site report could not be found or you do not have permission to access it.
        </p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.DAILY_REPORTS.ROOT)}
          className="btn btn-outline btn-sm"
        >
          <IconArrowLeft size={16} />
          Back to Daily Reports
        </button>
      </div>
    );
  }

  const isLocked = currentReport.status === "LOCKED";
  const isApproved = currentReport.status === "APPROVED";

  const labourSummaries = Array.isArray(currentReport.labourSummaries)
    ? currentReport.labourSummaries
    : [];

  return (
    <>
      <div className="space-y-6 pb-12 print:hidden">
        {/* Top Navigation Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate(ROUTES.DAILY_REPORTS.ROOT)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconArrowLeft size={16} />
            <span>Back to All Daily Reports</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              className="btn btn-outline btn-sm"
              title="Refresh details"
            >
              <IconRefresh
                size={15}
                className={isLoadingDetails ? "animate-spin" : ""}
              />
            </button>

            {/* Print / Export DSR */}
            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
              title="Print or Export DSR for billing and payroll records"
            >
              <IconPrinter size={15} />
              <span>Print / Export DSR</span>
            </button>

          {!isLocked && (
            <>
              <button
                type="button"
                onClick={() => setIsEditHeaderModalOpen(true)}
                className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
                title="Edit Weather & Diary Notes"
              >
                <IconPencil size={15} />
                <span>Edit Details</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRecalcModalOpen(true)}
                className="btn btn-outline btn-sm inline-flex items-center gap-1.5"
              >
                <IconCalculator size={15} />
                <span>Recalculate Day</span>
              </button>
            </>
          )}

          {/* DRAFT or REJECTED: Site In-Charge can submit for review */}
          {!isLocked && (currentReport.status === "DRAFT" || currentReport.status === "REJECTED") && (
            <button
              type="button"
              onClick={handleSubmitReport}
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

          {/* SUBMITTED: Project Manager can Approve or Reject */}
          {currentReport.status === "SUBMITTED" && (
            <>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(true)}
                className="btn btn-outline btn-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 inline-flex items-center gap-1.5"
              >
                <IconAlertTriangle size={15} />
                <span>Request Revisions</span>
              </button>

              <button
                type="button"
                onClick={handleApproveReport}
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

          {/* APPROVED: HO Admin can permanently lock */}
          {isApproved && (
            <button
              type="button"
              onClick={() => setIsLockModalOpen(true)}
              className="btn btn-danger btn-sm inline-flex items-center gap-1.5"
            >
              <IconLock size={15} />
              <span>Lock Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header Card */}
      <div className="rounded-2xl border border-border bg-background p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-foreground">
                Daily Report: {currentReport.site?.name || currentReport.site?.code}
              </h1>
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs ${
                  STATUS_BADGES[currentReport.status] || "bg-slate-100"
                }`}
              >
                {isLocked && <IconLock size={13} />}
                {isApproved && <IconCheck size={13} />}
                {currentReport.status}
              </span>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Project:{" "}
              <strong className="text-foreground font-semibold">
                {currentReport.project?.name} ({currentReport.project?.code})
              </strong>{" "}
              • Business Date:{" "}
              <strong className="text-foreground font-semibold font-mono">
                {new Date(currentReport.businessDate).toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </strong>
            </p>

            {/* Weather & Safety Pills */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-300 font-medium">
                {currentReport.weather === "CLEAR" ? (
                  <IconSun size={14} className="text-amber-500" />
                ) : (
                  <IconCloudRain size={14} className="text-blue-500" />
                )}
                Weather: {currentReport.weather}
              </span>

              {Number(currentReport.weatherStoppageHours || 0) > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 text-amber-700 dark:text-amber-400 font-medium">
                  Stoppage: {currentReport.weatherStoppageHours}h
                </span>
              )}

              {currentReport.safetyIncidentReported ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2.5 py-1 text-rose-700 dark:text-rose-400 font-bold">
                  <IconAlertTriangle size={14} />
                  Safety Incident Reported
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-emerald-700 dark:text-emerald-400 font-medium">
                  <IconShieldCheck size={14} />
                  Zero Safety Incidents
                </span>
              )}
            </div>
          </div>

          <div className="text-left md:text-right text-xs text-muted-foreground font-mono">
            <span>Report UUID:</span>
            <code className="block mt-0.5 rounded bg-muted px-2 py-1 text-[11px] text-foreground">
              {currentReport.id}
            </code>
          </div>
        </div>

        {/* Locked Banner if report is LOCKED */}
        {isLocked && (
          <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3.5 text-xs text-purple-800 dark:text-purple-300 flex items-start gap-2.5">
            <IconLock size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                This Daily Report is LOCKED and Permanently Immutable
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                Locked by {currentReport.lockedBy?.displayName || "Central Admin"} on{" "}
                {currentReport.lockedAt
                  ? new Date(currentReport.lockedAt).toLocaleString("en-IN")
                  : "—"}
                . No further changes or headcount adjustments can be made. This is the legal record for payroll and billing.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sequential Sign-off Flow Card */}
      <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Sign-off Steps
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
          {/* Prepared by */}
          <div className="rounded-lg border border-border p-3 bg-muted/20">
            <span className="text-[11px] text-muted-foreground font-medium uppercase">
              1. Prepared (Supervisor)
            </span>
            <p className="font-semibold text-foreground mt-1">
              {currentReport.submittedBy?.displayName || "—"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {currentReport.submittedAt
                ? new Date(currentReport.submittedAt).toLocaleString("en-IN")
                : "Not submitted yet"}
            </p>
          </div>

          {/* Approved by */}
          <div className="rounded-lg border border-border p-3 bg-muted/20">
            <span className="text-[11px] text-muted-foreground font-medium uppercase">
              2. Approved (Project Manager)
            </span>
            <p className="font-semibold text-foreground mt-1">
              {currentReport.approvedBy?.displayName || "—"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {currentReport.approvedAt
                ? new Date(currentReport.approvedAt).toLocaleString("en-IN")
                : "Pending PM Approval"}
            </p>
          </div>

          {/* Locked by */}
          <div className={`rounded-lg border p-3 ${isLocked ? "border-purple-500/30 bg-purple-500/5" : "border-border bg-muted/20"}`}>
            <span className="text-[11px] text-muted-foreground font-medium uppercase">
              3. Locked (HO Admin / Finance)
            </span>
            <p className="font-semibold text-foreground mt-1">
              {currentReport.lockedBy?.displayName || (isLocked ? "Central Admin" : "Pending Final Lock")}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {currentReport.lockedAt
                ? new Date(currentReport.lockedAt).toLocaleString("en-IN")
                : "Not locked"}
            </p>
          </div>
        </div>
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-background p-4 text-center">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Total Headcount
          </span>
          <p className="text-xl font-bold text-foreground mt-0.5">
            {currentReport.totalWorkersHeadcount ?? 0}
          </p>
          <span className="text-[11px] text-muted-foreground">Workers on site</span>
        </div>

        <div className="rounded-xl border border-border bg-background p-4 text-center">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Days Worked
          </span>
          <p className="text-xl font-bold text-primary-600 dark:text-primary-400 mt-0.5">
            {currentReport.totalPresentUnits ?? "0.0"}
          </p>
          <span className="text-[11px] text-muted-foreground">Attendance units</span>
        </div>

        <div className="rounded-xl border border-border bg-background p-4 text-center">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Total Overtime
          </span>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
            {currentReport.totalOvertimeHours ?? "0.0"}h
          </p>
          <span className="text-[11px] text-muted-foreground">Overtime hours</span>
        </div>

        <div className="rounded-xl border border-border bg-background p-4 text-center">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Status
          </span>
          <p className={`text-xl font-bold mt-0.5 ${isLocked ? "text-purple-600" : isApproved ? "text-emerald-600" : "text-slate-600"}`}>
            {currentReport.status}
          </p>
          <span className="text-[11px] text-muted-foreground">Report state</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border flex items-center gap-4 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("workforce")}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === "workforce"
              ? "border-primary-500 text-primary-600 dark:text-primary-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <IconUsers size={17} />
          <span>Workforce Breakdown ({labourSummaries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sessions")}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === "sessions"
              ? "border-primary-500 text-primary-600 dark:text-primary-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <IconClock size={17} />
          <span>Worker Attendance Logs ({dailySessions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notes")}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === "notes"
              ? "border-primary-500 text-primary-600 dark:text-primary-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <IconFileText size={17} />
          <span>Site Notes & Safety</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === "audit"
              ? "border-primary-500 text-primary-600 dark:text-primary-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <IconHistory size={17} />
          <span>Audit History ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Workforce Breakdown */}
      {activeTab === "workforce" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-background overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Workforce & Headcount (Staff, Workers, Contractors)
              </h3>
              {!isLocked && (
                <span className="text-[11px] text-muted-foreground">
                  Pre-lock HO Admin adjustments allowed
                </span>
              )}
            </div>

            {labourSummaries.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No labour muster breakdown entries recorded for this report.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Subcontractor / Trade</th>
                      <th className="py-3 px-4 text-center">Headcount</th>
                      <th className="py-3 px-4 text-center">Present Units</th>
                      <th className="py-3 px-4 text-center">OT Hours</th>
                      <th className="py-3 px-4">Remarks</th>
                      {!isLocked && <th className="py-3 px-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {labourSummaries.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold border ${
                              CATEGORY_BADGES[item.category] || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {CATEGORY_LABELS[item.category] || item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-foreground block">
                            {item.tradeCategory}
                          </span>
                          {item.subcontractorName && (
                            <span className="text-[11px] text-muted-foreground block mt-0.5">
                              {item.subcontractorName}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-foreground">
                          {item.headcount}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-primary-600 dark:text-primary-400">
                          {item.presentUnits}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {Number(item.overtimeHours || 0) > 0 ? (
                            <span className="text-amber-600 font-semibold">
                              {item.overtimeHours}h
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                          {item.remarks || "—"}
                        </td>
                        {!isLocked && (
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setEditLabourItem(item)}
                              className="btn btn-outline btn-xs"
                              title="HO Admin Pre-lock adjustment"
                            >
                              <IconPencil size={13} />
                              <span>Adjust</span>
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Worker Attendance Logs */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-background overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Individual Worker Attendance Sessions
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Raw punches recorded on site. Missing departures can be regularized before final lock.
                </p>
              </div>
              <button
                type="button"
                onClick={loadSessions}
                className="btn btn-outline btn-xs inline-flex items-center gap-1.5"
                disabled={isFetchingMusterRoll}
              >
                <IconRefresh
                  size={13}
                  className={isFetchingMusterRoll ? "animate-spin" : ""}
                />
                <span>Refresh Logs</span>
              </button>
            </div>

            {isFetchingMusterRoll && dailySessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent mr-2 align-middle" />
                Loading site attendance logs...
              </div>
            ) : dailySessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No worker attendance punches found for this site on {currentReport.businessDate}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Shift Timings</th>
                      <th className="py-3 px-4 text-center">Hazri Units</th>
                      <th className="py-3 px-4 text-center">Overtime</th>
                      <th className="py-3 px-4">Status</th>
                      {!isLocked && <th className="py-3 px-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dailySessions.map((s) => {
                      const inTime = s.punchInAt ? formatTimeStr(s.punchInAt) : null;
                      const outTime = s.punchOutAt ? formatTimeStr(s.punchOutAt) : null;
                      const isAutoClosed = s.status === "AUTO_CLOSED";
                      const isInProgress = s.status === "IN_PROGRESS";
                      const empName = s.employee?.displayName || "—";
                      const empCode = s.employee?.employeeCode || "—";
                      const deptName =
                        s.employee?.memberships?.find((m) => m.isPrimary)?.department?.name;

                      return (
                        <tr
                          key={s.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-semibold text-foreground block">
                              {empName}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                              <span className="font-mono">{empCode}</span>
                              {deptName && (
                                <>
                                  <span>•</span>
                                  <span>{deptName}</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {inTime ? (
                              <span className="font-medium text-foreground block tabular-nums">
                                {inTime} {outTime ? `– ${outTime}` : "– Working"}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic">No punch recorded</span>
                            )}
                            {s.netDurationMins ? (
                              <span className="text-[11px] text-muted-foreground block mt-0.5">
                                Net: {Math.floor(s.netDurationMins / 60)}h{" "}
                                {s.netDurationMins % 60}m
                              </span>
                            ) : null}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-primary-600 dark:text-primary-400">
                            {s.presentUnits ?? "1.0"}
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            {Number(s.overtimeHours || 0) > 0 ? (
                              <span className="text-amber-600 font-semibold">
                                +{s.overtimeHours}h
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {isAutoClosed ? (
                              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                <IconAlertTriangle size={12} />
                                Missing Punch-Out
                              </span>
                            ) : isInProgress ? (
                              <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Clocked In
                              </span>
                            ) : s.isRegularized ? (
                              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300">
                                <IconCheck size={12} />
                                Regularized
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                Completed
                              </span>
                            )}
                          </td>
                          {!isLocked && (
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedSessionForRegularize(s)}
                                className="btn btn-outline btn-xs inline-flex items-center gap-1"
                                title="Regularize punch or adjust units"
                              >
                                <IconPencil size={12} />
                                <span>Regularize</span>
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Site Notes & Safety */}
      {activeTab === "notes" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Work Progress Notes */}
          <div className="rounded-xl border border-border bg-background p-5 shadow-sm space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Work Progress Notes
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {currentReport.workProgressNotes || "No progress notes recorded for this report."}
            </p>
          </div>

          {/* Site Obstacles Remarks */}
          <div className="rounded-xl border border-border bg-background p-5 shadow-sm space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Site Obstacles & Impediments
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {currentReport.siteObstaclesRemarks || "No site obstacles reported."}
            </p>
          </div>

          {/* Safety & Toolbox Talk Notes */}
          <div className="rounded-xl border border-border bg-background p-5 shadow-sm space-y-2 md:col-span-2">
            <div className="flex items-center gap-2">
              <IconShieldCheck size={18} className="text-emerald-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Safety Notes & Toolbox Talk (TVT)
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {currentReport.safetyNotes || "No safety or TVT notes recorded."}
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Tamper-Evident Audit Timeline */}
      {activeTab === "audit" && (
        <div className="rounded-xl border border-border bg-background p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Tamper-Evident Chronological History
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Immutable log of all calculations, submissions, approvals, adjustments, and payroll locking.
              </p>
            </div>
            <button
              type="button"
              onClick={() => dispatch(getDailyReportAuditTrail(id))}
              className="btn btn-outline btn-xs"
              disabled={isLoadingAuditTrail}
            >
              <IconRefresh size={13} className={isLoadingAuditTrail ? "animate-spin" : ""} />
              <span>Refresh Trail</span>
            </button>
          </div>

          {auditLogs.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No audit logs recorded for this report.
            </p>
          ) : (
            <div className="space-y-4 pt-2">
              {auditLogs.map((log, index) => (
                <div key={log.id || index} className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 font-mono text-[10px] font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 rounded-lg border border-border p-3 bg-muted/20 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">
                        {log.action}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleString("en-IN")
                          : "—"}
                      </span>
                    </div>

                    <div className="text-[11px] text-muted-foreground">
                      Actor: <code className="font-mono text-foreground font-semibold">{log.actorId}</code>
                      {log.oldValue && log.newValue && (
                        <span>
                          {" "}• Transitioned from{" "}
                          <span className="font-mono text-foreground">{log.oldValue}</span> to{" "}
                          <span className="font-mono text-foreground font-bold">{log.newValue}</span>
                        </span>
                      )}
                    </div>

                    {log.reason && (
                      <p className="text-xs text-foreground bg-background rounded p-2 border border-border mt-1">
                        Reason: {log.reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lock Confirmation Modal */}
      {isLockModalOpen && (
        <LockReportModal
          isOpen={isLockModalOpen}
          onClose={() => setIsLockModalOpen(false)}
          report={currentReport}
          onSuccess={loadData}
        />
      )}

      {/* Recalculate Modal */}
      {isRecalcModalOpen && (
        <RecalculateReportModal
          isOpen={isRecalcModalOpen}
          onClose={() => setIsRecalcModalOpen(false)}
          defaultSiteId={currentReport.siteId}
          defaultDate={currentReport.businessDate}
          onSuccess={loadData}
        />
      )}

      {/* Edit Labour Summary Modal */}
      {editLabourItem && (
        <EditLabourSummaryModal
          isOpen={!!editLabourItem}
          onClose={() => setEditLabourItem(null)}
          reportId={currentReport.id}
          labourSummary={editLabourItem}
          onSuccess={loadData}
        />
      )}

      {/* Reject Report Modal */}
      {isRejectModalOpen && (
        <RejectReportModal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          report={currentReport}
          onSuccess={loadData}
        />
      )}

      {/* Edit Header / Site Diary Modal */}
      {isEditHeaderModalOpen && (
        <EditDailyReportHeaderModal
          isOpen={isEditHeaderModalOpen}
          onClose={() => setIsEditHeaderModalOpen(false)}
          report={currentReport}
          onSuccess={loadData}
        />
      )}

      {/* Regularize Worker Attendance Session Modal */}
      {selectedSessionForRegularize && (
        <RegularizeSessionModal
          isOpen={Boolean(selectedSessionForRegularize)}
          onClose={() => setSelectedSessionForRegularize(null)}
          session={selectedSessionForRegularize}
          businessDate={currentReport.businessDate}
          onSuccess={() => {
            loadData();
            loadSessions();
          }}
        />
      )}
    </div>

    {/* Printable DSR Document (rendered strictly on print) */}
    <PrintableDailyReport report={currentReport} />
  </>
  );
}
