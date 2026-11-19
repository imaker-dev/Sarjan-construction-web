import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Coffee,
  Hourglass,
  Inbox,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  Play,
  RefreshCw,
  Timer,
} from "lucide-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import ModalAction from "@components/ui/ModalAction"; // <- adjust to where your modal lives

/* ========================================================================== */
/*  HOW TO WIRE THE API (sections 3.1 - 3.4)                                  */
/*                                                                            */
/*  <TeamShiftPage                                                            */
/*    session={activeSession}              // GET /attendance/sessions/active  */
/*                                         //   -> response.session (or null) */
/*    isLoading={isFetchingSession}                                           */
/*    sites={mySites}                      // [{ id, code, name }]             */
/*    onRefresh={() => dispatch(getActiveSession()).unwrap()}                 */
/*    onPunchIn={(payload) => dispatch(punchIn(payload)).unwrap()}            */
/*    onStartBreak={(payload) => dispatch(startBreak(payload)).unwrap()}      */
/*    onEndBreak={(payload) => dispatch(endBreak(payload)).unwrap()}          */
/*    onPunchOut={(payload) => dispatch(punchOut(payload)).unwrap()}          */
/*  />                                                                        */
/*                                                                            */
/*  - Each handler receives the ready-to-send payload and must return a       */
/*    promise. If it rejects, the error (with `code`/`message`) is shown.     */
/*  - After every success the page calls onRefresh() to re-sync (3.1).        */
/*  - onPunchOut should resolve with the 3.4 response to show settled hazri.  */
/*  - No backend yet? Use the exported useMockAttendance() hook (bottom).     */
/* ========================================================================== */

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const MIN = 60_000;
const HOUR = 3_600_000;
const EMPTY_SHIFT = { clockInAt: null, clockOutAt: null, breaks: [] };
const DEFAULT_POLICY = { fullDayThresholdHours: 8, halfDayThresholdHours: 4 };

const BREAK_TYPES = [
  { key: "LUNCH", label: "Lunch" },
  { key: "TEA", label: "Tea" },
  { key: "PRAYER", label: "Prayer" },
  { key: "EMERGENCY", label: "Emergency" },
  { key: "OTHER", label: "Other" },
];
const breakLabel = (key) => BREAK_TYPES.find((b) => b.key === key)?.label || "Break";

const pad = (n) => String(n).padStart(2, "0");

const clockFmt = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

const durFmt = (ms) => {
  const m = Math.floor(Math.max(0, ms) / MIN);
  if (m < 1) return ms > 0 ? "<1m" : "0m";
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (!h) return `${r}m`;
  return r ? `${h}h ${r}m` : `${h}h`;
};

const timeFmt = (d) =>
  d ? d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase() : "—";

const dayLabel = (d, now) => {
  if (d.toDateString() === now.toDateString()) return "Today";
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
};

const round6 = (n) => Number(n.toFixed(6));
const titleCase = (s) =>
  String(s || "")
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

function useNow(interval = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

/** Asks the browser for the current position while `active` is true. */
function useGeolocation(active) {
  const [state, setState] = useState({ status: "idle" });

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ status: "error", message: "This device doesn't support location." });
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

/** API session -> the shape the timers use. */
const toShift = (s) =>
  s
    ? {
        clockInAt: new Date(s.punchInAt),
        clockOutAt: s.punchOutAt ? new Date(s.punchOutAt) : null,
        breaks: (s.breaks || []).map((b) => ({
          start: new Date(b.startedAt),
          end: b.endedAt ? new Date(b.endedAt) : null,
        })),
      }
    : EMPTY_SHIFT;

const getStatus = (shift) => {
  if (!shift.clockInAt) return "off";
  if (shift.clockOutAt) return "done";
  return shift.breaks.some((b) => !b.end) ? "break" : "working";
};

