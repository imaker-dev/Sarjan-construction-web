import { toast } from "sonner";

export const STATUS_BADGES = {
  DRAFT:
    "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
  SUBMITTED:
    "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40",
  APPROVED:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 font-semibold",
  REJECTED:
    "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40",
  LOCKED:
    "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 font-bold",
};

export const STATUS_LABELS = {
  DRAFT: "Draft",
  SUBMITTED: "In Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  LOCKED: "Locked",
};

export const formatTimeStr = (isoStr) => {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Aggregates raw attendance sessions by businessDate into summarized date records
 */
export const aggregateSessionsByDate = (rawSessions = []) => {
  const map = new Map();

  for (const s of rawSessions) {
    const d = s.businessDate;
    if (!d) continue;

    if (!map.has(d)) {
      map.set(d, {
        businessDate: d,
        sessions: [],
        employeeIds: new Set(),
        totalDurationMins: 0,
        totalExtraMins: 0,
        totalShortageMins: 0,
      });
    }

    const entry = map.get(d);
    entry.sessions.push(s);

    const empId = s.employee?.id || s.employeeId;
    if (empId) {
      entry.employeeIds.add(empId);
    }

    // Duration calculation
    const isActive = s.status === "IN_PROGRESS" || (!s.punchOutAt && s.punchInAt);
    let durationMins = s.netDurationMins || s.grossDurationMins || 0;

    if (isActive && s.punchInAt) {
      const elapsedMs = Math.max(
        0,
        Date.now() - new Date(s.punchInAt).getTime() - (s.breakDurationMins || 0) * 60000
      );
      durationMins = Math.floor(elapsedMs / 60000);
    }

    entry.totalDurationMins += durationMins;

    // Overtime / Extra hours:
    const otHours = Number(s.overtimeHours || 0);
    const extraMins = otHours > 0 ? Math.round(otHours * 60) : Math.max(0, durationMins - 480);
    entry.totalExtraMins += extraMins;

    // Shortage hours: Standard workday is 8h (480 mins).
    // If session is completed/punched-out and under 480 mins, count deficit
    if (!isActive && durationMins < 480) {
      entry.totalShortageMins += 480 - durationMins;
    }
  }

  return Array.from(map.values())
    .map((entry) => ({
      id: entry.businessDate,
      businessDate: entry.businessDate,
      totalAttendance: entry.employeeIds.size || entry.sessions.length,
      totalDurationMins: entry.totalDurationMins,
      totalExtraMins: entry.totalExtraMins,
      totalShortageMins: entry.totalShortageMins,
      sessions: entry.sessions,
    }))
    .sort((a, b) => new Date(b.businessDate) - new Date(a.businessDate));
};

/**
 * Exports a date record's sessions to CSV and triggers browser download
 */
export const exportDateAttendanceCsv = (row) => {
  if (!row?.sessions?.length) {
    toast.error("No sessions available to export for this date.");
    return;
  }
  const headers = [
    "Date",
    "Employee Code",
    "Employee Name",
    "Department",
    "Punch In",
    "Punch Out",
    "Work Hours",
    "Overtime Hours",
    "Status",
  ];
  const csvRows = [headers.join(",")];

  for (const s of row.sessions) {
    const d = s.businessDate || row.businessDate;
    const code = `"${s.employee?.employeeCode || ""}"`;
    const name = `"${(s.employee?.displayName || "").replace(/"/g, '""')}"`;
    const dept = `"${(
      s.employee?.memberships?.find((m) => m.isPrimary)?.department?.name || ""
    ).replace(/"/g, '""')}"`;
    const inTime = `"${formatTimeStr(s.punchInAt)}"`;
    const outTime = `"${formatTimeStr(s.punchOutAt)}"`;
    const durMins = s.netDurationMins || s.grossDurationMins || 0;
    const workHours = `"${Math.floor(durMins / 60)}h ${durMins % 60}m"`;
    const ot = `"${s.overtimeHours || 0}h"`;
    const status = `"${s.status || ""}"`;

    csvRows.push([d, code, name, dept, inTime, outTime, workHours, ot, status].join(","));
  }

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Attendance_Report_${row.businessDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success(`Exported attendance report for ${row.businessDate}`);
};
