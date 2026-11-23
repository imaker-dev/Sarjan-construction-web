import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Coffee,
  Hourglass,
  Inbox,
  Loader2,
  LogIn,
  LogOut,
  Play,
  RefreshCw,
  Timer,
} from "lucide-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import ModalAction from "@components/ui/ModalAction"; // <- adjust to where your modal lives
import { useDispatch, useSelector } from "react-redux";
import {
  endAttendanceBreak,
  getActiveSession,
  punchIn,
  punchOut,
  startAttendanceBreak,
} from "@store/slices/attendance.slice";
import { handleResponse } from "@utils/async.utils";
import StatCard from "@components/ui/StatCard";
import AttendanceHero from "../components/AttandanceHero";
import WeeklyWorkProgressBar from "../components/WeeklyWorkProgressBar";
import {
  BREAK_TYPES,
  DEFAULT_POLICY,
  EMPTY_ARR,
  EMPTY_DAY,
  HOUR,
  MIN,
  STATUS,
  TONES,
  ZERO_TOTALS,
  breakLabel,
  buildDay,
  buildLogs,
  clockFmt,
  dayLabel,
  durFmt,
  eventsFromSessions,
  getDayTotals,
  getSegments,
  round6,
  timeFmt,
  useNow,
} from "@utils/attendance.utils";

/* ========================================================================== */
/*  DATA FLOW                                                                 */
/*                                                                            */
/*  state.attendance.activeSession = GET /attendance/sessions/active          */
/*    {                                                                       */
/*      session,                 -> the CURRENT session only                  */
/*      activityLog[],           -> EVERY check-in / break / check-out today  */
/*      isDelayedClockIn, scheduledClockInAt, targetWorkDurationMins, ...     */
/*    }                                                                       */
/*                                                                            */
/*  Everything on this page (worked time, breaks, timeline, log, status) is   */
/*  derived from `activityLog`, so multiple check-ins in one day add up.      */
/*  If activityLog is missing, it falls back to the `session` object.         */
/* ========================================================================== */

/* -------------------------------------------------------------------------- */
/*  Geolocation                                                               */
/* -------------------------------------------------------------------------- */

function useGeolocation(active) {
  const [state, setState] = useState({ status: "idle" });

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({
        status: "error",
        message: "This device doesn't support location.",
      });
      return;
    }
    setState({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (p) =>
        setState({
          status: "ready",
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: Math.round(p.coords.accuracy),
        }),
      (e) =>
        setState({
          status: "error",
          message:
            e.code === 1
              ? "Location access is blocked. Allow it in your browser settings, then try again."
              : e.code === 3
                ? "Finding your location took too long. Move to an open area and try again."
                : "We couldn't get your location. Try again.",
        }),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 },
    );
  }, []);

  useEffect(() => {
    if (active) locate();
    else setState({ status: "idle" });
  }, [active, locate]);

  return { ...state, retry: locate };
}

const estimateUnits = (workedMs, rules) => {
  const h = workedMs / HOUR;
  if (h >= rules.fullDayThresholdHours) return { units: "1.0", label: "Full day" };
  if (h >= rules.halfDayThresholdHours) return { units: "0.5", label: "Half day" };
  return { units: "0.0", label: "Absent" };
};

/* ---- API errors ---------------------------------------------------------- */

const ERROR_COPY = {
  ACTIVE_SESSION_EXISTS: {
    message: "You're already clocked in. Your status has been refreshed.",
    resync: true,
  },
  NO_ACTIVE_SESSION: {
    message: "There's no active shift. Your status has been refreshed.",
    resync: true,
  },
  ACTIVE_BREAK_EXISTS: {
    message: "You're already on a break. Your status has been refreshed.",
    resync: true,
  },
  NO_ACTIVE_BREAK: {
    message: "There's no break to end. Your status has been refreshed.",
    resync: true,
  },
  GEOFENCE_BREACH: {
    message: "You're outside the allowed boundary. Move closer and try again.",
  },
  TVT_NOT_ATTENDED: {
    message:
      "You haven't attended today's safety briefing yet. Ask your safety supervisor to log your attendance, then clock in.",
  },
  PERMISSION_DENIED: {
    message:
      "You don't have permission to record attendance. Contact your administrator.",
  },
  TOKEN_MISSING: {
    message: "Your session expired. Sign in again to continue.",
  },
};

