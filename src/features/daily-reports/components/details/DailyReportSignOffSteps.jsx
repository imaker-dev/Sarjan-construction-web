import React from "react";

/**
 * 3-step sequential sign-off summary card (Prepared -> Approved -> Locked).
 */
export default function DailyReportSignOffSteps({ report, isLocked }) {
  const steps = [
    {
      title: "1. Prepared (Supervisor)",
      name: report.submittedBy?.displayName || "—",
      timestamp: report.submittedAt
        ? new Date(report.submittedAt).toLocaleString("en-IN")
        : "Not submitted yet",
      highlighted: false,
    },
    {
      title: "2. Approved (Project Manager)",
      name: report.approvedBy?.displayName || "—",
      timestamp: report.approvedAt
        ? new Date(report.approvedAt).toLocaleString("en-IN")
        : "Pending PM Approval",
      highlighted: false,
    },
    {
      title: "3. Locked (HO Admin / Finance)",
      name: report.lockedBy?.displayName || (isLocked ? "Central Admin" : "Pending Final Lock"),
      timestamp: report.lockedAt
        ? new Date(report.lockedAt).toLocaleString("en-IN")
        : "Not locked",
      highlighted: isLocked,
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Sign-off Steps
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
        {steps.map((step) => (
          <div
            key={step.title}
            className={`rounded-lg border p-3 ${
              step.highlighted
                ? "border-purple-500/30 bg-purple-500/5"
                : "border-border bg-muted/20"
            }`}
          >
            <span className="text-[11px] text-muted-foreground font-medium uppercase">
              {step.title}
            </span>
            <p className="font-semibold text-foreground mt-1">{step.name}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{step.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
