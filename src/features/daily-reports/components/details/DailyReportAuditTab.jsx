import React from "react";
import { IconRefresh } from "@tabler/icons-react";

/**
 * Tamper-evident chronological audit history tab.
 */
export default function DailyReportAuditTab({
  auditLogs,
  isLoadingAuditTrail,
  onRefresh,
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Tamper-Evident Chronological History
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Immutable log of all calculations, submissions, approvals, adjustments, and payroll locking.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="btn btn-outline btn-xs"
          disabled={isLoadingAuditTrail}
        >
          <IconRefresh size={13} className={isLoadingAuditTrail ? "animate-spin" : ""} />
          <span>Refresh Trail</span>
        </button>
      </div>

      {auditLogs.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted-foreground">
          No audit logs recorded for this report.
        </p>
      ) : (
        <div className="space-y-4 pt-2">
          {auditLogs.map((log, index) => (
            <div key={log.id || index} className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 font-mono text-[10px] font-bold">
                {index + 1}
              </div>
              <div className="flex-1 rounded-lg border border-border p-3 bg-muted/20 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">{log.action}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString("en-IN") : "—"}
                  </span>
                </div>

                <div className="text-[11px] text-muted-foreground">
                  Actor:{" "}
                  <code className="font-mono text-foreground font-semibold">{log.actorId}</code>
                  {log.oldValue && log.newValue && (
                    <span>
                      {" "}
                      • Transitioned from{" "}
                      <span className="font-mono text-foreground">{log.oldValue}</span> to{" "}
                      <span className="font-mono text-foreground font-bold">{log.newValue}</span>
                    </span>
                  )}
                </div>

                {log.reason && (
                  <p className="text-xs text-foreground bg-background rounded p-2 border border-border mt-1">
                    Reason: {log.reason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