const errorCode = (e) =>
  e?.code ??
  e?.response?.data?.code ??
  e?.data?.code ??
  e?.payload?.code ??
  e?.error?.code;
const errorText = (e) =>
  e?.message ??
  e?.response?.data?.message ??
  e?.data?.message ??
  (typeof e === "string" ? e : null);

/* -------------------------------------------------------------------------- */
/*  Styling maps                                                              */
/* -------------------------------------------------------------------------- */

const CARD =
  "rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1C2536]";

const LOG_META = {
  clock_in: { title: "Clocked in", icon: LogIn, tone: "emerald" },
  break_start: { title: "Break started", icon: Coffee, tone: "amber" },
  break_end: { title: "Break ended", icon: Play, tone: "sky" },
  clock_out: { title: "Clocked out", icon: LogOut, tone: "rose" },
};

const FILTERS = [
  { key: "all", label: "All", types: null },
  { key: "shifts", label: "Shifts", types: ["clock_in", "clock_out"] },
  { key: "breaks", label: "Breaks", types: ["break_start", "break_end"] },
];

const WARN = "text-amber-600 dark:text-amber-400";

/* -------------------------------------------------------------------------- */
/*  Activity log                                                              */
/* -------------------------------------------------------------------------- */

function logDetails(log) {
  const e = log.event;
  const lines = [];

  if (log.type === "clock_in" || log.type === "clock_out") {
    const where = [];
    if (e.siteName) where.push(e.siteName);
    if (e.distanceM != null) where.push(`${e.distanceM} m from site`);
    if (e.withinGeofence === true) where.push("Within allowed range");
    if (where.length) lines.push({ text: where.join(" · ") });
    if (e.withinGeofence === false)
      lines.push({ text: "Outside allowed range", tone: WARN });
  }

  if (log.type === "clock_in" && log.late > 0)
    lines.push({ text: `Late by ${durFmt(log.late * MIN)}`, tone: WARN });

  if (log.type === "break_start")
    lines.push({ text: `${breakLabel(log.breakType)} break` });

  if (log.type === "break_end") {
    const mins = e.durationMins;
    lines.push({
      text:
        mins != null
          ? `${breakLabel(log.breakType)} break lasted ${durFmt(mins * MIN)}`
          : `${breakLabel(log.breakType)} break`,
    });
  }

  if (log.type === "clock_out" && log.summary) {
    const { workedMs, breakMs } = log.summary;
    lines.push({
      text:
        `Worked ${durFmt(workedMs)}` +
        (breakMs > 0 ? ` · ${durFmt(breakMs)} on breaks` : ""),
    });
  }

  if ((log.type === "clock_in" || log.type === "clock_out") && e.remarks)
    lines.push({ text: `Note: ${e.remarks}` });

  return lines;
}

/* -------------------------------------------------------------------------- */
/*  Small components                                                          */
/* -------------------------------------------------------------------------- */

