import React from "react";
import { IconSend, IconUserCheck, IconLock } from "@tabler/icons-react";

const TONE_STYLES = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  purple: "bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
};

/**
 * 3-step sequential sign-off summary cards (Submitted -> Approved -> Locked).
 */
export default function DailyReportSignOffSteps({ report, isLocked }) {
  const steps = [
    {
      title: "1. Submitted",
      name: report.submittedBy?.displayName || "—",
      timestamp: report.submittedAt
        ? new Date(report.submittedAt).toLocaleString("en-IN")
        : "Not submitted",
      icon: IconSend,
      tone: "blue",
      highlighted: false,
    },
    {
      title: "2. Approved",
      name: report.approvedBy?.displayName || "—",
      timestamp: report.approvedAt
        ? new Date(report.approvedAt).toLocaleString("en-IN")
        : "Pending approval",
      icon: IconUserCheck,
      tone: report.approvedAt ? "emerald" : "violet",
      highlighted: false,
    },
    {
      title: "3. Locked",
      name: report.lockedBy?.displayName || (isLocked ? "Admin" : "Pending"),
      timestamp: report.lockedAt
        ? new Date(report.lockedAt).toLocaleString("en-IN")
        : "Not locked",
      icon: IconLock,
      tone: isLocked ? "purple" : "amber",
      highlighted: isLocked,
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-[15px] font-semibold text-slate-800 dark:text-white">
        Sign-off
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className={`flex items-center gap-3.5 rounded-xl border p-4 bg-white dark:bg-[#1C2536] ${
                step.highlighted
                  ? "border-purple-500/40 bg-purple-50/40 dark:bg-purple-500/10"
                  : "border-slate-200 dark:border-slate-700/60"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONE_STYLES[step.tone]}`}
              >
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                  {step.title}
                </p>
                <p className="text-[15px] font-semibold text-slate-900 dark:text-white truncate mt-0.5">
                  {step.name}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 tabular-nums truncate">
                  {step.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