function getTotals(shift, now) {
  if (!shift.clockInAt) return { worked: 0, breaks: 0, openBreak: 0 };
  const end = shift.clockOutAt || now;
  const breaks = shift.breaks.reduce((sum, b) => sum + Math.max(0, (b.end || end) - b.start), 0);
  const open = shift.breaks.find((b) => !b.end);
  return {
    worked: Math.max(0, end - shift.clockInAt - breaks),
    breaks,
    openBreak: open ? Math.max(0, now - open.start) : 0,
  };
}

function getSegments(shift, now) {
  if (!shift.clockInAt) return [];
  const end = (shift.clockOutAt || now).getTime();
  const segments = [];
  let cursor = shift.clockInAt.getTime();
  [...shift.breaks]
    .sort((a, b) => a.start - b.start)
    .forEach((b) => {
      const from = b.start.getTime();
      const to = (b.end || new Date(end)).getTime();
      if (from > cursor) segments.push({ type: "work", from: cursor, to: from });
      segments.push({ type: "break", from, to });
      cursor = to;
    });
  if (end > cursor) segments.push({ type: "work", from: cursor, to: end });
  return segments;
}

const estimateUnits = (workedMs, policy) => {
  const h = workedMs / HOUR;
  if (h >= policy.fullDayThresholdHours) return { units: "1.0", label: "Full day" };
  if (h >= policy.halfDayThresholdHours) return { units: "0.5", label: "Half day" };
  return { units: "0.0", label: "Absent" };
};

/* ---- API errors ---------------------------------------------------------- */

const ERROR_COPY = {
  ACTIVE_SESSION_EXISTS: { message: "You're already clocked in. Your status has been refreshed.", resync: true },
  NO_ACTIVE_SESSION: { message: "There's no active shift. Your status has been refreshed.", resync: true },
  ACTIVE_BREAK_EXISTS: { message: "You're already on a break. Your status has been refreshed.", resync: true },
  NO_ACTIVE_BREAK: { message: "There's no break to end. Your status has been refreshed.", resync: true },
  GEOFENCE_BREACH: { message: "You're outside the site boundary. Move closer to the site gate and try again." },
  TVT_NOT_ATTENDED: {
    message:
      "You haven't attended today's safety briefing yet. Ask your safety supervisor to log your attendance, then clock in.",
  },
  PERMISSION_DENIED: { message: "You don't have permission to record attendance. Contact your administrator." },
  TOKEN_MISSING: { message: "Your session expired. Sign in again to continue." },
};

const errorCode = (e) => e?.code ?? e?.response?.data?.code ?? e?.data?.code ?? e?.payload?.code ?? e?.error?.code;
const errorText = (e) =>
  e?.message ?? e?.response?.data?.message ?? e?.data?.message ?? (typeof e === "string" ? e : null);

const FLAG_COPY = {
  GEOFENCE_BREACH: "Outside site range",
  TVT_NOT_ATTENDED: "Safety briefing not attended",
};

/* -------------------------------------------------------------------------- */
/*  Styling maps                                                              */
/* -------------------------------------------------------------------------- */

const CARD = "rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1C2536]";

const TONES = {
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
  rose: "bg-rose-50 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400",
  indigo: "bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-400",
  slate: "bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400",
};

const STATUS = {
  off: { label: "Off the clock", pill: TONES.slate, dot: "bg-slate-400", ring: "stroke-slate-300", live: false },
  working: { label: "Working", pill: TONES.emerald, dot: "bg-emerald-500", ring: "stroke-emerald-500", live: true },
  break: { label: "On break", pill: TONES.amber, dot: "bg-amber-500", ring: "stroke-amber-400", live: true },
  done: { label: "Shift ended", pill: TONES.indigo, dot: "bg-indigo-500", ring: "stroke-indigo-400", live: false },
};

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

const BUTTON_TONES = {
  emerald:
    "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25 hover:bg-emerald-600 focus-visible:ring-emerald-500/40",
  amber: "bg-amber-500 text-white shadow-sm shadow-amber-500/25 hover:bg-amber-600 focus-visible:ring-amber-500/40",
  amberSoft:
    "bg-amber-50 text-amber-700 hover:bg-amber-100 focus-visible:ring-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25",
  roseSoft:
    "bg-rose-50 text-rose-600 hover:bg-rose-100 focus-visible:ring-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25",
  neutral:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-300 dark:border-slate-700 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-700/40",
};

