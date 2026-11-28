import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IconClock,
  IconMapPin,
  IconCoffee,
  IconCalendarEvent,
  IconHistory,
  IconAlertTriangle,
} from "@tabler/icons-react";
import ModalBasic from "@components/ui/ModalBasic";
import StatCard from "@components/ui/StatCard";
import StatusBadge from "@components/ui/StatusBadge";
import {
  clearAttendanceSession,
  getAttendanceSession,
  getAttendanceSessions,
} from "@store/slices/attendance.slice";
import {
  breakLabel,
  deriveAttendanceBadges,
  durFmt,
  timeFmt,
} from "@utils/attendance.utils";
import { extractList } from "@utils/api.utils";

const formatDurationMins = (mins) => {
  const m = Number(mins ?? 0);
  if (!Number.isFinite(m) || m <= 0) return "0m";
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return h > 0 ? `${h}h ${rem}m` : `${rem}m`;
};

const formatCoord = (lat, lng) => {
  if (lat == null || lng == null) return null;
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
};

export default function SessionDetailModal({
  isOpen,
  onClose,
  sessionId,
  employeeId,
  businessDate,
  daySummary = null,
}) {
  const dispatch = useDispatch();
  const {
    attendanceSession,
    attendanceSessions,
    isFetchingSession,
    isFetchingSessions,
  } = useSelector((state) => state.attendance);

  useEffect(() => {
    if (!isOpen) return;
    dispatch(clearAttendanceSession());

    if (sessionId) {
      dispatch(getAttendanceSession(sessionId));
    } else if (employeeId && businessDate) {
      dispatch(getAttendanceSessions({ employeeId, businessDate }));
    }
  }, [dispatch, isOpen, sessionId, employeeId, businessDate]);

  const session = useMemo(() => {
    if (sessionId) {
      return attendanceSession?.data || attendanceSession || null;
    }
    const list = extractList(attendanceSessions);
    return list[0] || null;
  }, [sessionId, attendanceSession, attendanceSessions]);

  const loading = sessionId ? isFetchingSession : isFetchingSessions;
  const effectiveRecord = session || daySummary || {};
  const badges = useMemo(
    () => deriveAttendanceBadges(effectiveRecord),
    [effectiveRecord]
  );

  const formattedDate = useMemo(() => {
    const raw = session?.businessDate || businessDate;
    if (!raw) return "Attendance Session";
    const d = new Date(`${String(raw).slice(0, 10)}T00:00:00`);
    return Number.isNaN(d.getTime())
      ? raw
      : d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
  }, [session?.businessDate, businessDate]);

  const breaks = Array.isArray(session?.breaks) ? session.breaks : [];
  const pinnedSchedule =
    session?.workSchedule ||
    session?.pinnedSchedule ||
    session?.schedule ||
    null;

  const punchInGeo = formatCoord(
    session?.punchInLat ?? session?.geoIn?.lat,
    session?.punchInLng ?? session?.geoIn?.lng
  );
  const punchOutGeo = formatCoord(
    session?.punchOutLat ?? session?.geoOut?.lat,
    session?.punchOutLng ?? session?.geoOut?.lng
  );

  const regularizations = Array.isArray(session?.regularizations)
    ? session.regularizations
    : Array.isArray(session?.auditTrail)
      ? session.auditTrail
      : [];

  return (
    <ModalBasic
      id="attendance-session-detail"
      isOpen={isOpen}
      onClose={onClose}
      title={formattedDate}
      size="lg"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-400">
            Loading session details...
          </div>
        ) : (
          <>
            {/* Status Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {badges.map((b) => (
                  <StatusBadge
                    key={b.key}
                    label={b.label}
                    tone={b.tone}
                    size="sm"
                  />
                ))}
              </div>
            )}

            {!session ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-800/30 p-5 text-center space-y-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {daySummary?.status === "HOLIDAY"
                    ? daySummary.holidayName || "Holiday"
                    : "No punch session recorded for this date"}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {daySummary?.status === "HOLIDAY"
                    ? [daySummary.holidayCalendarName, daySummary.holidayCategoryName]
                      .filter(Boolean)
                      .join(" • ") || "Company Holiday"
                    : daySummary?.status
                      ? `Day status: ${daySummary.status.replace("_", " ")}`
                      : "No clock-in or clock-out activity found."}
                </p>
              </div>
            ) : (
              <>
                {/* Punches & Units Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard
                    color="emerald"
                    icon={IconClock}
                    label="Punch In"
                    value={
                      session.punchInAt
                        ? timeFmt(new Date(session.punchInAt))
                        : "—"
                    }
                  />
                  <StatCard
                    color="sky"
                    icon={IconClock}
                    label="Punch Out"
                    value={
                      session.punchOutAt
                        ? timeFmt(new Date(session.punchOutAt))
                        : "—"
                    }
                  />
                  <StatCard
                    color="indigo"
                    icon={IconHistory}
                    label="Net Duration"
                    value={formatDurationMins(session.netDurationMins)}
                  />
                  <StatCard
                    color="amber"
                    icon={IconCalendarEvent}
                    label="Hazri / OT"
                    value={
                      Number(session.overtimePUnits ?? 0) > 0
                        ? `${Number(session.presentUnits ?? 0).toFixed(1)} P (+${Number(session.overtimePUnits).toFixed(1)})`
                        : `${Number(session.presentUnits ?? 0).toFixed(1)} P`
                    }
                  />
                </div>

                {/* Pinned Schedule & Flags */}
                {(pinnedSchedule ||
                  session.scheduledStartAt ||
                  session.scheduledEndAt ||
                  session.flags?.length > 0) && (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/20 p-3.5 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                        <IconCalendarEvent size={15} className="text-indigo-500" />
                        <span>
                          Pinned Schedule
                          {pinnedSchedule?.name ? ` — ${pinnedSchedule.name}` : ""}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        <span>
                          Shift:{" "}
                          {session.scheduledStartAt
                            ? timeFmt(new Date(session.scheduledStartAt))
                            : pinnedSchedule?.startTime || "—"}{" "}
                          –{" "}
                          {session.scheduledEndAt
                            ? timeFmt(new Date(session.scheduledEndAt))
                            : pinnedSchedule?.endTime || "—"}
                        </span>
                        {(session.graceInMins != null ||
                          pinnedSchedule?.graceInMins != null) && (
                            <span>
                              Grace In:{" "}
                              {session.graceInMins ?? pinnedSchedule?.graceInMins}m
                            </span>
                          )}
                        {(session.graceOutMins != null ||
                          pinnedSchedule?.graceOutMins != null) && (
                            <span>
                              Grace Out:{" "}
                              {session.graceOutMins ?? pinnedSchedule?.graceOutMins}m
                            </span>
                          )}
                      </div>
                      {Array.isArray(session.flags) && session.flags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <IconAlertTriangle size={14} className="text-amber-500" />
                          {session.flags.map((f, idx) => (
                            <StatusBadge
                              key={idx}
                              label={String(f)}
                              tone="amber"
                              size="xs"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                {/* Geolocation */}
                {(punchInGeo || punchOutGeo) && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      <IconMapPin size={15} className="text-emerald-500" />
                      <span>Location</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {punchInGeo && <div>In: {punchInGeo}</div>}
                      {punchOutGeo && <div>Out: {punchOutGeo}</div>}
                    </div>
                  </div>
                )}

                {/* Breaks */}
                {breaks.length > 0 && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      <IconCoffee size={15} className="text-amber-500" />
                      <span>Breaks ({breaks.length})</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                      {breaks.map((b, idx) => {
                        const start = b.startedAt ? new Date(b.startedAt) : null;
                        const end = b.endedAt ? new Date(b.endedAt) : null;
                        const dur =
                          start && end ? durFmt(end.getTime() - start.getTime()) : "Open";
                        return (
                          <div
                            key={b.id || idx}
                            className="py-1.5 flex items-center justify-between text-xs"
                          >
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                              {breakLabel(b.type || b.breakType)}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                              {start ? timeFmt(start) : "—"} –{" "}
                              {end ? timeFmt(end) : "Active"} ({dur})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Regularization Audit Trail (audit trail only, never an on-row badge) */}
                {(session.regularized || regularizations.length > 0) && (
                  <div className="rounded-xl border border-amber-200/80 dark:border-amber-500/30 bg-amber-50/40 dark:bg-amber-500/10 p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                      <IconHistory size={15} />
                      <span>Regularization Audit Trail</span>
                    </div>
                    {regularizations.length > 0 ? (
                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {regularizations.map((reg, idx) => (
                          <div
                            key={reg.id || idx}
                            className="flex flex-wrap items-center justify-between gap-2"
                          >
                            <span>
                              {reg.reason || reg.remarks || "Session regularized"}
                            </span>
                            <span className="text-[11px] text-slate-400 tabular-nums">
                              {reg.createdAt
                                ? new Date(reg.createdAt).toLocaleString("en-IN")
                                : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {session.regularizationReason ||
                          "This session was updated via attendance regularization."}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            Close
          </button>
        </div>
      </div>
    </ModalBasic>
  );
}
