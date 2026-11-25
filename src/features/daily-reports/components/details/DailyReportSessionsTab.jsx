import React, { useMemo } from "react";
import { IconClock, IconPencil, IconRefresh } from "@tabler/icons-react";
import DataTable from "@components/ui/DataTable";
import StatusBadge from "@components/ui/StatusBadge";
import { formatTimeStr, SESSION_STATUS_CONFIG } from "@utils/dailyReport.utils";

/**
 * Individual worker attendance session logs tab powered by DataTable.
 */
export default function DailyReportSessionsTab({
  dailySessions,
  businessDate,
  isFetchingMusterRoll,
  isLocked,
  onRefresh,
  onRegularize,
}) {
  const columns = useMemo(
    () => [
      {
        key: "employee",
        header: "Employee",
        render: (s) => {
          const empName = s.employee?.displayName || "—";
          const empCode = s.employee?.employeeCode || "—";
          const deptName = s.employee?.memberships?.find((m) => m.isPrimary)?.department?.name;

          return (
            <div className="whitespace-nowrap">
              <span className="font-semibold text-foreground block text-xs">{empName}</span>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                <span className="font-mono">{empCode}</span>
                {deptName && (
                  <>
                    <span>•</span>
                    <span>{deptName}</span>
                  </>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: "timings",
        header: "Shift Timings",
        render: (s) => {
          const inTime = s.punchInAt ? formatTimeStr(s.punchInAt) : null;
          const outTime = s.punchOutAt ? formatTimeStr(s.punchOutAt) : null;

          return (
            <div>
              {inTime ? (
                <span className="font-medium text-foreground block tabular-nums text-xs">
                  {inTime} {outTime ? `– ${outTime}` : "– Working"}
                </span>
              ) : (
                <span className="text-muted-foreground italic text-xs">No punch recorded</span>
              )}
              {s.netDurationMins ? (
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  Net: {Math.floor(s.netDurationMins / 60)}h {s.netDurationMins % 60}m
                </span>
              ) : null}
            </div>
          );
        },
      },
      {
        key: "presentUnits",
        header: "Hazri Units",
        render: (s) => (
          <span className="font-bold text-primary-600 dark:text-primary-400 tabular-nums text-xs">
            {s.presentUnits ?? "1.0"}
          </span>
        ),
      },
      {
        key: "overtimeHours",
        header: "Overtime",
        render: (s) =>
          Number(s.overtimeHours || 0) > 0 ? (
            <span className="font-mono text-amber-600 font-semibold text-xs">
              +{s.overtimeHours}h
            </span>
          ) : (
            <span className="font-mono text-muted-foreground text-xs">—</span>
          ),
      },
      {
        key: "status",
        header: "Status",
        render: (s) => {
          const key =
            s.status === "AUTO_CLOSED"
              ? "AUTO_CLOSED"
              : s.status === "IN_PROGRESS"
                ? "IN_PROGRESS"
                : s.isRegularized
                  ? "REGULARIZED"
                  : "COMPLETED";
          const cfg = SESSION_STATUS_CONFIG[key];
          return (
            <StatusBadge
              label={cfg.label}
              tone={cfg.tone}
              icon={cfg.icon}
              dot={cfg.dot}
              size="xs"
            />
          );
        },
      },
    ],
    []
  );

  const actions = useMemo(() => {
    if (isLocked) return [];
    return [
      {
        label: "Regularize",
        icon: IconPencil,
        onClick: (s) => onRegularize(s),
      },
    ];
  }, [isLocked, onRegularize]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-background overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Individual Worker Attendance Sessions
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Raw punches recorded on site. Missing departures can be regularized before final lock.
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="btn btn-outline btn-xs inline-flex items-center gap-1.5"
            disabled={isFetchingMusterRoll}
          >
            <IconRefresh
              size={13}
              className={isFetchingMusterRoll ? "animate-spin" : ""}
            />
            <span>Refresh Logs</span>
          </button>
        </div>

        <DataTable
          columns={columns}
          data={dailySessions}
          actions={actions}
          loading={isFetchingMusterRoll && dailySessions.length === 0}
          empty={{
            icon: IconClock,
            title: "No Attendance Punches",
            description: `No worker attendance punches found for this site on ${businessDate}.`,
          }}
        />
      </div>
    </div>
  );
}