/* -------------------------------------------------------------------------- */
/*  Activity log (built from session data: no extra API needed)               */
/* -------------------------------------------------------------------------- */

function buildLogs(sessions) {
  const out = [];
  sessions.forEach((s) => {
    out.push({ id: `${s.id}-in`, type: "clock_in", at: s.punchInAt, session: s });
    (s.breaks || []).forEach((b) => {
      out.push({ id: `${b.id}-s`, type: "break_start", at: b.startedAt, brk: b });
      if (b.endedAt) out.push({ id: `${b.id}-e`, type: "break_end", at: b.endedAt, brk: b });
    });
    if (s.punchOutAt) out.push({ id: `${s.id}-out`, type: "clock_out", at: s.punchOutAt, session: s });
  });
  return out;
}

function logDetails(log) {
  const s = log.session;
  const lines = [];
  if (log.type === "clock_in") {
    if (s.site?.name) {
      const dist = s.punchInDistanceM != null ? ` · ${s.punchInDistanceM} m from site` : "";
      lines.push({ text: `${s.site.name}${dist}` });
    }
    if (s.isFlagged)
      lines.push({
        text: `Flagged: ${FLAG_COPY[s.flagReason] || titleCase(s.flagReason) || "needs review"}`,
        tone: "text-amber-600 dark:text-amber-400",
      });
  }
  if (log.type === "break_start") lines.push({ text: `${breakLabel(log.brk.breakType)} break` });
  if (log.type === "break_end") {
    const mins =
      log.brk.durationMins || Math.round((new Date(log.brk.endedAt) - new Date(log.brk.startedAt)) / MIN);
    lines.push({ text: `${breakLabel(log.brk.breakType)} break lasted ${durFmt(mins * MIN)}` });
  }
  if (log.type === "clock_out") {
    const bits = [];
    if (s.netDurationMins != null) bits.push(`Worked ${durFmt(s.netDurationMins * MIN)}`);
    if (s.totalPUnits != null) bits.push(`${s.totalPUnits} hazri`);
    if (bits.length) lines.push({ text: bits.join(" · ") });
  }
  return lines;
}

/* -------------------------------------------------------------------------- */
/*  Small components                                                          */
/* -------------------------------------------------------------------------- */

function ShiftButton({ tone, icon: Icon, label, onClick, disabled, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-[14.5px] font-semibold transition focus:outline-none focus-visible:ring-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${BUTTON_TONES[tone]}`}
    >
      <Icon size={18} strokeWidth={2.25} />
      {label}
    </button>
  );
}

function ProgressRing({ pct, ringClass, children }) {
  const R = 88;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative h-52 w-52 shrink-0 sm:h-60 sm:w-60">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="100" cy="100" r={R} fill="none" strokeWidth="10" className="stroke-slate-100 dark:stroke-slate-700/60" />
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
          className={`${ringClass} transition-[stroke-dashoffset] duration-700 ease-linear motion-reduce:transition-none`}
          style={{ opacity: pct > 0 ? 1 : 0 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

function StatCard({ icon: Icon, tone, label, value, sub }) {
  return (
    <div className={`${CARD} flex items-center gap-3 p-4`}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${TONES[tone]}`}>
        <Icon size={18} strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] text-slate-400 dark:text-slate-500">{label}</p>
        <p className="truncate text-[17px] font-semibold tabular-nums leading-tight text-slate-800 dark:text-white">{value}</p>
        {sub && <p className="text-[11.5px] text-slate-400 dark:text-slate-500">{sub}</p>}
      </div>
    </div>
  );
}

