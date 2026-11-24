import React, { useMemo } from "react";
import {
  IconLock,
  IconCheck,
  IconEye,
  IconRefresh,
  IconFileSpreadsheet,
} from "@tabler/icons-react";
import DataTable from "@components/ui/DataTable";
import DateRangePicker from "@components/fields/DateRangePicker";
import { STATUS_BADGES, STATUS_LABELS } from "../../../utils/dailyReport.utils";

export default function SiteReportsTab({
  reports,
  isListingReports,
  fetchReports,
  selectedProjectId,
  setSelectedProjectId,
  selectedSiteId,
  setSelectedSiteId,
  statusFilter,
  setStatusFilter,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  projectsList,
  filteredSites,
  onViewDetails,
  onLockReport,
}) {
  // Client-side project filter fallback
  const displayedReports = useMemo(() => {
    if (!Array.isArray(reports)) return [];
    if (!selectedProjectId) return reports;
    return reports.filter((r) => r.projectId === selectedProjectId);
  }, [reports, selectedProjectId]);

  // Columns for Site Reports
  const columns = useMemo(
    () => [
      {
        key: "businessDate",
        header: "Date",
        render: (r) => {
          const d = r.businessDate ? new Date(r.businessDate) : null;
          return (
            <div className="leading-tight">
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs block">
                {d
                  ? d.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                  : "—"}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                {d ? d.toLocaleDateString("en-IN", { weekday: "short" }) : ""}
              </span>
            </div>
          );
        },
      },
      {
        key: "site",
        header: "Site",
        render: (r) => (
          <div className="leading-tight max-w-[220px]">
            <span className="font-semibold text-slate-800 dark:text-slate-100 truncate block text-xs">
              {r.site?.name || r.site?.code || "—"}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate block mt-0.5">
              {r.project?.name || r.project?.code || "—"}
            </span>
          </div>
        ),
      },
      {
        key: "workforceMix",
        header: "People on Site",
        render: (r) => (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
              <span>Staff:</span>
              <strong className="font-semibold">{r.catAStaffUnits ?? 0}</strong>
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <span>Workers:</span>
              <strong className="font-semibold">{r.catBDirectUnits ?? 0}</strong>
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              <span>Contractors:</span>
              <strong className="font-semibold">{r.catCSubconUnits ?? 0}</strong>
            </span>
          </div>
        ),
      },
      {
        key: "settlementUnits",
        header: "Days & Overtime",
        render: (r) => (
          <div className="leading-tight">
            <span className="font-bold text-slate-800 dark:text-slate-100 text-xs tabular-nums block">
              {r.totalPresentUnits ?? "0.0"} days
            </span>
            {Number(r.totalOvertimeHours || 0) > 0 ? (
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 tabular-nums block mt-0.5">
                +{r.totalOvertimeHours}h overtime
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">
                No overtime
              </span>
            )}
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        mobilePosition: "header",
        render: (r) => (
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] ${STATUS_BADGES[r.status] || "bg-slate-100 text-slate-700"
              }`}
          >
            {r.status === "LOCKED" && <IconLock size={12} />}
            {r.status === "APPROVED" && <IconCheck size={12} />}
            {STATUS_LABELS[r.status] || r.status}
          </span>
        ),
      },
    ],
    []
  );

  // Actions for Site Reports
  const actions = useMemo(
    () => [
      {
        label: "View details",
        icon: IconEye,
        onClick: (r) => onViewDetails(r),
      },
      {
        label: "Lock report",
        icon: IconLock,
        hidden: (r) => r.status !== "APPROVED",
        onClick: (r) => onLockReport(r),
      },
    ],
    [onViewDetails, onLockReport]
  );

  return (
    <div className="space-y-4">
      {/* Streamlined Filter Toolbar */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] p-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Project Filter */}
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedSiteId("");
              }}
              style={{ width: "auto" }}
              className="form-select form-sm w-auto min-w-[140px] max-w-[170px] shrink-0"
            >
              <option value="">All Projects</option>
              {projectsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Site Filter */}
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              style={{ width: "auto" }}
              className="form-select form-sm w-auto min-w-[150px] max-w-[190px] shrink-0"
            >
              <option value="">All Sites</option>
              {filteredSites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "auto" }}
              className="form-select form-sm w-auto min-w-[125px] max-w-[150px] shrink-0"
            >
              <option value="ALL">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="SUBMITTED">In Review</option>
              <option value="LOCKED">Locked</option>
              <option value="DRAFT">Draft</option>
            </select>

            {/* Date Range Picker */}
            <DateRangePicker
              key={`dsr_${fromDate || ""}_${toDate || ""}`}
              value={
                fromDate && toDate
                  ? { startDate: fromDate, endDate: toDate }
                  : null
              }
              onChange={(range) => {
                setFromDate(range?.startDate || "");
                setToDate(range?.endDate || "");
              }}
              placeholder="Date or range"
              className="shrink-0 [&>button]:!py-1.5 [&>button]:!px-2.5 [&>button]:!text-xs [&>button]:!w-auto [&>button]:!min-w-[160px] [&>button]:dark:!bg-[#1C2536] [&>button]:dark:!border-slate-700/80"
            />

            {/* Reset button if active filters */}
            {(selectedProjectId || selectedSiteId || statusFilter !== "ALL" || fromDate || toDate) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedProjectId("");
                  setSelectedSiteId("");
                  setStatusFilter("ALL");
                  setFromDate("");
                  setToDate("");
                }}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline underline-offset-2 ml-1"
              >
                Reset
              </button>
            )}
          </div>

          {/* Minimal Refresh button */}
          <button
            type="button"
            onClick={fetchReports}
            disabled={isListingReports}
            title="Refresh reports"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60 transition-colors shrink-0 ml-auto"
          >
            <IconRefresh
              size={16}
              className={isListingReports ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {/* Site Reports Table */}
      <DataTable
        columns={columns}
        data={displayedReports}
        actions={actions}
        loading={isListingReports}
        empty={{
          icon: IconFileSpreadsheet,
          title: "No Daily Reports Found",
          description: "No site reports match the selected filters or date range.",
        }}
      />
    </div>
  );
}
