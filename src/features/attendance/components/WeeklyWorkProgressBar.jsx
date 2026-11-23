import React from "react";
import {
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconTrendingUp,
  IconFlame,
  IconHourglassHigh,
} from "@tabler/icons-react";

const STATUS_CONFIG = {
  COMPLETED: {
    label: "Target Completed",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40",
    bar: "bg-emerald-500",
    icon: IconCheck,
    description: "48-hour weekly target fulfilled! Excellent progress.",
  },
  ON_TRACK: {
    label: "On Track",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border-blue-200 dark:border-blue-800/40",
    bar: "bg-blue-500",
    icon: IconTrendingUp,
    description: "Maintaining solid daily shift hours to hit the 48-hour weekly mark.",
  },
  BEHIND: {
    label: "Behind Pace",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-200 dark:border-amber-800/40",
    bar: "bg-amber-500",
    icon: IconClock,
    description: "Slight deficit in weekly shift hours. Increase pace over remaining days.",
  },
  DEFICIT_PENDING: {
    label: "Deficit Pending",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border-rose-200 dark:border-rose-800/40",
    bar: "bg-rose-500",
    icon: IconAlertTriangle,
    description: "Final work day with deficit hours. Extended shift needed to achieve target.",
  },
};

const TONES = {
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
  rose: "bg-rose-50 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400",
  indigo: "bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-400",
  slate: "bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400",
};

