import { useEffect, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

export const MIN = 60_000;
export const HOUR = 3_600_000;
export const EMPTY_ARR = [];
export const ZERO_TOTALS = { worked: 0, breaks: 0, off: 0, openBreak: 0 };
export const DEFAULT_POLICY = {
  fullDayThresholdHours: 8,
  halfDayThresholdHours: 4,
};

export const BREAK_TYPES = [
  { key: "LUNCH", label: "Lunch" },
  { key: "TEA", label: "Tea" },
  { key: "EMERGENCY", label: "Emergency" },
  { key: "OTHER", label: "Other" },
];

export const breakLabel = (key) =>
  BREAK_TYPES.find((b) => b.key === key)?.label || "Break";

export const FLAG_COPY = {
  GEOFENCE_BREACH: "Outside allowed range",
  TVT_NOT_ATTENDED: "Safety briefing not attended",
};

export const TONES = {
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
  rose: "bg-rose-50 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400",
  indigo:
    "bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-400",
  slate: "bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400",
};

export const STATUS = {
  off: {
    label: "Off the clock",
    pill: TONES.slate,
    dot: "bg-slate-400",
    ring: "stroke-slate-300",
    live: false,
  },
  working: {
    label: "Working",
    pill: TONES.emerald,
    dot: "bg-emerald-500",
    ring: "stroke-emerald-500",
    live: true,
  },
  break: {
    label: "On break",
    pill: TONES.amber,
    dot: "bg-amber-500",
    ring: "stroke-amber-400",
    live: true,
  },
  done: {
    label: "Shift ended",
    pill: TONES.indigo,
    dot: "bg-indigo-500",
    ring: "stroke-indigo-400",
    live: false,
  },
};

/* -------------------------------------------------------------------------- */
/*  Formatting                                                                */
/* -------------------------------------------------------------------------- */

const pad = (n) => String(n).padStart(2, "0");

export const clockFmt = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

export const durFmt = (ms) => {
  const m = Math.floor(Math.max(0, ms) / MIN);
  if (m < 1) return ms > 0 ? "<1m" : "0m";
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (!h) return `${r}m`;
  return r ? `${h}h ${r}m` : `${h}h`;
};

const TIME_FMT = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
export const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const SHORT_DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

export const timeFmt = (d) => (d ? TIME_FMT.format(d).toUpperCase() : "—");

export const dayLabel = (d, now) => {
  if (d.toDateString() === now.toDateString()) return "Today";
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return SHORT_DATE_FMT.format(d);
};

export const round6 = (n) => Number(n.toFixed(6));

export const titleCase = (s) =>
  String(s || "")
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/* -------------------------------------------------------------------------- */
/*  Hooks                                                                     */
/* -------------------------------------------------------------------------- */

/** Re-renders every `interval` ms; skips ticks while the tab is hidden. */
export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = () => {
      if (!document.hidden) setNow(new Date());
    };
    const id = setInterval(tick, interval);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [interval]);
  return now;
}

/* -------------------------------------------------------------------------- */
/*  Events  (API activityLog shape)                                           */
/*  { type, timestamp, sessionId, breakId?, remarks?, durationMins?, ... }    */
/* -------------------------------------------------------------------------- */

const EVENT_KIND = {
  CHECK_IN: "clock_in",
  BREAK_START: "break_start",
  BREAK_END: "break_end",
  CHECK_OUT: "clock_out",
};
const KIND_ORDER = { clock_in: 0, break_start: 1, break_end: 2, clock_out: 3 };

/** Cleans, sorts (oldest -> newest) and gives every event a stable id. */
export function normalizeEvents(raw = EMPTY_ARR) {
  return raw
    .map((e) => ({ ...e, kind: EVENT_KIND[e?.type], ts: Date.parse(e?.timestamp) }))
    .filter((e) => e.kind && Number.isFinite(e.ts))
    .sort((a, b) => a.ts - b.ts || KIND_ORDER[a.kind] - KIND_ORDER[b.kind])
    .map((e) => ({
      ...e,
      id: `${e.sessionId ?? "s"}:${e.kind}:${e.breakId ?? ""}:${e.ts}`,
    }));
}

/** Fallback: turns full session objects into the same event shape. */
export function eventsFromSessions(sessions = EMPTY_ARR) {
  const out = [];
  sessions.forEach((s) => {
    if (!s?.punchInAt) return;
    out.push({
      type: "CHECK_IN",
      timestamp: s.punchInAt,
      sessionId: s.id,
      withinGeofence: s.punchInWithinGeofence,
      distanceM: s.punchInDistanceM,
      siteName: s.site?.name,
      remarks: s.punchInRemarks,
    });
    (s.breaks || []).forEach((b) => {
      out.push({
        type: "BREAK_START",
        timestamp: b.startedAt,
        sessionId: s.id,
        breakId: b.id,
        remarks: b.breakType,
      });
      if (b.endedAt)
        out.push({
          type: "BREAK_END",
          timestamp: b.endedAt,
          sessionId: s.id,
          breakId: b.id,
          durationMins: b.durationMins,
        });
    });
    if (s.punchOutAt)
      out.push({
        type: "CHECK_OUT",
        timestamp: s.punchOutAt,
        sessionId: s.id,
        withinGeofence: s.punchOutWithinGeofence,
        remarks: s.punchOutRemarks,
      });
  });
  return out;
}

