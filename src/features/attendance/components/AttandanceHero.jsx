import React from "react";
import {
  AlertCircle,
  Clock,
  Coffee,
  LogIn,
  LogOut,
  MapPin,
  Play,
  RefreshCw,
} from "lucide-react";
import {
  DATE_FMT,
  FLAG_COPY,
  HOUR,
  MIN,
  STATUS,
  TONES,
  breakLabel,
  clockFmt,
  durFmt,
  getDayTotals,
  timeFmt,
  useNow,
} from "@utils/attendance.utils";

const BUTTON_TONES = {
  emerald:
    "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25 hover:bg-emerald-600 focus-visible:ring-emerald-500/40",
  amber:
    "bg-amber-500 text-white shadow-sm shadow-amber-500/25 hover:bg-amber-600 focus-visible:ring-amber-500/40",
  amberSoft:
    "bg-amber-50 text-amber-700 hover:bg-amber-100 focus-visible:ring-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25",
  roseSoft:
    "bg-rose-50 text-rose-600 hover:bg-rose-100 focus-visible:ring-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25",
  neutral:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-300 dark:border-slate-700 dark:bg-transparent dark:text-slate-200 dark:hover:bg-slate-700/40",
};

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

function ProgressRing({ pct, halfPct, ringClass, children }) {
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const angle = halfPct * 2 * Math.PI;

  const tick = {
    x1: 100 + (radius - 9) * Math.cos(angle),
    y1: 100 + (radius - 9) * Math.sin(angle),
    x2: 100 + (radius + 9) * Math.cos(angle),
    y2: 100 + (radius + 9) * Math.sin(angle),
  };

  return (
    <div className="relative h-52 w-52 shrink-0 sm:h-60 sm:w-60">
      <svg
        viewBox="0 0 200 200"
        className="relative h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          strokeWidth="10"
          className="stroke-slate-100 dark:stroke-slate-700/60"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          className={`${ringClass} transition-[stroke-dashoffset] duration-700 ease-linear motion-reduce:transition-none`}
          style={{ opacity: pct > 0 ? 1 : 0 }}
        />
        <line
          {...tick}
          strokeWidth="2"
          strokeLinecap="round"
          className="stroke-slate-300 dark:stroke-slate-500"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

function Notice({ children }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg bg-sky-50 px-3 py-2.5 text-[12.5px] leading-relaxed text-sky-700 dark:bg-sky-500/10 dark:text-sky-300"
    >
      <AlertCircle size={15} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function Chip({ tone, icon: Icon, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-medium ${TONES[tone]}`}
    >
      {Icon && <Icon size={13} />}
      {children}
    </span>
  );
}

/**
 * Props
 *  record      current session object (or the just-completed one) - used for site / geofence chips
 *  day         buildDay() result for today (all sessions)
 *  status      "off" | "working" | "break" | "done"
 *  late        { minutes, scheduledAt } | null   (measured from the first clock-in of the day)
 *  openBreak   day.openBreak
 */
export default function AttendanceHero({
  record,
  day,
  status,
  userName,
  rules,
  completed,
  notice,
  late,
  openBreak,
  refreshing,
  isLoading,
  requireLocation,
  onRefresh,
  onOpen,
}) {
  const st = STATUS[status];
  const now = useNow(st.live ? 1000 : 30_000);
  const totals = getDayTotals(day, now); // worked = ALL sessions today

  const targetMs = rules.fullDayThresholdHours * HOUR;
  const remainingMs = targetMs - totals.worked;
  const pct = Math.min(1, totals.worked / targetMs);
  const halfPct = Math.min(
    1,
    rules.halfDayThresholdHours / rules.fullDayThresholdHours,
  );

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const hasGeo = record?.punchInWithinGeofence != null;
  const inRange = record?.punchInWithinGeofence && !record?.isFlagged;

  // Break time pauses the clock, so only project a clock-out while working.
  const expectedOut =
    status === "working" && remainingMs > 0
      ? new Date(now.getTime() + remainingMs)
      : null;

  return (
    <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1C2536]">
      <div className="relative flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
        <div>
          <p className="text-[12.5px] font-medium text-slate-400 dark:text-slate-500">
            {userName ? `${greeting}, ${userName}` : greeting}
          </p>
          <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-slate-800 dark:text-white">
            {timeFmt(now)}
          </p>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            {DATE_FMT.format(now)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            aria-live="polite"
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] font-medium ${st.pill}`}
          >
            <span className="relative flex h-2 w-2">
              {st.live && (
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:animate-none ${st.dot}`}
                />
              )}
              <span className={`relative h-2 w-2 rounded-full ${st.dot}`} />
            </span>
            {st.label}
          </span>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh status"
            title="Refresh status"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:opacity-60 dark:hover:bg-slate-700/50 dark:hover:text-slate-200"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="relative grid gap-6 px-5 py-8 sm:px-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-10">
          <div className="mx-auto h-52 w-52 animate-pulse rounded-full bg-slate-100 dark:bg-slate-700/40 sm:h-60 sm:w-60" />
          <div className="space-y-4">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-700/40" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700/40" />
          </div>
        </div>
      ) : (
        <div className="relative grid gap-6 px-5 py-6 sm:px-6 sm:py-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-10">
          <div className="flex justify-center">
            <ProgressRing pct={pct} halfPct={halfPct} ringClass={st.ring}>
              <span className="text-[12.5px] text-slate-400 dark:text-slate-500">
                Worked today
              </span>
              <span
                role="timer"
                aria-label="Time worked today"
                className="mt-1 text-[32px] font-semibold tabular-nums tracking-tight text-slate-800 dark:text-white sm:text-4xl"
              >
                {clockFmt(totals.worked)}
              </span>
              <span className="mt-1 text-[12.5px] text-slate-400 dark:text-slate-500">
                of {durFmt(targetMs)} &middot; {Math.round(pct * 100)}%
              </span>
            </ProgressRing>
          </div>

          <div className="space-y-4">
            {(record?.site || hasGeo || late) && (
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                {record?.site && (
                  <Chip tone="slate" icon={MapPin}>
                    {record.site.name}
                  </Chip>
                )}

                {hasGeo && (
                  <Chip tone={inRange ? "emerald" : "amber"}>
                    {inRange
                      ? "Location verified"
                      : FLAG_COPY[record.flagReason] || "Flagged for review"}
                  </Chip>
                )}

                {late && (
                  <Chip tone="amber" icon={Clock}>
                    Late by {durFmt(late.minutes * MIN)}
                    {late.scheduledAt && (
                      <>
                        {" "}
                        &middot; Scheduled{" "}
                        {timeFmt(new Date(late.scheduledAt))}
                      </>
                    )}
                  </Chip>
                )}
              </div>
            )}

            {status === "break" && openBreak && (
              <p className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-[13.5px] font-medium tabular-nums text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 md:justify-start">
                <Coffee size={16} />
                {breakLabel(openBreak.type)} break &middot;{" "}
                {clockFmt(totals.openBreak)}
              </p>
            )}

            {st.live && (
              <dl className="rounded-xl border border-slate-200 px-4 py-3 text-[13px] dark:border-slate-700">
                {expectedOut && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500 dark:text-slate-400">
                      Expected clock-out
                    </dt>
                    <dd className="font-medium tabular-nums text-slate-800 dark:text-slate-100">
                      {timeFmt(expectedOut)}
                    </dd>
                  </div>
                )}
                <div
                  className={`flex items-center justify-between gap-4 ${expectedOut ? "mt-1.5" : ""}`}
                >
                  <dt className="text-slate-500 dark:text-slate-400">
                    {remainingMs > 0 ? "Time left" : "Overtime"}
                  </dt>
                  <dd className="font-medium tabular-nums text-slate-800 dark:text-slate-100">
                    {durFmt(Math.abs(remainingMs))}
                  </dd>
                </div>
              </dl>
            )}

            {status === "off" && (
              <>
                <ShiftButton
                  tone="emerald"
                  icon={LogIn}
                  label="Clock in"
                  onClick={() => onOpen("in")}
                />
                {requireLocation && (
                  <p className="text-center text-[12.5px] text-slate-400 dark:text-slate-500 md:text-left">
                    Your location is recorded when you clock in.
                  </p>
                )}
              </>
            )}

            {status === "working" && (
              <div className="grid grid-cols-2 gap-3">
                <ShiftButton
                  tone="amberSoft"
                  icon={Coffee}
                  label="Start break"
                  onClick={() => onOpen("break")}
                />
                <ShiftButton
                  tone="roseSoft"
                  icon={LogOut}
                  label="Clock out"
                  onClick={() => onOpen("out")}
                />
              </div>
            )}

            {status === "break" && (
              <div className="grid grid-cols-2 gap-3">
                <ShiftButton
                  tone="amber"
                  icon={Play}
                  label="End break"
                  onClick={() => onOpen("endBreak")}
                />
                <ShiftButton
                  tone="neutral"
                  icon={LogOut}
                  label="Clock out"
                  disabled
                  title="End your break before clocking out"
                />
              </div>
            )}

            {status === "done" && (
              <>
                <div className={`rounded-xl px-4 py-3 ${TONES.indigo}`}>
                  <p className="text-[14px] font-medium">Shift complete</p>
                  <p className="mt-0.5 text-[12.5px] opacity-80">
                    {durFmt(totals.worked)} worked, {durFmt(totals.breaks)} on
                    breaks
                    {completed?.totalPUnits != null && (
                      <> &middot; {completed.totalPUnits} hazri</>
                    )}
                    {Number(completed?.overtimeHours) > 0 && (
                      <> &middot; {completed.overtimeHours}h overtime</>
                    )}
                  </p>
                </div>
                <ShiftButton
                  tone="neutral"
                  icon={Play}
                  label="Start new shift"
                  onClick={() => onOpen("in")}
                />
              </>
            )}

            {notice && <Notice>{notice}</Notice>}
          </div>
        </div>
      )}
    </section>
  );
}