function Notice({ tone = "rose", children }) {
  const styles =
    tone === "rose"
      ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
      : "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300";
  return (
    <div role="alert" className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-[12.5px] leading-relaxed ${styles}`}>
      <AlertCircle size={15} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function Timeline({ segments, shift }) {
  const total = segments.reduce((s, x) => s + (x.to - x.from), 0);
  return (
    <section className={`${CARD} p-5 sm:p-6`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-slate-800 dark:text-white">Today&rsquo;s timeline</h3>
        <div className="flex items-center gap-4 text-[12px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Work
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> Break
          </span>
        </div>
      </div>
      {total > 0 ? (
        <>
          <div className="mt-4 flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/50">
            {segments.map((s, i) => (
              <div
                key={i}
                title={`${s.type === "work" ? "Working" : "Break"} · ${durFmt(s.to - s.from)}`}
                style={{ flexGrow: s.to - s.from, flexBasis: 0, minWidth: 3 }}
                className={s.type === "work" ? "bg-emerald-500" : "bg-amber-400"}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[12px] tabular-nums text-slate-400 dark:text-slate-500">
            <span>{timeFmt(shift.clockInAt)}</span>
            <span>{shift.clockOutAt ? timeFmt(shift.clockOutAt) : "Now"}</span>
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-slate-200 px-4 py-5 text-center text-[13px] text-slate-400 dark:border-slate-700 dark:text-slate-500">
          Your day appears here once you clock in.
        </div>
      )}
    </section>
  );
}

function LogItem({ log, isLast }) {
  const { title, icon: Icon, tone } = LOG_META[log.type];
  const lines = logDetails(log);
  return (
    <li className="relative flex gap-3.5 pb-5 last:pb-0">
      {!isLast && (
        <span aria-hidden="true" className="absolute -bottom-1 left-4 top-9 w-px -translate-x-1/2 bg-slate-100 dark:bg-slate-700/70" />
      )}
      <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONES[tone]}`}>
        <Icon size={15} strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{title}</p>
          <time dateTime={log.at} className="shrink-0 text-[12.5px] tabular-nums text-slate-400 dark:text-slate-500">
            {timeFmt(new Date(log.at))}
          </time>
        </div>
        {lines.map((l, i) => (
          <p key={i} className={`mt-0.5 text-[12.5px] ${l.tone || "text-slate-400 dark:text-slate-500"}`}>
            {l.text}
          </p>
        ))}
      </div>
    </li>
  );
}

