import React from "react";
import {
  IconSun,
  IconCloudRain,
  IconAlertTriangle,
  IconShieldCheck,
  IconLock,
} from "@tabler/icons-react";
import Alert from "@components/ui/Alert";
import StatusBadge from "@components/ui/StatusBadge";
import { REPORT_STATUS_CONFIG } from "@utils/dailyReport.utils";

/**
 * Header summary card for DailyReportDetailsPage showing site, status, weather, safety, and lock notice.
 */
export default function DailyReportHeaderCard({ report, isLocked }) {
  const statusCfg = REPORT_STATUS_CONFIG[report.status] || {
    label: report.status,
    tone: "slate",
  };

  return (
    <div className="rounded-2xl border border-border bg-background p-6 shadow-sm space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">
              Daily Report: {report.site?.name || report.site?.code}
            </h1>
            <StatusBadge
              label={report.status}
              tone={statusCfg.tone}
              icon={statusCfg.icon}
              size="md"
            />
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Project:{" "}
            <strong className="text-foreground font-semibold">
              {report.project?.name} ({report.project?.code})
            </strong>{" "}
            • Business Date:{" "}
            <strong className="text-foreground font-semibold font-mono">
              {new Date(report.businessDate).toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </strong>
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-300 font-medium">
              {report.weather === "CLEAR" ? (
                <IconSun size={14} className="text-amber-500" />
              ) : (
                <IconCloudRain size={14} className="text-blue-500" />
              )}
              Weather: {report.weather}
            </span>

            {Number(report.weatherStoppageHours || 0) > 0 && (
              <StatusBadge
                label={`Stoppage: ${report.weatherStoppageHours}h`}
                tone="amber"
                bordered={false}
                size="md"
              />
            )}

            {report.safetyIncidentReported ? (
              <StatusBadge
                label="Safety Incident Reported"
                tone="rose"
                icon={IconAlertTriangle}
                bordered={false}
                size="md"
              />
            ) : (
              <StatusBadge
                label="Zero Safety Incidents"
                tone="emerald"
                icon={IconShieldCheck}
                bordered={false}
                size="md"
              />
            )}
          </div>
        </div>

        <div className="text-left md:text-right text-xs text-muted-foreground font-mono">
          <span>Report UUID:</span>
          <code className="block mt-0.5 rounded bg-muted px-2 py-1 text-[11px] text-foreground">
            {report.id}
          </code>
        </div>
      </div>

      {isLocked && (
        <Alert
          type="neutral"
          variant="flat"
          size="sm"
          icon={IconLock}
          className="border border-purple-500/30 bg-purple-500/10 text-purple-800 dark:text-purple-300 rounded-xl"
          title="This Daily Report is LOCKED and Permanently Immutable"
          description={`Locked by ${report.lockedBy?.displayName || "Central Admin"} on ${
            report.lockedAt ? new Date(report.lockedAt).toLocaleString("en-IN") : "—"
          }. No further changes or headcount adjustments can be made. This is the legal record for payroll and billing.`}
        />
      )}
    </div>
  );
}