function Notice({ tone = "rose", children }) {
  const styles =
    tone === "rose"
      ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
      : "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300";
  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-[12.5px] leading-relaxed ${styles}`}
    >
      <AlertCircle size={15} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

const SEGMENT_STYLE = {
  work: { bar: "bg-emerald-500", label: "Working" },
  break: { bar: "bg-amber-400", label: "Break" },
  off: { bar: "bg-slate-300 dark:bg-slate-600", label: "Off the clock" },
};

const Timeline = memo(function Timeline({ segments, day, totals }) {
  const total = segments.reduce((s, x) => s + (x.to - x.from), 0);
  return (
    <section className={`${CARD} p-5 sm:p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-slate-800 dark:text-white">
          Today&rsquo;s timeline
        </h3>
        <div className="flex items-center gap-4 text-[12px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Work
            <span className="font-medium tabular-nums text-slate-700 dark:text-slate-200">
              {durFmt(totals.worked)}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> Break
            <span className="font-medium tabular-nums text-slate-700 dark:text-slate-200">
              {durFmt(totals.breaks)}
            </span>
          </span>
          {totals.off > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />{" "}
              Off
              <span className="font-medium tabular-nums text-slate-700 dark:text-slate-200">
                {durFmt(totals.off)}
              </span>
            </span>
          )}
        </div>
      </div>
      {total > 0 ? (
        <>
          <div className="mt-4 flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/50">
            {segments.map((s, i) => (
              <div
                key={i}
                title={`${SEGMENT_STYLE[s.type].label} · ${durFmt(s.to - s.from)}`}
                style={{ flexGrow: s.to - s.from, flexBasis: 0, minWidth: 3 }}
                className={SEGMENT_STYLE[s.type].bar}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[12px] tabular-nums text-slate-400 dark:text-slate-500">
            <span>{timeFmt(new Date(day.firstClockInAt))}</span>
            <span>
              {day.lastClockOutAt ? timeFmt(new Date(day.lastClockOutAt)) : "Now"}
            </span>
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-slate-200 px-4 py-5 text-center text-[13px] text-slate-400 dark:border-slate-700 dark:text-slate-500">
          Your day appears here once you clock in.
        </div>
      )}
    </section>
  );
});

