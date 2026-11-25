import React, { useMemo, useState } from "react";
import {
  IconUsers,
  IconCsv,
  IconFileTypePdf,
  IconFileTypeXls,
} from "@tabler/icons-react";
import ModalBasic from "@components/ui/ModalBasic";
import DataTable from "@components/ui/DataTable";
import SearchBar from "@components/ui/SearchBar";
import StatusBadge from "@components/ui/StatusBadge";
import {
  formatTimeStr,
  exportDateAttendanceCsv,
  SESSION_STATUS_CONFIG,
} from "../../../utils/dailyReport.utils";

export default function DateAttendanceDetailModal({
  isOpen,
  onClose,
  dateRecord,
  lockedReportsMap,
  onExportMuster,
  isExportingReport,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const formattedDate = useMemo(() => {
    if (!dateRecord?.businessDate) return "";
    const d = new Date(dateRecord.businessDate + "T00:00:00");
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      weekday: "short",
    });
  }, [dateRecord?.businessDate]);

  // Session table columns
  const sessionColumns = useMemo(
    () => [
      {
        key: "employee",
        header: "Employee",
        render: (s) => {
          const emp = s.employee;
          const primaryDept = emp?.memberships?.find((m) => m.isPrimary)?.department;
          return (
            <div className="leading-tight">
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs block">
                {emp?.displayName || "—"}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                <span className="font-mono">{emp?.employeeCode || "—"}</span>
                {primaryDept && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[140px]">{primaryDept.name}</span>
                  </>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: "punches",
        header: "Timing & Punches",
        render: (s) => {
          const inTime = s.punchInAt ? formatTimeStr(s.punchInAt) : null;
          const outTime = s.punchOutAt ? formatTimeStr(s.punchOutAt) : null;

          return (
            <div className="text-xs leading-tight">
              {inTime ? (
                <span className="font-medium text-slate-700 dark:text-slate-200 block tabular-nums">
                  {inTime} {outTime ? `– ${outTime}` : "– Working"}
                </span>
              ) : (
                <span className="text-slate-400 text-xs">No punch recorded</span>
              )}
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5 truncate max-w-[160px]">
                {s.site?.name || s.headOffice?.name || "Main Office"}
              </span>
            </div>
          );
        },
      },
      {
        key: "hoursWorked",
        header: "Work Hours",
        render: (s) => {
          const isActive = s.status === "IN_PROGRESS" || (!s.punchOutAt && s.punchInAt);
          let durationMins = s.netDurationMins || s.grossDurationMins || 0;

          if (isActive && s.punchInAt) {
            const elapsedMs = Math.max(
              0,
              Date.now() - new Date(s.punchInAt).getTime() - (s.breakDurationMins || 0) * 60000
            );
            durationMins = Math.floor(elapsedMs / 60000);
          }

          const h = Math.floor(durationMins / 60);
          const m = durationMins % 60;
          const otHours = Number(s.overtimeHours || 0);

          return (
            <div className="leading-tight">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-xs tabular-nums block">
                {h}h {m}m{" "}
                {isActive ? (
                  <span className="text-[10px] text-emerald-600 font-normal ml-0.5">(live)</span>
                ) : null}
              </span>
              {otHours > 0 ? (
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 tabular-nums block mt-0.5">
                  +{otHours}h overtime
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">
                  {s.presentUnits ? `${s.presentUnits} day unit` : "Full Day"}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        render: (s) => {
          const locKey = s.siteId
            ? `${s.siteId}_${s.businessDate}`
            : s.headOfficeId
              ? `${s.headOfficeId}_${s.businessDate}`
              : null;
          const reportStatus = locKey && lockedReportsMap ? lockedReportsMap.get(locKey) : null;
          const isLocked = reportStatus === "LOCKED";
          const isApproved = reportStatus === "APPROVED";
          const isActive = s.status === "IN_PROGRESS" || (!s.punchOutAt && s.punchInAt);

          const key = isLocked
            ? "LOCKED"
            : isActive
              ? "IN_PROGRESS"
              : isApproved
                ? "APPROVED"
                : "COMPLETED";
          const cfg = SESSION_STATUS_CONFIG[key];

          return (
            <StatusBadge
              label={cfg.label}
              tone={cfg.tone}
              icon={cfg.icon}
              dot={cfg.dot}
              size="sm"
            />
          );
        },
      },
    ],
    [lockedReportsMap]
  );

  // Filter sessions by search term
  const filteredSessions = useMemo(() => {
    if (!dateRecord?.sessions) return [];
    if (!searchTerm.trim()) return dateRecord.sessions;
    const term = searchTerm.toLowerCase();
    return dateRecord.sessions.filter((s) => {
      const name = s.employee?.displayName?.toLowerCase() || "";
      const code = s.employee?.employeeCode?.toLowerCase() || "";
      const dept =
        s.employee?.memberships?.find((m) => m.isPrimary)?.department?.name?.toLowerCase() || "";
      return name.includes(term) || code.includes(term) || dept.includes(term);
    });
  }, [dateRecord, searchTerm]);

  return (
    <ModalBasic
      isOpen={isOpen}
      onClose={() => {
        setSearchTerm("");
        onClose();
      }}
      title={`Attendance Report — ${formattedDate}`}
      description="Detailed log of individual employee clock-in/out records and shift durations."
      size="4xl"
    >
      <div className="space-y-4 p-5">
        {/* Top Quick Metrics & Export */}
        {dateRecord && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-700/60 dark:bg-slate-800/40">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Total Attendance:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {dateRecord.totalAttendance} Present
                </span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Total Work Hours:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                  {Math.floor(dateRecord.totalDurationMins / 60)}h{" "}
                  {dateRecord.totalDurationMins % 60}m
                </span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Overtime:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  +{Math.floor(dateRecord.totalExtraMins / 60)}h{" "}
                  {dateRecord.totalExtraMins % 60}m
                </span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Shortage:</span>
                <span className="font-bold text-rose-500 dark:text-rose-400 tabular-nums">
                  -{Math.floor(dateRecord.totalShortageMins / 60)}h{" "}
                  {dateRecord.totalShortageMins % 60}m
                </span>
              </div>
            </div>

            {/* Modal Export Buttons */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              <button
                type="button"
                onClick={() => onExportMuster?.("pdf", dateRecord.businessDate)}
                disabled={isExportingReport}
                className="btn btn-outline btn-xs inline-flex items-center gap-1"
              >
                <IconFileTypePdf size={13} className="text-rose-500" />
              </button>
              <button
                type="button"
                onClick={() => onExportMuster?.("xlsx", dateRecord.businessDate)}
                disabled={isExportingReport}
                className="btn btn-outline btn-xs inline-flex items-center gap-1"
              >
                <IconFileTypeXls size={13} className="text-emerald-600" />
              </button>
              <button
                type="button"
                onClick={() => exportDateAttendanceCsv(dateRecord)}
                className="btn btn-outline btn-xs inline-flex items-center gap-1.5"
              >
                <IconCsv size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Search inside modal */}
        <SearchBar
          value={searchTerm}
          onSearch={setSearchTerm}
          placeholder="Search employee in this day..."
          width="w-full max-w-xs"
          className="form-sm text-xs"
        />

        {/* Session Details Table */}
        <div className="max-h-[55vh] overflow-y-auto">
          <DataTable
            columns={sessionColumns}
            data={filteredSessions}
            empty={{
              icon: IconUsers,
              title: "No Matching Employees",
              description:
                "No employee attendance records match your search query for this date.",
            }}
          />
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              onClose();
            }}
            className="btn btn-secondary btn-sm"
          >
            Close
          </button>
        </div>
      </div>
    </ModalBasic>
  );
}
