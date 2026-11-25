import React, { useMemo, useState } from "react";
import {
  IconUsers,
  IconRefresh,
  IconEye,
  IconDownload,
  IconCalendar,
  IconFileTypePdf,
  IconFileTypeXls,
} from "@tabler/icons-react";
import DataTable from "@components/ui/DataTable";
import DateRangePicker from "@components/fields/DateRangePicker";
import DateAttendanceDetailModal from "./DateAttendanceDetailModal";
import {
  aggregateSessionsByDate,
  exportDateAttendanceCsv,
} from "../../../utils/dailyReport.utils";

export default function OfficeAttendanceTab({
  musterRoll,
  isFetchingMusterRoll,
  fetchMusterRollData,
  dateFilter,
  setDateFilter,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  selectedDepartmentId,
  setSelectedDepartmentId,
  selectedHeadOfficeId,
  setSelectedHeadOfficeId,
  departmentsList,
  headOfficesList,
  lockedReportsMap,
  onExportMuster,
  isExportingReport,
}) {
  const [selectedDateRecord, setSelectedDateRecord] = useState(null);

  // Extract raw sessions and department summaries
  const musterData = musterRoll?.data || musterRoll || {};
  const departmentSummaries = Array.isArray(musterData.departmentSummaries)
    ? musterData.departmentSummaries
    : [];
  const rawSessions = Array.isArray(musterData.sessions)
    ? musterData.sessions
    : [];

  // Group into date-aggregated rows
  const dateAggregates = useMemo(() => {
    return aggregateSessionsByDate(rawSessions);
  }, [rawSessions]);

  // Table Columns
  const columns = useMemo(
    () => [
      {
        key: "businessDate",
        header: "Date",
        render: (row) => {
          const d = row.businessDate ? new Date(row.businessDate + "T00:00:00") : null;
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
        key: "totalAttendance",
        header: "Total Attendance",
        render: (row) => (
          <div className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
            <IconUsers size={14} />
            <span className="tabular-nums">{row.totalAttendance}</span>
            <span className="text-[11px] font-normal opacity-80">Present</span>
          </div>
        ),
      },
      {
        key: "totalHours",
        header: "Work Hours",
        render: (row) => {
          const h = Math.floor(row.totalDurationMins / 60);
          const m = row.totalDurationMins % 60;
          return (
            <div className="leading-tight">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-xs tabular-nums block">
                {h}h {m}m
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">
                Total logged
              </span>
            </div>
          );
        },
      },
      {
        key: "extraHours",
        header: "Extra Hours",
        render: (row) => {
          const h = Math.floor(row.totalExtraMins / 60);
          const m = row.totalExtraMins % 60;
          if (row.totalExtraMins > 0) {
            return (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                +{h}h {m > 0 ? `${m}m` : ""}
              </span>
            );
          }
          return (
            <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">0h</span>
          );
        },
      },
      {
        key: "shortageHours",
        header: "Shortage Hours",
        render: (row) => {
          const h = Math.floor(row.totalShortageMins / 60);
          const m = row.totalShortageMins % 60;
          if (row.totalShortageMins > 0) {
            return (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 dark:text-rose-400 tabular-nums">
                -{h}h {m > 0 ? `${m}m` : ""}
              </span>
            );
          }
          return (
            <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">0h</span>
          );
        },
      },
    ],
    []
  );

  // Row Actions: View detailed report & Exports
  const actions = useMemo(
    () => [
      {
        label: "View detailed report",
        icon: IconEye,
        onClick: (row) => setSelectedDateRecord(row),
      },
      {
        label: "Export PDF",
        icon: IconFileTypePdf,
        onClick: (row) => onExportMuster?.("pdf", row.businessDate),
      },
      {
        label: "Export Excel",
        icon: IconFileTypeXls,
        onClick: (row) => onExportMuster?.("xlsx", row.businessDate),
      },
      {
        label: "Export CSV",
        icon: IconDownload,
        onClick: (row) => exportDateAttendanceCsv(row),
      },
    ],
    [onExportMuster]
  );

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  return (
    <div className="space-y-4">
      {/* Streamlined Filter Toolbar: Strictly Today vs Custom Date */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] p-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Two-Option Date Filter: Today vs Custom Date */}
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800/60 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setDateFilter("today");
                  setFromDate("");
                  setToDate("");
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${dateFilter === "today"
                  ? "bg-white text-slate-800 shadow-xs dark:bg-[#1C2536] dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  setDateFilter("custom");
                  if (!fromDate) {
                    setFromDate(todayStr);
                    setToDate(todayStr);
                  }
                }}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${dateFilter === "custom"
                  ? "bg-white text-slate-800 shadow-xs dark:bg-[#1C2536] dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
              >
                Custom Date
              </button>
            </div>

            {/* Custom Date Picker (shown only when Custom Date is selected) */}
            {dateFilter === "custom" && (
              <DateRangePicker
                key={`muster_${fromDate || ""}_${toDate || ""}`}
                value={{
                  startDate: fromDate || todayStr,
                  endDate: toDate || fromDate || todayStr,
                }}
                onChange={(range) => {
                  setFromDate(range?.startDate || "");
                  setToDate(range?.endDate || "");
                }}
                placeholder="Select date or range"
                className="shrink-0 [&>button]:!py-1.5 [&>button]:!px-2.5 [&>button]:!text-xs [&>button]:!w-auto [&>button]:!min-w-[170px] [&>button]:dark:!bg-[#1C2536] [&>button]:dark:!border-slate-700/80"
              />
            )}

            {/* Department scope */}
            <select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              style={{ width: "auto" }}
              className="form-select form-sm w-auto min-w-[150px] max-w-[190px] shrink-0"
            >
              <option value="">All Departments</option>
              {departmentsList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Head Office scope (if multiple) */}
            {headOfficesList.length > 1 && (
              <select
                value={selectedHeadOfficeId}
                onChange={(e) => setSelectedHeadOfficeId(e.target.value)}
                style={{ width: "auto" }}
                className="form-select form-sm w-auto min-w-[140px] max-w-[180px] shrink-0"
              >
                <option value="">All Offices</option>
                {headOfficesList.map((ho) => (
                  <option key={ho.id} value={ho.id}>
                    {ho.name}
                  </option>
                ))}
              </select>
            )}

            {/* Reset button if active filters */}
            {(selectedDepartmentId || selectedHeadOfficeId || dateFilter === "custom" || fromDate || toDate) && (
              <button
                type="button"
                onClick={() => {
                  setDateFilter("today");
                  setSelectedDepartmentId("");
                  setSelectedHeadOfficeId("");
                  setFromDate("");
                  setToDate("");
                }}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline underline-offset-2 ml-1"
              >
                Reset
              </button>
            )}
          </div>

          {/* Export & Refresh Actions */}
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <button
              type="button"
              onClick={fetchMusterRollData}
              disabled={isFetchingMusterRoll}
              title="Refresh attendance"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60 transition-colors"
            >
              <IconRefresh
                size={16}
                className={isFetchingMusterRoll ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Department Rollup Strip for Today */}
      {departmentSummaries.length > 0 && dateFilter === "today" && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
            Present today:
          </span>
          {departmentSummaries.map((dept) => (
            <span
              key={dept.departmentId}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] px-2.5 py-1 text-xs shadow-2xs"
            >
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {dept.departmentName}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {dept.presentCount}/{dept.totalEmployees}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Office Attendance Table: Grouped by Date */}
      <DataTable
        columns={columns}
        data={dateAggregates}
        actions={actions}
        loading={isFetchingMusterRoll}
        empty={{
          icon: IconCalendar,
          title: "No Attendance Records",
          description: "No attendance logged for the selected date or date range.",
        }}
      />

      {/* Detailed Date Attendance Report Modal */}
      <DateAttendanceDetailModal
        isOpen={Boolean(selectedDateRecord)}
        onClose={() => setSelectedDateRecord(null)}
        dateRecord={selectedDateRecord}
        lockedReportsMap={lockedReportsMap}
        onExportMuster={onExportMuster}
        isExportingReport={isExportingReport}
      />
    </div>
  );
}
