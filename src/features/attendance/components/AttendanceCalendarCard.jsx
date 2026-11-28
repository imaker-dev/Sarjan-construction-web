import React, { useEffect, useMemo, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import attendanceApi from "@store/api/attendance.api";
import leaveApi from "@store/api/leave.api";
import { extractList } from "@utils/api.utils";
import SessionDetailModal from "./SessionDetailModal";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_LABEL_FMT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const toIsoDate = (year, monthIndex, day) =>
  `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const LEGENDS = [
  { key: "deduction", type: "triangle-br", label: "Late / Early leave" },
  { key: "overtime", type: "dot-yellow", label: "Overtime" },
  { key: "absent", type: "code", code: "A", color: "text-rose-500", label: "Absent" },
  { key: "rest", type: "code", code: "O", color: "text-slate-400", label: "Rest Day" },
  { key: "present", type: "code", code: "P", color: "text-slate-700 dark:text-slate-200", label: "Present" },
  { key: "leave", type: "code", code: "L", color: "text-indigo-500", label: "Leave" },
  { key: "holiday", type: "code", code: "H", color: "text-sky-500", label: "Holiday" },
];

const isSessionLate = (s) => {
  if (Number(s?.lateMins ?? 0) > 0 || s?.isLate) return true;
  if (s?.punchInAt && s?.scheduledStartAt) {
    const graceMs = Number(s?.graceInMins ?? 0) * 60_000;
    return new Date(s.punchInAt).getTime() > new Date(s.scheduledStartAt).getTime() + graceMs;
  }
  return false;
};

const isSessionEarlyLeave = (s) => {
  if (Number(s?.earlyLeaveMins ?? 0) > 0 || s?.isEarlyLeave) return true;
  if (s?.punchOutAt && s?.scheduledEndAt) {
    const graceMs = Number(s?.graceOutMins ?? 0) * 60_000;
    return new Date(s.punchOutAt).getTime() < new Date(s.scheduledEndAt).getTime() - graceMs;
  }
  return false;
};

export default function AttendanceCalendarCard({ employeeId, shiftCode = "GEN" }) {
  const [cursorDate, setCursorDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [loading, setLoading] = useState(false);
  const [musterData, setMusterData] = useState(null);
  const [approvedLeaves, setApprovedLeaves] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const monthRange = useMemo(() => {
    const y = cursorDate.getFullYear();
    const m = cursorDate.getMonth();
    const lastDay = new Date(y, m + 1, 0).getDate();
    return {
      year: y,
      month: m,
      midDate: toIsoDate(y, m, 15),
      from: toIsoDate(y, m, 1),
      to: toIsoDate(y, m, lastDay),
      daysInMonth: lastDay,
    };
  }, [cursorDate]);

  useEffect(() => {
    if (!employeeId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [musterRes, leaveRes] = await Promise.all([
          attendanceApi.getMusterRollApi({
            employeeId,
            period: "MONTHLY",
            date: monthRange.midDate,
          }),
          leaveApi
            .listLeaveRequestsApi({
              employeeId,
              status: "APPROVED",
              from: monthRange.from,
              to: monthRange.to,
              limit: 100,
            })
            .catch(() => ({ data: [] })),
        ]);

        if (cancelled) return;
        setMusterData(musterRes?.data?.data || musterRes?.data || null);
        setApprovedLeaves(extractList(leaveRes?.data));
      } catch {
        if (!cancelled) {
          setMusterData(null);
          setApprovedLeaves([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [employeeId, monthRange]);

  const dayMap = useMemo(() => {
    const map = new Map();
    const sessions = Array.isArray(musterData?.sessions) ? musterData.sessions : [];
    const musterLeaves = Array.isArray(musterData?.leaves) ? musterData.leaves : [];
    const allLeaves = musterLeaves.length > 0 ? musterLeaves : approvedLeaves;
    const holidays = Array.isArray(musterData?.holidays) ? musterData.holidays : [];
    const explicitDays = Array.isArray(musterData?.days) ? musterData.days : [];

    // 1. Explicit day rows if backend provides them
    for (const d of explicitDays) {
      if (d?.businessDate) {
        map.set(String(d.businessDate).slice(0, 10), { ...d });
      }
    }

    // 2. Holidays
    const holidayDates = new Map();
    for (const h of holidays) {
      const dateStr = String(h?.date || h?.holidayDate || h).slice(0, 10);
      if (dateStr) {
        holidayDates.set(dateStr, {
          name: h?.name || "Holiday",
          calendarName: h?.calendar?.name || null,
          categoryName: h?.category?.name || null,
        });
      }
    }

    // 3. Approved leaves overlap
    const leaveByDate = new Map();
    for (const lv of allLeaves) {
      const startStr = String(lv?.startDate || lv?.fromDate || "").slice(0, 10);
      const endStr = String(lv?.endDate || lv?.toDate || startStr).slice(0, 10);
      if (!startStr) continue;
      const cur = new Date(`${startStr}T00:00:00`);
      const end = new Date(`${endStr}T00:00:00`);
      while (cur <= end) {
        const key = toIsoDate(cur.getFullYear(), cur.getMonth(), cur.getDate());
        leaveByDate.set(key, {
          leaveCode: lv?.leaveType?.code || lv?.typeDef?.code || lv?.leaveCode || "L",
          leaveName: lv?.leaveType?.name || lv?.typeDef?.name || "Leave",
        });
        cur.setDate(cur.getDate() + 1);
      }
    }

    // 4. Sessions from muster-roll
    const sessionByDate = new Map();
    for (const s of sessions) {
      const key = String(s?.businessDate || "").slice(0, 10);
      if (key) sessionByDate.set(key, s);
    }

    const weeklyOffWeekdays = new Set(
      Array.isArray(musterData?.weeklyOffDays)
        ? musterData.weeklyOffDays
        : [0] // default Sunday off if schedule doesn't specify
    );

    const todayStr = new Date().toISOString().slice(0, 10);

    for (let d = 1; d <= monthRange.daysInMonth; d++) {
      const isoDate = toIsoDate(monthRange.year, monthRange.month, d);
      const existing = map.get(isoDate) || {};
      const session = sessionByDate.get(isoDate);
      const leave = leaveByDate.get(isoDate);
      const holiday = holidayDates.get(isoDate);
      const holidayName = holiday?.name || null;
      const weekday = new Date(`${isoDate}T00:00:00`).getDay();
      const isRestDay = weeklyOffWeekdays.has(weekday);

      let status = existing.status;
      if (!status) {
        if (session && Number(session.presentUnits ?? 0) > 0) {
          status = "PRESENT";
        } else if (leave) {
          status = "LEAVE";
        } else if (holidayName) {
          status = "HOLIDAY";
        } else if (isRestDay) {
          status = "REST_DAY";
        } else if (isoDate <= todayStr) {
          status = session ? "PRESENT" : "ABSENT";
        } else {
          status = "UPCOMING";
        }
      }

      map.set(isoDate, {
        ...existing,
        ...session,
        businessDate: isoDate,
        sessionId: session?.id || existing.sessionId || null,
        status,
        leaveCode: leave?.leaveCode || existing.leaveCode,
        leaveName: leave?.leaveName || existing.leaveName,
        holidayName,
        holidayCalendarName: holiday?.calendarName || null,
        holidayCategoryName: holiday?.categoryName || null,
        isLate: session ? isSessionLate(session) : Boolean(existing.isLate),
        isEarlyLeave: session ? isSessionEarlyLeave(session) : Boolean(existing.isEarlyLeave),
        hasOvertime:
          Number(session?.overtimePUnits ?? existing.overtimePUnits ?? 0) > 0 ||
          Number(session?.overtimeHours ?? 0) > 0,
      });
    }

    return map;
  }, [musterData, approvedLeaves, monthRange]);

  const cells = useMemo(() => {
    const { year, month, daysInMonth } = monthRange;
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const list = [];

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      list.push({
        key: `prev-${prevMonthDays - i}`,
        dayNum: prevMonthDays - i,
        inMonth: false,
        isoDate: null,
        row: null,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const isoDate = toIsoDate(year, month, d);
      list.push({
        key: isoDate,
        dayNum: d,
        inMonth: true,
        isoDate,
        row: dayMap.get(isoDate) || null,
      });
    }

    const remainder = list.length % 7;
    if (remainder !== 0) {
      const needed = 7 - remainder;
      for (let d = 1; d <= needed; d++) {
        list.push({
          key: `next-${d}`,
          dayNum: d,
          inMonth: false,
          isoDate: null,
          row: null,
        });
      }
    }

    return list;
  }, [monthRange, dayMap]);

  const handlePrevMonth = () => {
    setCursorDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCursorDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const renderStatusCenter = (row) => {
    if (!row) return null;
    const status = String(row.status || "").toUpperCase();

    if (status === "PRESENT") {
      return (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-100">
          P
        </span>
      );
    }
    if (status === "ABSENT") {
      return (
        <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">
          A
        </span>
      );
    }
    if (status === "REST_DAY" || status === "WEEKLY_OFF") {
      return (
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
          O
        </span>
      );
    }
    if (status === "HOLIDAY") {
      return (
        <span
          title={row.holidayName || "Holiday"}
          className="text-xs font-semibold text-sky-600 dark:text-sky-400"
        >
          H
        </span>
      );
    }
    if (status === "LEAVE") {
      const code = row.leaveCode || "L";
      return (
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-200/80 px-1.5 text-[11px] font-semibold text-slate-700 dark:bg-indigo-500/20 dark:text-indigo-300">
          {code}
        </span>
      );
    }
    return null;
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-slate-800 dark:text-white">
            Attendance Info
          </h2>
          {loading && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Loading...
            </span>
          )}
        </div>

        <div className="p-4 sm:p-5">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4 lg:pr-[216px]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <IconChevronLeft size={15} />
              <span>Prev</span>
            </button>

            <span className="text-sm font-semibold text-slate-800 dark:text-white">
              {MONTH_LABEL_FMT.format(cursorDate)}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <span>Next</span>
              <IconChevronRight size={15} />
            </button>
          </div>

          {/* Calendar Grid + Legends Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_200px] gap-4 items-start">
            {/* 7-Column Calendar Grid */}
            <div className="border border-slate-200 dark:border-slate-700/60 rounded-lg overflow-hidden">
              <div className="grid grid-cols-7 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700/60">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400 border-r last:border-r-0 border-slate-200 dark:border-slate-700/60"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {cells.map((cell) => {
                  const row = cell.row;
                  const status = String(row?.status || "").toUpperCase();
                  const isOffDay =
                    status === "REST_DAY" ||
                    status === "WEEKLY_OFF" ||
                    status === "HOLIDAY";
                  const isSelected =
                    selectedDay?.businessDate &&
                    selectedDay.businessDate === cell.isoDate;

                  const hasDeduction = Boolean(row?.isLate || row?.isEarlyLeave);
                  const hasOvertime = Boolean(row?.hasOvertime);
                  const cellShift =
                    row?.workSchedule?.code || row?.shiftCode || row?.scheduleCode || shiftCode;

                  return (
                    <button
                      key={cell.key}
                      type="button"
                      disabled={!cell.inMonth}
                      onClick={() => {
                        if (!cell.inMonth) return;
                        setSelectedDay({
                          businessDate: cell.isoDate,
                          sessionId: row?.sessionId || null,
                          row,
                        });
                      }}
                      className={`relative min-h-[78px] p-1.5 text-left border-r border-b border-slate-200 dark:border-slate-700/60 [&:nth-child(7n)]:border-r-0 transition-colors focus:outline-none ${
                        !cell.inMonth
                          ? "bg-slate-50/40 dark:bg-slate-900/20 cursor-default"
                          : isSelected
                            ? "bg-primary-50/50 dark:bg-primary-500/15 ring-1 ring-inset ring-primary-500"
                            : isOffDay
                              ? "bg-slate-50/70 dark:bg-slate-800/30 hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
                              : "bg-white dark:bg-[#1C2536] hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className={`text-xs font-medium tabular-nums ${
                            !cell.inMonth
                              ? "text-slate-300 dark:text-slate-600"
                              : isOffDay
                                ? "text-slate-400 dark:text-slate-500"
                                : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {String(cell.dayNum).padStart(2, "0")}
                        </span>

                        {hasOvertime && (
                          <span
                            title="Overtime"
                            className="h-2 w-2 rounded-full bg-yellow-400 mt-0.5"
                          />
                        )}
                      </div>

                      {cell.inMonth && (
                        <div className="mt-2 flex items-center justify-center min-h-[24px]">
                          {renderStatusCenter(row)}
                        </div>
                      )}

                      {cell.inMonth && row && !isOffDay && status !== "UPCOMING" && (
                        <span className="absolute bottom-1 right-1.5 text-[10px] font-medium uppercase text-slate-400 dark:text-slate-500">
                          {cellShift}
                        </span>
                      )}

                      {hasDeduction && (
                        <span
                          title="Late / Early leave"
                          className="absolute top-0 right-0 w-0 h-0 border-t-[10px] border-l-[10px] border-t-rose-400 border-l-transparent"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legends Sidebar */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700/60 overflow-hidden bg-white dark:bg-[#1C2536]">
              <div className="bg-slate-200/70 dark:bg-slate-800/70 px-3 py-2 text-center text-xs font-semibold text-slate-700 dark:text-slate-200">
                Legends
              </div>
              <div className="p-3 space-y-2.5">
                {LEGENDS.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300"
                  >
                    <span className="w-4 flex items-center justify-center shrink-0">
                      {item.type === "triangle-br" && (
                        <span className="w-0 h-0 border-b-[10px] border-l-[10px] border-b-rose-400 border-l-transparent" />
                      )}
                      {item.type === "dot-yellow" && (
                        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                      )}
                      {item.type === "code" && (
                        <span className={`font-bold text-[11px] ${item.color}`}>
                          {item.code}
                        </span>
                      )}
                    </span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tap-a-cell Session Detail Modal */}
      <SessionDetailModal
        isOpen={Boolean(selectedDay)}
        onClose={() => setSelectedDay(null)}
        sessionId={selectedDay?.sessionId}
        employeeId={employeeId}
        businessDate={selectedDay?.businessDate}
        daySummary={selectedDay?.row}
      />
    </>
  );
}