function ActivityLog({ logs, now }) {
  const [filter, setFilter] = useState("all");

  const groups = useMemo(() => {
    const types = FILTERS.find((f) => f.key === filter).types;
    const map = new Map();
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
          <h3 className="text-[15px] font-semibold text-slate-800 dark:text-white">Activity log</h3>
          <p className="mt-0.5 text-[12.5px] text-slate-400 dark:text-slate-500">Every clock-in, break and clock-out</p>
        </div>
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800/60" role="group" aria-label="Filter activity">
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
          <span className={`flex h-12 w-12 items-center justify-center rounded-full ${TONES.slate}`}>
            <Inbox size={22} />
          </span>
          <p className="text-[14px] font-medium text-slate-700 dark:text-slate-200">No activity yet</p>
          <p className="max-w-xs text-[12.5px] text-slate-400 dark:text-slate-500">
            Clock in to start your shift. Everything you do shows up here.
          </p>
        </div>
      ) : (
        <div className="max-h-[640px] space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          {groups.map((items) => (
            <div key={items[0].id}>
              <p className="mb-3 text-[12.5px] font-semibold text-slate-500 dark:text-slate-400">
                {dayLabel(new Date(items[0].at), now)}
              </p>
              <ol>
                {items.map((log, i) => (
                  <LogItem key={log.id} log={log} isLast={i === items.length - 1} />
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ClockCardSkeleton() {
  return (
    <div className="grid gap-6 px-5 py-8 sm:px-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-10" aria-hidden="true">
      <div className="mx-auto h-52 w-52 animate-pulse rounded-full bg-slate-100 dark:bg-slate-700/40 sm:h-60 sm:w-60" />
      <div className="space-y-4">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-700/40" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700/40" />
      </div>
    </div>
  );
}

/* ---- Modal contents ------------------------------------------------------ */

const FIELD_INPUT =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-[13.5px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20";

function Field({ label, children }) {
  return (
    <div>
      <p className="mb-1.5 text-[12.5px] font-medium text-muted-foreground">{label}</p>
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
        className={`${FIELD_INPUT} resize-none`}
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
      <p className="mt-0.5 text-[14.5px] font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Props
 *  title          banner title (default "Attendance")
 *  userName       shows a greeting
 *  session        active session from GET /attendance/sessions/active (or null)
 *  history        optional past sessions (same shape, with punchOutAt) shown in the log
 *  isLoading      initial fetch in progress
 *  sites          [{ id, code, name }] the worker can clock into
 *  defaultSiteId  preselected site
 *  policy         { fullDayThresholdHours, halfDayThresholdHours } (defaults 8 / 4)
 *  requireLocation  block clock in/out until GPS is available (default true)
 *  onRefresh / onPunchIn / onStartBreak / onEndBreak / onPunchOut   see top of file
 */
export default function AttendancePage({
  title = "Attendance",
  userName,
  session = null,
  history = [],
  isLoading = false,
  sites = [],
  defaultSiteId,
  policy = DEFAULT_POLICY,
  requireLocation = true,
  onRefresh,
  onPunchIn,
  onStartBreak,
  onEndBreak,
  onPunchOut,
}) {
  const now = useNow();
  const [completed, setCompleted] = useState(null); // settled record shown after clock out
  const [dialog, setDialog] = useState({ open: false, type: null });
  const [form, setForm] = useState({ siteId: "", breakType: "LUNCH", remarks: "" });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [notice, setNotice] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (session) setCompleted(null);
  }, [session]);

  const record = session ?? completed; // what the card is currently showing
  const shift = toShift(record);
  const status = getStatus(shift);
  const st = STATUS[status];
  const totals = getTotals(shift, now);
  const segments = getSegments(shift, now);
  const openBreak = session?.breaks?.find((b) => !b.endedAt);

  const target = policy.fullDayThresholdHours * HOUR;
  const pct = Math.min(1, totals.worked / target);
  const diff = target - totals.worked;
  const overtime = diff < 0;
  const count = shift.breaks.length;

  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const logs = useMemo(
    () => buildLogs([...(history || []), ...(record ? [record] : [])]),
    [history, record],
  );

  const needsGeo = dialog.open && (dialog.type === "in" || dialog.type === "out");
  const geo = useGeolocation(needsGeo);

  /* ---- dialog controls ---------------------------------------------------- */

  const openDialog = (type) => {
    setModalError("");
    setNotice("");
    setForm({ siteId: defaultSiteId || sites[0]?.id || "", breakType: "LUNCH", remarks: "" });
    setDialog({ open: true, type });
  };
  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));

  const refresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh?.();
    } catch {
      /* the next action will surface any real problem */
    } finally {
      setRefreshing(false);
    }
  };

  /* ---- submit: builds the payload for each endpoint ----------------------- */

  const submit = async () => {
    const remarks = form.remarks.trim();
    const withRemarks = (p) => (remarks ? { ...p, remarks } : p);
    const ready = geo.status === "ready";
    setSubmitting(true);
    setModalError("");
    try {
      if (dialog.type === "in") {
        // 3.2 POST /attendance/punch-in
        await onPunchIn?.(
          withRemarks({
            siteId: form.siteId,
            ...(ready && { punchInLat: round6(geo.lat), punchInLng: round6(geo.lng) }),
            source: "MOBILE_SELF",
          }),
        );
      } else if (dialog.type === "break") {
        // 3.3 POST /attendance/breaks/start
        await onStartBreak?.(withRemarks({ sessionId: session.id, breakType: form.breakType }));
      } else if (dialog.type === "endBreak") {
        // 3.3 POST /attendance/breaks/end
        await onEndBreak?.({ sessionId: session.id });
      } else if (dialog.type === "out") {
        // 3.4 POST /attendance/punch-out
        const res = await onPunchOut?.(
          withRemarks({
            sessionId: session.id,
            ...(ready && { punchOutLat: round6(geo.lat), punchOutLng: round6(geo.lng) }),
          }),
        );
        const settled = res?.data ?? res ?? {};
        setCompleted({
          ...session,
          ...settled,
          status: "COMPLETED",
          punchOutAt: settled.punchOutAt ?? new Date().toISOString(),
          netDurationMins: settled.netDurationMins ?? Math.round(totals.worked / MIN),
          breakDurationMins: settled.breakDurationMins ?? Math.round(totals.breaks / MIN),
        });
      }
      closeDialog();
      refresh(); // 3.1 re-sync
    } catch (e) {
      const known = ERROR_COPY[errorCode(e)];
      if (known?.resync) {
        closeDialog();
        setNotice(known.message);
        refresh();
      } else {
        setModalError(known?.message || errorText(e) || "That didn't go through. Check your connection and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ---- modal configuration ------------------------------------------------ */

  const geoBlocked = requireLocation && geo.status !== "ready";
  const units = estimateUnits(totals.worked, policy);
  const noSite = dialog.type === "in" && !form.siteId;

  const MODALS = {
    in: {
      title: "Clock in?",
      desc: "Confirm to start your shift. Your location is recorded with this punch.",
      icon: LogIn,
      theme: "success",
      submitText: "Clock in",
      loadingText: "Clocking in...",
      disabled: noSite || geoBlocked,
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
        ? `You've been on a ${breakLabel(openBreak.breakType).toLowerCase()} break for ${clockFmt(totals.openBreak)}.`
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

  const modalBody = (
    <div className="space-y-4">
      {modalError && <Notice>{modalError}</Notice>}

      {dialog.type === "in" && (
        <>
          {sites.length > 1 ? (
            <Field label="Site">
              <select
                value={form.siteId}
                onChange={(e) => setForm((f) => ({ ...f, siteId: e.target.value }))}
                className={FIELD_INPUT}
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </Field>
          ) : sites.length === 1 ? (
            <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2.5 text-[13px] text-foreground">
              <MapPin size={16} className="shrink-0 text-muted-foreground" />
              {sites[0].name} ({sites[0].code})
            </div>
          ) : (
            <Notice>No site is assigned to you yet. Ask your supervisor to assign one before you clock in.</Notice>
          )}
          {requireLocation && <LocationRow geo={geo} />}
          <RemarksField value={form.remarks} onChange={(v) => setForm((f) => ({ ...f, remarks: v }))} />
        </>
      )}

      {dialog.type === "break" && (
        <>
          <Field label="Break type">
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Break type">
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
          <RemarksField value={form.remarks} onChange={(v) => setForm((f) => ({ ...f, remarks: v }))} />
        </>
      )}

      {dialog.type === "out" && (
        <>
          <div className="grid grid-cols-3 gap-2.5">
            <SummaryTile label="Worked" value={durFmt(totals.worked)} />
            <SummaryTile label="Breaks" value={durFmt(totals.breaks)} />
            <SummaryTile label="Hazri so far" value={units.units} />
          </div>
          {units.units === "0.0" ? (
            <Notice>
              You&rsquo;ve worked less than a half day ({policy.halfDayThresholdHours}h). If you clock out now it counts as
              absent.
            </Notice>
          ) : (
            <p className="text-[12.5px] text-muted-foreground">
              {units.label} so far. Final hazri units are calculated by the server when you clock out.
            </p>
          )}
          {requireLocation && <LocationRow geo={geo} />}
          <RemarksField value={form.remarks} onChange={(v) => setForm((f) => ({ ...f, remarks: v }))} />
        </>
      )}
    </div>
  );

  /* ---- render -------------------------------------------------------------- */

  return (
    <div className="space-y-5">
      <PageHeaderBanner title={title} />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <section className={CARD}>
            <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
              <div>
                <p className="text-[12.5px] font-medium text-slate-400 dark:text-slate-500">
                  {userName ? `${greeting}, ${userName}` : greeting}
                </p>
                <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-slate-800 dark:text-white">
                  {timeFmt(now)}
                </p>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  aria-live="polite"
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] font-medium ${st.pill}`}
                >
                  <span className="relative flex h-2 w-2">
                    {st.live && (
                      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:animate-none ${st.dot}`} />
                    )}
                    <span className={`relative inline-flex h-2 w-2 rounded-full ${st.dot}`} />
                  </span>
                  {st.label}
                </span>
                {onRefresh && (
                  <button
                    type="button"
                    onClick={refresh}
                    disabled={refreshing}
                    aria-label="Refresh status"
                    title="Refresh status"
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-60 dark:hover:bg-slate-700/50 dark:hover:text-slate-200"
                  >
                    <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                  </button>
                )}
              </div>
            </div>

            {isLoading ? (
              <ClockCardSkeleton />
            ) : (
              <div className="grid gap-6 px-5 py-6 sm:px-6 sm:py-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-10">
                <div className="flex justify-center">
                  <ProgressRing pct={pct} ringClass={st.ring}>
                    <span className="text-[12.5px] text-slate-400 dark:text-slate-500">Worked today</span>
                    <span
                      role="timer"
                      aria-label="Time worked today"
                      className="mt-1 text-[32px] font-semibold tabular-nums tracking-tight text-slate-800 dark:text-white sm:text-4xl"
                    >
                      {clockFmt(totals.worked)}
                    </span>
                    <span className="mt-1 text-[12.5px] text-slate-400 dark:text-slate-500">
                      of {policy.fullDayThresholdHours}h &middot; {Math.round(pct * 100)}%
                    </span>
                  </ProgressRing>
                </div>

                <div className="space-y-4">
                  {record?.site && (
                    <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-medium ${TONES.slate}`}>
                        <MapPin size={13} /> {record.site.name}
                      </span>
                      {record.punchInWithinGeofence != null && (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-medium ${
                            record.punchInWithinGeofence && !record.isFlagged ? TONES.emerald : TONES.amber
                          }`}
                        >
                          {record.punchInWithinGeofence && !record.isFlagged
                            ? "Within site range"
                            : FLAG_COPY[record.flagReason] || "Flagged for review"}
                        </span>
                      )}
                    </div>
                  )}

                  {status === "break" && openBreak && (
                    <p className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-[13.5px] font-medium tabular-nums text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 md:justify-start">
                      <Coffee size={16} />
                      {breakLabel(openBreak.breakType)} break &middot; {clockFmt(totals.openBreak)}
                    </p>
                  )}

                  {status === "off" && (
                    <ShiftButton tone="emerald" icon={LogIn} label="Clock in" onClick={() => openDialog("in")} />
                  )}

                  {status === "working" && (
                    <div className="grid grid-cols-2 gap-3">
                      <ShiftButton tone="amberSoft" icon={Coffee} label="Start break" onClick={() => openDialog("break")} />
                      <ShiftButton tone="roseSoft" icon={LogOut} label="Clock out" onClick={() => openDialog("out")} />
                    </div>
                  )}

                  {status === "break" && (
                    <div className="grid grid-cols-2 gap-3">
                      <ShiftButton tone="amber" icon={Play} label="End break" onClick={() => openDialog("endBreak")} />
                      <ShiftButton tone="neutral" icon={LogOut} label="Clock out" disabled title="End your break before clocking out" />
                    </div>
                  )}

                  {status === "done" && (
                    <>
                      <div className={`rounded-xl px-4 py-3 ${TONES.indigo}`}>
                        <p className="text-[14px] font-medium">Shift complete</p>
                        <p className="mt-0.5 text-[12.5px] opacity-80">
                          {durFmt(totals.worked)} worked, {durFmt(totals.breaks)} on breaks
                          {completed?.totalPUnits != null && <> &middot; {completed.totalPUnits} hazri</>}
                          {Number(completed?.overtimeHours) > 0 && <> &middot; {completed.overtimeHours}h overtime</>}
                        </p>
                      </div>
                      <ShiftButton tone="neutral" icon={Play} label="Start new shift" onClick={() => openDialog("in")} />
                    </>
                  )}

                  {notice && <Notice tone="sky">{notice}</Notice>}
                </div>
              </div>
            )}
          </section>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            <StatCard icon={LogIn} tone="emerald" label="Clocked in" value={timeFmt(shift.clockInAt)} />
            <StatCard icon={Timer} tone="indigo" label="Worked" value={durFmt(totals.worked)} />
            <StatCard
              icon={Coffee}
              tone="amber"
              label="Break time"
              value={durFmt(totals.breaks)}
              sub={`${count} ${count === 1 ? "break" : "breaks"}`}
            />
            <StatCard
              icon={Hourglass}
              tone={overtime ? "rose" : "sky"}
              label={overtime ? "Overtime" : "Remaining"}
              value={durFmt(Math.abs(diff))}
            />
          </div>

          <Timeline segments={segments} shift={shift} />
        </div>

        <ActivityLog logs={logs} now={now} />
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
        loading={submitting}
        submitDisabled={m.disabled}
        closeOnBackdrop={!submitting}
        size="md"
      >
        {modalBody}
      </ModalAction>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dev-only: fake backend so you can preview the page before the API exists  */
/*                                                                            */
/*    const mock = useMockAttendance();                                       */
/*    return <TeamShiftPage {...mock} userName="Sahil" />;                    */
/* -------------------------------------------------------------------------- */

export function useMockAttendance(site = { id: "s001", code: "S-04", name: "Metro Station 4" }) {
  const [session, setSession] = useState(null);
  const wait = (ms = 600) => new Promise((r) => setTimeout(r, ms));

  return {
    session,
    sites: [site],
    onRefresh: async () => {},
    onPunchIn: async (p) => {
      await wait();
      const s = {
        id: `mock-${Date.now()}`,
        siteId: p.siteId,
        status: "IN_PROGRESS",
        punchInAt: new Date().toISOString(),
        punchInDistanceM: 42,
        punchInWithinGeofence: true,
        isFlagged: false,
        flagReason: null,
        site,
        breaks: [],
      };
      setSession(s);
      return s;
    },
    onStartBreak: async (p) => {
      await wait();
      const b = { id: `brk-${Date.now()}`, breakType: p.breakType, startedAt: new Date().toISOString(), endedAt: null, durationMins: 0 };
      setSession((s) => ({ ...s, breaks: [...s.breaks, b] }));
      return b;
    },
    onEndBreak: async () => {
      await wait();
      const end = new Date();
      setSession((s) => ({
        ...s,
        breaks: s.breaks.map((b) =>
          b.endedAt ? b : { ...b, endedAt: end.toISOString(), durationMins: Math.round((end - new Date(b.startedAt)) / MIN) },
        ),
      }));
    },
    onPunchOut: async () => {
      await wait();
      const out = new Date();
      const brk = session.breaks.reduce((s, b) => s + (new Date(b.endedAt || out) - new Date(b.startedAt)), 0);
      const gross = out - new Date(session.punchInAt);
      const net = Math.max(0, gross - brk);
      const u = estimateUnits(net, DEFAULT_POLICY).units;
      setSession(null);
      return {
        id: session.id,
        status: "COMPLETED",
        punchOutAt: out.toISOString(),
        grossDurationMins: Math.round(gross / MIN),
        breakDurationMins: Math.round(brk / MIN),
        netDurationMins: Math.round(net / MIN),
        presentUnits: u,
        overtimePUnits: "0.0",
        totalPUnits: u,
        overtimeHours: "0",
      };
    },
  };
}