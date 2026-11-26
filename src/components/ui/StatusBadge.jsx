import React from "react";

const TONE_CLASSES = {
  emerald: {
    pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    border: "border border-emerald-200 dark:border-emerald-800/40",
    dot: "bg-emerald-500",
  },
  amber: {
    pill: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    border: "border border-amber-200 dark:border-amber-800/40",
    dot: "bg-amber-500",
  },
  blue: {
    pill: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    border: "border border-blue-200 dark:border-blue-800/40",
    dot: "bg-blue-500",
  },
  indigo: {
    pill: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
    border: "border border-indigo-200 dark:border-indigo-800/40",
    dot: "bg-indigo-500",
  },
  rose: {
    pill: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    border: "border border-rose-200 dark:border-rose-800/40",
    dot: "bg-rose-500",
  },
  purple: {
    pill: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
    border: "border border-purple-200 dark:border-purple-800/40",
    dot: "bg-purple-500",
  },
  slate: {
    pill: "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300",
    border: "border border-slate-200 dark:border-slate-700",
    dot: "bg-slate-400",
  },
};

const SIZE_CLASSES = {
  xs: { pill: "px-2 py-0.5 text-[10px] gap-1", icon: 11 },
  sm: { pill: "px-2 py-0.5 text-[11px] gap-1", icon: 12 },
  md: { pill: "px-2.5 py-1 text-xs gap-1.5", icon: 13 },
};

export const STATUS_TONES = {
  ACTIVE: "emerald",
  APPROVED: "emerald",
  CERTIFIED: "emerald",
  COMPLETED: "emerald",
  PAID: "emerald",
  PENDING: "amber",
  SUBMITTED: "amber",
  SUSPENDED: "amber",
  REJECTED: "rose",
  EXITED: "rose",
  INACTIVE: "rose",
  LOCKED: "purple",
  CANCELLED: "slate",
  DRAFT: "slate",
};

/**
 * Maps common domain status strings to a `StatusBadge` tone.
 */
export const getStatusTone = (status, fallback = "slate") => {
  if (!status) return fallback;
  return STATUS_TONES[String(status).toUpperCase()] || fallback;
};

/**
 * Reusable status/category pill following the project's soft translucent TONES palette.
 */
export default function StatusBadge({
  label,
  tone = "slate",
  icon: Icon,
  dot = false,
  size = "sm",
  bordered = true,
  className = "",
}) {
  const palette = TONE_CLASSES[tone] || TONE_CLASSES.slate;
  const sizing = SIZE_CLASSES[size] || SIZE_CLASSES.sm;

  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold whitespace-nowrap ${sizing.pill} ${palette.pill} ${
        bordered ? palette.border : ""
      } ${className}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${palette.dot}`} />
      )}
      {Icon && <Icon size={sizing.icon} className="shrink-0" />}
      <span>{label}</span>
    </span>
  );
}