/* -------------------------------------------------------------------------- */
/*  Day model: one or more sessions -> work / break / off intervals           */
/* -------------------------------------------------------------------------- */

/**
 * Replays today's events and returns:
 *  intervals   [{ type: "work" | "break" | "off", from, to }]  (to = null if still open)
 *  breaks      completed breaks
 *  openBreak   { id, type, start } | null
 *  state       "off" | "working" | "break"   (state AFTER the last event)
 *  firstClockInAt / lastClockOutAt  (ms | null)
 */
export function buildDay(rawEvents) {
  const events = normalizeEvents(rawEvents);
  const intervals = [];
  const breaks = [];
  let state = "off";
  let cursor = null;
  let openBreak = null;

  const close = (to) => {
    if (cursor == null || state === "off") return;
    intervals.push({ type: state === "break" ? "break" : "work", from: cursor, to });
  };

  events.forEach((e) => {
    if (e.kind === "clock_in") {
      if (state !== "off") return; // duplicate
      if (cursor != null) intervals.push({ type: "off", from: cursor, to: e.ts });
      state = "working";
      cursor = e.ts;
    } else if (e.kind === "break_start") {
      if (state !== "working") return;
      close(e.ts);
      state = "break";
      cursor = e.ts;
      openBreak = { id: e.breakId, type: e.remarks, start: e.ts };
    } else if (e.kind === "break_end") {
      if (state !== "break") return;
      close(e.ts);
      breaks.push({ ...openBreak, end: e.ts });
      openBreak = null;
      state = "working";
      cursor = e.ts;
    } else if (e.kind === "clock_out") {
      if (state === "off") return;
      if (state === "break") {
        breaks.push({ ...openBreak, end: e.ts });
        openBreak = null;
      }
      close(e.ts);
      state = "off";
      cursor = e.ts;
    }
  });

  if (state !== "off")
    intervals.push({ type: state === "break" ? "break" : "work", from: cursor, to: null });

  return {
    events,
    intervals,
    breaks,
    openBreak,
    state,
    breakCount: breaks.length + (openBreak ? 1 : 0),
    firstClockInAt: events.find((e) => e.kind === "clock_in")?.ts ?? null,
    lastClockOutAt: state === "off" && cursor != null ? cursor : null,
  };
}

export const EMPTY_DAY = buildDay(EMPTY_ARR);

export function getDayTotals(day, now) {
  const nowMs = now.getTime();
  const t = { worked: 0, breaks: 0, off: 0, openBreak: 0 };
  day.intervals.forEach((i) => {
    const d = Math.max(0, (i.to ?? nowMs) - i.from);
    if (i.type === "work") t.worked += d;
    else if (i.type === "break") t.breaks += d;
    else t.off += d;
  });
  if (day.openBreak) t.openBreak = Math.max(0, nowMs - day.openBreak.start);
  return t;
}

export function getSegments(day, now) {
  const nowMs = now.getTime();
  return day.intervals.map((i) => ({ type: i.type, from: i.from, to: i.to ?? nowMs }));
}

/* -------------------------------------------------------------------------- */
/*  Activity log                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Builds log rows (oldest -> newest) from raw events.
 * `late` = { minutes, at } attaches "Late by" to the clock-in at that timestamp.
 */
export function buildLogs(rawEvents, late) {
  const events = normalizeEvents(rawEvents);
  const breakType = new Map();
  const breakStart = new Map();
  const sessions = new Map();

  events.forEach((e) => {
    if (e.kind === "break_start") {
      breakType.set(e.breakId, e.remarks);
      breakStart.set(e.breakId, e.ts);
    }
    const key = e.sessionId ?? "_";
    if (!sessions.has(key)) sessions.set(key, { in: null, out: null, breakMs: 0 });
    const s = sessions.get(key);
    if (e.kind === "clock_in") s.in = e.ts;
    if (e.kind === "clock_out") s.out = e.ts;
    if (e.kind === "break_end")
      s.breakMs += Math.max(0, e.ts - (breakStart.get(e.breakId) ?? e.ts));
  });

  return events.map((e) => {
    const s = sessions.get(e.sessionId ?? "_");
    const summary =
      e.kind === "clock_out" && s?.in != null && s.out != null
        ? {
            workedMs: Math.max(0, s.out - s.in - s.breakMs),
            breakMs: s.breakMs,
          }
        : null;
    return {
      id: e.id,
      type: e.kind,
      at: e.timestamp,
      event: e,
      breakType: e.kind.startsWith("break") ? breakType.get(e.breakId) ?? e.remarks : null,
      summary,
      late: late && e.kind === "clock_in" && e.ts === late.at ? late.minutes : null,
    };
  });
}