export default function WeeklyWorkProgressBar({
  data,
  title = "Weekly data",
  mode = "card", // "card" | "compact"
  className = "",
}) {
  if (!data) return null;

  const targetWeeklyHours = Number(data.targetWeeklyHours ?? 48.0);
  const completedWeeklyHours = Number(data.completedWeeklyHours ?? data.weeklyHoursWorked ?? 0);
  const remainingWeeklyHours = Number(
    data.remainingWeeklyHours ?? Math.max(0, targetWeeklyHours - completedWeeklyHours)
  );
  const isTargetCompleted = Boolean(
    data.isTargetCompleted || completedWeeklyHours >= targetWeeklyHours
  );
  const progressPercentage = Number(
    data.progressPercentage ??
    (targetWeeklyHours > 0 ? (completedWeeklyHours / targetWeeklyHours) * 100 : 0)
  );
  const remainingWorkDaysInWeek = Number(data.remainingWorkDaysInWeek ?? 0);
  const isLastWorkingDay = Boolean(data.isLastWorkingDay);
  const requiredHoursToCompleteTarget = Number(data.requiredHoursToCompleteTarget ?? 0);
  const status = data.status || (isTargetCompleted ? "COMPLETED" : "ON_TRACK");
  const weekStartDate = data.weekStartDate;
  const weekEndDate = data.weekEndDate;

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ON_TRACK;
  const StatusIcon = cfg.icon;
  const safePercentage = Math.min(Math.max(Number(progressPercentage || 0), 0), 100);

  // Compact Mode (For Table Cells / Lists)
  if (mode === "compact") {
    const formattedCompleted =
      completedWeeklyHours % 1 === 0
        ? completedWeeklyHours
        : completedWeeklyHours.toFixed(1);
    const formattedRemaining =
      remainingWeeklyHours % 1 === 0
        ? remainingWeeklyHours
        : remainingWeeklyHours.toFixed(1);

    return (
      <div className={`space-y-1.5 min-w-[170px] ${className}`}>
        <div className="flex items-center justify-between text-[11px] font-medium">
          <span className="text-slate-800 dark:text-slate-200 tabular-nums font-semibold">
            {formattedCompleted}h / {targetWeeklyHours}h
          </span>
          <span
            className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold border ${cfg.badge}`}
          >
            {safePercentage.toFixed(0)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
            style={{ width: `${safePercentage}%` }}
          />
        </div>

        {/* Status and Deficit indicator */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="capitalize text-slate-500 dark:text-slate-400">
            {status.replace(/_/g, " ").toLowerCase()}
          </span>
          {isTargetCompleted ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Goal Met</span>
          ) : remainingWeeklyHours > 0 ? (
            <span className="tabular-nums font-medium text-slate-500 dark:text-slate-400">
              {formattedRemaining}h left
            </span>
          ) : (
            <span className="text-slate-400">In progress</span>
          )}
        </div>
      </div>
    );
  }

  // Full Card Mode (Matching Activity Log design language)
  const formattedWeek = (() => {
    if (!weekStartDate || !weekEndDate) return "Current Work Week";
    const start = new Date(weekStartDate);
    const end = new Date(weekEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "Current Work Week";
    return `${start.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    })} – ${end.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    })}`;
  })();

  const items = [
    {
      id: "worked",
      title: "Hours worked",
      value: `${completedWeeklyHours}h`,
      icon: IconClock,
      tone: "emerald",
      lines: [
        { text: "Recorded across this work week", tone: "text-slate-400 dark:text-slate-500" },
        ...(isTargetCompleted
          ? [{ text: "48-hour target fulfilled! Excellent progress.", tone: "text-emerald-600 dark:text-emerald-400 font-medium" }]
          : []),
      ],
    },
    {
      id: "deficit",
      title: "Weekly Hours Left",
      value: `${remainingWeeklyHours}h`,
      icon: isTargetCompleted ? IconCheck : IconHourglassHigh,
      tone: isTargetCompleted ? "emerald" : remainingWeeklyHours > 0 ? "amber" : "emerald",
      lines: isTargetCompleted
        ? [{ text: "Weekly commitment fulfilled", tone: "text-emerald-600 dark:text-emerald-400 font-medium" }]
        : [
          { text: `Target: ${targetWeeklyHours}h Weekly`, tone: "text-slate-400 dark:text-slate-500" },
          remainingWeeklyHours > 0 && {
            text: `Remaining: ${remainingWeeklyHours}h remaining`,
            tone: "text-amber-500 dark:text-amber-400 font-medium",
          },
        ].filter(Boolean),
    },
    {
      id: "pace",
      title: isLastWorkingDay ? "Final day requirement" : "Daily pace needed",
      value: `${Number(requiredHoursToCompleteTarget || 0).toFixed(1)}h / day`,
      icon: isLastWorkingDay ? IconFlame : IconTrendingUp,
      tone: isLastWorkingDay && !isTargetCompleted ? "rose" : "indigo",
      lines: [
        {
          text: `${remainingWorkDaysInWeek} ${remainingWorkDaysInWeek === 1 ? "work day" : "work days"} remaining`,
          tone: "text-slate-400 dark:text-slate-500",
        },
        isLastWorkingDay && !isTargetCompleted && {
          text: `Final day: ${requiredHoursToCompleteTarget}h shift needed today`,
          tone: "text-rose-500 dark:text-rose-400 font-medium",
        },
      ].filter(Boolean),
    },
  ];

  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1C2536] flex flex-col ${className}`}
    >
      {/* Header — identical layout and typography to Activity Log */}
      <header className="border-b border-slate-100 px-5 py-4 dark:border-slate-700 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-slate-800 dark:text-white">
              {title}
            </h3>
            <p className="mt-0.5 text-[12.5px] text-slate-400 dark:text-slate-500">
              48-hour Head Office weekly commitment
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border ${cfg.badge}`}
          >
            <StatusIcon size={14} />
            {cfg.label}
          </span>
        </div>
      </header>

      {/* Date subheader bar — matching "Today · 1 event" */}
      <div className="flex items-center justify-between border-b border-slate-100/60 bg-white/90 px-5 py-3 backdrop-blur dark:border-slate-700/60 dark:bg-[#1C2536]/90 sm:px-6">
        <p className="text-[12.5px] font-semibold text-slate-500 dark:text-slate-400">
          {formattedWeek}
        </p>
        <span className="text-[12px] tabular-nums text-slate-400 dark:text-slate-500">
          {remainingWorkDaysInWeek} {remainingWorkDaysInWeek === 1 ? "day remaining" : "days remaining"}
        </span>
      </div>

      {/* Item rows with timeline connector and circular tone icons */}
      <div className="px-5 py-4 sm:px-6">
        <ol className="space-y-0">
          {items.map((item, index) => {
            const ItemIcon = item.icon;
            const isLast = index === items.length - 1;

            return (
              <li key={item.id} className="relative flex gap-3.5 pb-5 last:pb-0">
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-4 top-9 w-px -translate-x-1/2 bg-slate-100 dark:bg-slate-700/70"
                  />
                )}
                <span
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONES[item.tone]}`}
                >
                  <ItemIcon size={15} strokeWidth={2.25} />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">
                      {item.title}
                    </p>
                    <span className="shrink-0 text-[12.5px] font-bold tabular-nums text-slate-700 dark:text-slate-200">
                      {item.value}
                    </span>
                  </div>
                  {item.lines.map((l, i) => (
                    <p key={i} className={`mt-0.5 text-[12.5px] ${l.tone}`}>
                      {l.text}
                    </p>
                  ))}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