const LogItem = memo(function LogItem({ log, isLast }) {
  const { title, icon: Icon, tone } = LOG_META[log.type];
  const lines = logDetails(log);
  return (
    <li className="relative flex gap-3.5 pb-5 last:pb-0">
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute -bottom-1 left-4 top-9 w-px -translate-x-1/2 bg-slate-100 dark:bg-slate-700/70"
        />
      )}
      <span
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONES[tone]}`}
      >
        <Icon size={15} strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">
            {title}
          </p>
          <time
            dateTime={log.at}
            className="shrink-0 text-[12.5px] tabular-nums text-slate-400 dark:text-slate-500"
          >
            {timeFmt(new Date(log.at))}
          </time>
        </div>
        {lines.map((l, i) => (
          <p
            key={i}
            className={`mt-0.5 text-[12.5px] ${l.tone || "text-slate-400 dark:text-slate-500"}`}
          >
            {l.text}
          </p>
        ))}
      </div>
    </li>
  );
});

const ActivityLog = memo(function ActivityLog({ logs }) {
  const now = useNow(60_000);
  const [filter, setFilter] = useState("all");

  const groups = useMemo(() => {
    const types = FILTERS.find((f) => f.key === filter).types;
    const map = new Map();
    // newest first
    [...logs]
      .filter((l) => !types || types.includes(l.type))
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .forEach((l) => {
        const key = new Date(l.at).toDateString();
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(l);
      });
    return [...map.values()];
  }, [logs, filter]);

  return (
    <section className={`${CARD} flex flex-col`}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-700 sm:px-6">
        <div>
          <h3 className="text-[15px] font-semibold text-slate-800 dark:text-white">
            Activity log
          </h3>
          <p className="mt-0.5 text-[12.5px] text-slate-400 dark:text-slate-500">
            Every clock-in, break and clock-out
          </p>
        </div>
        <div
          className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800/60"
          role="group"
          aria-label="Filter activity"
        >
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-md px-3 py-1 text-[12.5px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600 ${
                filter === f.key
                  ? "bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full ${TONES.slate}`}
          >
            <Inbox size={22} />
          </span>
          <p className="text-[14px] font-medium text-slate-700 dark:text-slate-200">
            No activity yet
          </p>
          <p className="max-w-xs text-[12.5px] text-slate-400 dark:text-slate-500">
            Clock in to start your shift. Everything you do shows up here.
          </p>
        </div>
      ) : (
        <div className="max-h-[640px] overflow-y-auto px-5 pb-5 sm:px-6">
          {groups.map((items) => (
            <div key={items[0].id}>
              <div className="sticky top-0 z-20 -mx-5 flex items-center justify-between bg-white/90 px-5 py-3 backdrop-blur dark:bg-[#1C2536]/90 sm:-mx-6 sm:px-6">
                <p className="text-[12.5px] font-semibold text-slate-500 dark:text-slate-400">
                  {dayLabel(new Date(items[0].at), now)}
                </p>
                <span className="text-[12px] tabular-nums text-slate-400 dark:text-slate-500">
                  {items.length} {items.length === 1 ? "event" : "events"}
                </span>
              </div>
              <ol className="mb-3 mt-1">
                {items.map((log, i) => (
                  <LogItem
                    key={log.id}
                    log={log}
                    isLast={i === items.length - 1}
                  />
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </section>
  );
});

/** Stat cards + timeline. Everything is totalled across ALL of today's sessions. */
const Summary = memo(function Summary({ day, status, rules, totals: propTotals }) {
  const now = useNow(STATUS[status].live ? 10_000 : 60_000);
  const totals = propTotals ?? getDayTotals(day, now);
  const segments = getSegments(day, now);

  const diff = rules.fullDayThresholdHours * HOUR - totals.worked;
  const overtime = diff < 0;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <StatCard
          icon={LogIn}
          color="emerald"
          label="First clock-in"
          value={timeFmt(day.firstClockInAt ? new Date(day.firstClockInAt) : null)}
        />
        <StatCard
          icon={Timer}
          color="indigo"
          label="Worked"
          value={durFmt(totals.worked)}
        />
        <StatCard
          icon={Coffee}
          color="amber"
          label={`Break time (${day.breakCount} ${day.breakCount === 1 ? "break" : "breaks"})`}
          value={durFmt(totals.breaks)}
        />
        <StatCard
          icon={Hourglass}
          color={overtime ? "rose" : "sky"}
          label={overtime ? "Overtime" : "Remaining"}
          value={durFmt(Math.abs(diff))}
        />
      </div>

      <Timeline segments={segments} day={day} totals={totals} />
    </>
  );
});

/* ---- Modal contents ------------------------------------------------------ */

function Field({ label, children }) {
  return (
    <div>
      <p className="mb-1.5 text-[12.5px] font-medium text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function RemarksField({ value, onChange }) {
  return (
    <Field label="Note (optional)">
      <textarea
        rows={2}
        maxLength={200}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add a note for your supervisor"
        className="form-textarea resize-none"
      />
    </Field>
  );
}

function LocationRow({ geo }) {
  if (geo.status === "ready")
    return (
      <div className="flex items-center gap-2.5 rounded-lg bg-emerald-50 px-3 py-2.5 text-[13px] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
        <CheckCircle2 size={16} className="shrink-0" />
        Location found &middot; accurate to {geo.accuracy} m
      </div>
    );

  if (geo.status === "error")
    return (
      <div className="space-y-2">
        <Notice>{geo.message}</Notice>
        <button
          type="button"
          onClick={geo.retry}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary-600 hover:underline dark:text-primary-400"
        >
          <RefreshCw size={13} /> Try again
        </button>
      </div>
    );

  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5 text-[13px] text-muted-foreground">
      <Loader2 size={16} className="shrink-0 animate-spin" />
      Finding your location&hellip;
    </div>
  );
}

function SummaryTile({ label, value }) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2.5">
      <p className="text-[11.5px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[14.5px] font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function AttendancePage({
  title = "Attendance",
  history = EMPTY_ARR, // optional past sessions (full session objects) for the log
  isLoading: isLoadingProp = false,
  policy = DEFAULT_POLICY,
  requireLocation = true,
  onRefresh,
}) {
  const dispatch = useDispatch();

  const { activeSession } = useSelector((state) => state.attendance);
  const session = activeSession?.session ?? null;
  const activityLog = activeSession?.activityLog ?? session?.activityLog;
  const weeklyProgress = activeSession?.weeklyProgress ?? session?.weeklyProgress ?? null;

  const { meData } = useSelector((state) => state.auth);
  const { departments, displayName } = meData || {};
  const headOfficeId = departments?.[0]?.headOfficeId || null;

  const isSubmitting = useSelector((state) => {
    const a = state.attendance;
    return !!(
      a.isPunchingIn ||
      a.isPunchingOut ||
      a.isStartingBreak ||
      a.isEndingBreak
    );
  });

  // Show the skeleton until the first fetch settles (no "Clock in" flash).
  const [loaded, setLoaded] = useState(() => !!session);
  useEffect(() => {
    let alive = true;
    Promise.resolve(dispatch(getActiveSession())).finally(() => {
      if (alive) setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, [dispatch]);

  const [completed, setCompleted] = useState(null); // settled record after clock out
  const [dialog, setDialog] = useState({ open: false, type: null, at: 0 });
  const [form, setForm] = useState({ breakType: "LUNCH", remarks: "" });
  const [modalError, setModalError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (session) setCompleted(null);
  }, [session]);

  const record = session ?? completed; // current / just-finished session object

  /* ---- today's day model (all sessions) ----------------------------------- */

  const todayEvents = useMemo(
    () =>
      activityLog?.length
        ? activityLog
        : eventsFromSessions(record ? [record] : EMPTY_ARR),
    [activityLog, record],
  );

  const day = useMemo(
    () => (todayEvents.length ? buildDay(todayEvents) : EMPTY_DAY),
    [todayEvents],
  );

  const status =
    day.state === "working"
      ? "working"
      : day.state === "break"
        ? "break"
        : day.events.length
          ? "done"
          : "off";

  const now = useNow(STATUS[status]?.live ? 10_000 : 60_000);
  const totals = useMemo(() => getDayTotals(day, now), [day, now]);

  // Live Weekly Progress: Combines prior days from weeklyProgress + live session ticks today
  const liveWeeklyProgress = useMemo(() => {
    if (!weeklyProgress) return null;
    const targetWeeklyHours = weeklyProgress.targetWeeklyHours ?? 48.0;

    // Live worked hours today (down to the second, updating every 10s)
    const todayWorkedHours = (totals.worked || 0) / 3600000;

    // Prior days of the week
    const priorDaysHours =
      weeklyProgress.priorDaysCompletedWeeklyHours !== undefined
        ? weeklyProgress.priorDaysCompletedWeeklyHours
        : Math.max(
            0,
            (weeklyProgress.completedWeeklyHours || 0) -
              (weeklyProgress.todayCompletedHours || 0)
          );

    const liveCompleted = Number((priorDaysHours + todayWorkedHours).toFixed(2));
    const liveRemaining = Number(Math.max(0, targetWeeklyHours - liveCompleted).toFixed(2));
    const livePercentage = Number(Math.min(100, (liveCompleted / targetWeeklyHours) * 100).toFixed(1));
    const isTargetCompleted = liveCompleted >= targetWeeklyHours;

    const remainingWorkDaysInWeek = weeklyProgress.remainingWorkDaysInWeek || 1;
    const isLastWorkingDay = weeklyProgress.isLastWorkingDay || false;
    const requiredHoursToCompleteTarget = isTargetCompleted
      ? 0
      : isLastWorkingDay
      ? liveRemaining
      : Number((liveRemaining / remainingWorkDaysInWeek).toFixed(2));

    let progStatus = weeklyProgress.status;
    if (isTargetCompleted) {
      progStatus = "COMPLETED";
    } else if (isLastWorkingDay) {
      progStatus = "DEFICIT_PENDING";
    } else {
      const bDate = new Date();
      const dayOfWeek = bDate.getDay();
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek;
      const expectedHoursSoFar = Math.min(targetWeeklyHours, dayIndex * 8.0);
      progStatus = liveCompleted >= expectedHoursSoFar * 0.85 ? "ON_TRACK" : "BEHIND";
    }

    return {
      ...weeklyProgress,
      completedWeeklyHours: liveCompleted,
      remainingWeeklyHours: liveRemaining,
      progressPercentage: livePercentage,
      isTargetCompleted,
      remainingWorkDaysInWeek,
      isLastWorkingDay,
      requiredHoursToCompleteTarget,
      status: progStatus,
    };
  }, [weeklyProgress, totals.worked]);

  const fallbackWeeklyProgress = useMemo(() => {
    if (weeklyProgress) return null;
    if (!day.events.length && status !== "working") return null;

    const nowD = new Date();
    const dayOfWeek = nowD.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(nowD.getTime() + diffToMonday * 86400000);
    const saturday = new Date(monday.getTime() + 5 * 86400000);
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek;
    const remainingWorkDaysInWeek = Math.max(1, 6 - dayIndex + 1);

    const targetWeeklyHours = 48.0;
    const todayWorkedHours = (totals.worked || 0) / 3600000;
    const liveCompleted = Number(todayWorkedHours.toFixed(2));
    const liveRemaining = Number(Math.max(0, targetWeeklyHours - liveCompleted).toFixed(2));
    const livePercentage = Number(Math.min(100, (liveCompleted / targetWeeklyHours) * 100).toFixed(1));
    const isTargetCompleted = liveCompleted >= targetWeeklyHours;
    const isLastWorkingDay = dayIndex >= 6;
    const requiredHoursToCompleteTarget = isTargetCompleted
      ? 0
      : isLastWorkingDay
      ? liveRemaining
      : Number((liveRemaining / remainingWorkDaysInWeek).toFixed(2));

    return {
      weekStartDate: monday.toISOString().slice(0, 10),
      weekEndDate: saturday.toISOString().slice(0, 10),
      targetWeeklyHours,
      completedWeeklyHours: liveCompleted,
      remainingWeeklyHours: liveRemaining,
      progressPercentage: livePercentage,
      isTargetCompleted,
      remainingWorkDaysInWeek,
      isLastWorkingDay,
      requiredHoursToCompleteTarget,
      status: liveCompleted >= dayIndex * 8.0 * 0.85 ? "ON_TRACK" : "BEHIND",
    };
  }, [weeklyProgress, day.events.length, status, totals.worked]);

  const effectiveWeeklyProgress = liveWeeklyProgress || fallbackWeeklyProgress;

  // Full-day target comes from the API; the policy prop is only a fallback.
  const targetMins =
    activeSession?.targetWorkDurationMins ?? record?.targetWorkDurationMins;
  const rules = useMemo(
    () => ({
      halfDayThresholdHours: policy.halfDayThresholdHours,
      fullDayThresholdHours: targetMins
        ? targetMins / 60
        : policy.fullDayThresholdHours,
    }),
    [targetMins, policy.halfDayThresholdHours, policy.fullDayThresholdHours],
  );

  // "Late" is measured from the FIRST clock-in of the day, not the current session.
  const scheduledAt =
    activeSession?.scheduledClockInAt ?? record?.scheduledClockInAt;
  const isDelayed =
    activeSession?.isDelayedClockIn ?? record?.isDelayedClockIn;
  const late = useMemo(() => {
    if (!isDelayed || !scheduledAt || !day.firstClockInAt) return null;
    const minutes = Math.round((day.firstClockInAt - Date.parse(scheduledAt)) / MIN);
    return minutes > 0
      ? { minutes, scheduledAt, at: day.firstClockInAt }
      : null;
  }, [isDelayed, scheduledAt, day.firstClockInAt]);

  const logs = useMemo(
    () => buildLogs([...eventsFromSessions(history), ...todayEvents], late),
    [history, todayEvents, late],
  );

  /* ---- geolocation + dialog ---------------------------------------------- */

  const needsGeo =
    dialog.open && (dialog.type === "in" || dialog.type === "out");
  const geo = useGeolocation(needsGeo);

  // Numbers shown inside a modal are frozen at the moment it opened.
  const dialogTotals = useMemo(
    () => (dialog.open ? getDayTotals(day, new Date(dialog.at)) : ZERO_TOTALS),
    [dialog.open, dialog.at, day],
  );
  const openBreak = day.openBreak;

  const openDialog = useCallback((type) => {
    setModalError("");
    setNotice("");
    setForm({ breakType: "LUNCH", remarks: "" });
    setDialog({ open: true, type, at: Date.now() });
  }, []);

  const closeDialog = useCallback(
    () => setDialog((d) => ({ ...d, open: false })),
    [],
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await (onRefresh ? onRefresh() : dispatch(getActiveSession()));
    } catch {
      /* the next action will surface any real problem */
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, dispatch]);

  /* ---- submit ------------------------------------------------------------- */

  // Throws when a thunk is rejected so the catch below can show the error.
  const exec = async (thunk) => {
    const res = await dispatch(thunk);
    if (res?.error) throw res.payload ?? res.error;
    return res;
  };

  const submit = async () => {
    const ready = geo.status === "ready";
    const coords = ready
      ? { latitude: round6(geo.lat), longitude: round6(geo.lng) }
      : {};
    setModalError("");
    try {
      if (dialog.type === "in") {
        await exec(
          punchIn({ headOfficeId, ...coords, source: "MOBILE_SELF" }),
        );
      } else if (dialog.type === "break") {
        await exec(startAttendanceBreak({ remarks: form.breakType }));
      } else if (dialog.type === "endBreak") {
        await exec(endAttendanceBreak({}));
      } else if (dialog.type === "out") {
        const fresh = getDayTotals(day, new Date());
        await handleResponse(
          dispatch(punchOut({ headOfficeId, ...coords })),
          (res) => {
            const settled = res.payload;
            setCompleted({
              ...session,
              ...settled,
              status: "COMPLETED",
              punchOutAt: settled.punchOutAt ?? new Date().toISOString(),
              netDurationMins:
                settled.netDurationMins ?? Math.round(fresh.worked / MIN),
              breakDurationMins:
                settled.breakDurationMins ?? Math.round(fresh.breaks / MIN),
            });
          },
        );
      }
      closeDialog();
      refresh(); // re-sync with the server
    } catch (e) {
      const known = ERROR_COPY[errorCode(e)];
      if (known?.resync) {
        closeDialog();
        setNotice(known.message);
        refresh();
      } else {
        setModalError(
          known?.message ||
            errorText(e) ||
            "That didn't go through. Check your connection and try again.",
        );
      }
    }
  };

  /* ---- modal configuration ------------------------------------------------ */

  const geoBlocked = requireLocation && geo.status !== "ready";
  const units = estimateUnits(dialogTotals.worked, rules);

  const MODALS = {
    in: {
      title: "Clock in?",
      desc: "Confirm to start your shift. Your location is recorded with this punch.",
      icon: LogIn,
      theme: "success",
      submitText: "Clock in",
      loadingText: "Clocking in...",
      disabled: geoBlocked || !headOfficeId,
    },
    break: {
      title: "Start a break?",
      desc: "Break time is deducted from your working hours.",
      icon: Coffee,
      theme: "warning",
      submitText: "Start break",
      loadingText: "Starting break...",
    },
    endBreak: {
      title: "End your break?",
      desc: openBreak
        ? `You've been on a ${breakLabel(openBreak.type).toLowerCase()} break for ${clockFmt(dialogTotals.openBreak)}.`
        : "Resume work now.",
      icon: Play,
      theme: "info",
      submitText: "End break",
      loadingText: "Ending break...",
    },
    out: {
      title: "Clock out?",
      desc: "This ends your shift and settles today's hazri.",
      icon: LogOut,
      theme: "danger",
      submitText: "Clock out",
      loadingText: "Clocking out...",
      disabled: geoBlocked,
    },
  };
  const m = MODALS[dialog.type] || {};

  const setRemarks = (v) => setForm((f) => ({ ...f, remarks: v }));

  const modalBody = dialog.open ? (
    <div className="space-y-4">
      {modalError && <Notice>{modalError}</Notice>}

      {dialog.type === "in" && (
        <>
          {!headOfficeId && (
            <Notice>
              We couldn&rsquo;t find a head office linked to your profile.
              Contact your administrator before you clock in.
            </Notice>
          )}
          {requireLocation && <LocationRow geo={geo} />}
          <RemarksField value={form.remarks} onChange={setRemarks} />
        </>
      )}

      {dialog.type === "break" && (
        <Field label="Break type">
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Break type"
          >
            {BREAK_TYPES.map((b) => (
              <button
                key={b.key}
                type="button"
                role="radio"
                aria-checked={form.breakType === b.key}
                onClick={() => setForm((f) => ({ ...f, breakType: b.key }))}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 ${
                  form.breakType === b.key
                    ? "border-warning-500 bg-warning-50 text-warning-600 dark:bg-warning-950/30 dark:text-warning-400"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </Field>
      )}

      {dialog.type === "out" && (
        <>
          <div className="grid grid-cols-3 gap-2.5">
            <SummaryTile label="Worked" value={durFmt(dialogTotals.worked)} />
            <SummaryTile label="Breaks" value={durFmt(dialogTotals.breaks)} />
            <SummaryTile label="Hazri so far" value={units.units} />
          </div>
          {units.units === "0.0" ? (
            <Notice>
              You&rsquo;ve worked less than a half day (
              {rules.halfDayThresholdHours}h). If you clock out now it counts as
              absent.
            </Notice>
          ) : (
            <p className="text-[12.5px] text-muted-foreground">
              {units.label} so far. Final hazri units are calculated by the
              server when you clock out.
            </p>
          )}
          {requireLocation && <LocationRow geo={geo} />}
          <RemarksField value={form.remarks} onChange={setRemarks} />
        </>
      )}
    </div>
  ) : null;

  /* ---- render -------------------------------------------------------------- */

  return (
    <div className="space-y-5">
      <PageHeaderBanner title={title} />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <AttendanceHero
            record={record}
            day={day}
            status={status}
            userName={displayName}
            rules={rules}
            completed={completed}
            notice={notice}
            late={late}
            openBreak={openBreak}
            refreshing={refreshing}
            isLoading={isLoadingProp || !loaded}
            requireLocation={requireLocation}
            onRefresh={refresh}
            onOpen={openDialog}
          />
          <Summary day={day} status={status} rules={rules} totals={totals} />
        </div>

        <div className="space-y-5">
          <ActivityLog logs={logs} />
          {effectiveWeeklyProgress && (
            <WeeklyWorkProgressBar data={effectiveWeeklyProgress} title="Weekly data" />
          )}
        </div>
      </div>

      <ModalAction
        id="attendance-confirm"
        isOpen={dialog.open}
        onClose={closeDialog}
        onSubmit={submit}
        title={m.title}
        desc={m.desc}
        icon={m.icon}
        theme={m.theme}
        submitText={m.submitText}
        loadingText={m.loadingText}
        loading={isSubmitting}
        submitDisabled={m.disabled}
        closeOnBackdrop={!isSubmitting}
        size="md"
      >
        {modalBody}
      </ModalAction>
    </div>
  );
}