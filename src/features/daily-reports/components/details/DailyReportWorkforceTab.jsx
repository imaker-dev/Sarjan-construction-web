import React, { useMemo } from "react";
import { IconPencil, IconUsers } from "@tabler/icons-react";
import DataTable from "@components/ui/DataTable";
import StatusBadge from "@components/ui/StatusBadge";
import { LABOUR_CATEGORY_CONFIG } from "@utils/dailyReport.utils";

/**
 * Workforce & Headcount breakdown tab powered by the shared DataTable.
 */
export default function DailyReportWorkforceTab({
  labourSummaries,
  isLocked,
  onAdjustItem,
}) {
  const columns = useMemo(
    () => [
      {
        key: "category",
        header: "Type",
        render: (item) => {
          const cfg = LABOUR_CATEGORY_CONFIG[item.category] || {
            label: item.category,
            tone: "slate",
          };
          return <StatusBadge label={cfg.label} tone={cfg.tone} size="xs" />;
        },
      },
      {
        key: "tradeCategory",
        header: "Trade / Contractor",
        render: (item) => (
          <div>
            <span className="font-semibold text-foreground block text-xs">
              {item.tradeCategory}
            </span>
            {item.subcontractorName && (
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                {item.subcontractorName}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "headcount",
        header: "Workers",
        render: (item) => (
          <span className="font-semibold text-foreground tabular-nums text-xs">
            {item.headcount}
          </span>
        ),
      },
      {
        key: "presentUnits",
        header: "Hazri",
        render: (item) => (
          <span className="font-bold text-primary-600 dark:text-primary-400 tabular-nums text-xs">
            {item.presentUnits}
          </span>
        ),
      },
      {
        key: "overtimeHours",
        header: "Overtime",
        render: (item) =>
          Number(item.overtimeHours || 0) > 0 ? (
            <span className="font-mono text-amber-600 font-semibold text-xs">
              {item.overtimeHours}h
            </span>
          ) : (
            <span className="font-mono text-muted-foreground text-xs">—</span>
          ),
      },
      {
        key: "remarks",
        header: "Notes",
        render: (item) => (
          <span className="text-muted-foreground text-xs max-w-xs truncate block">
            {item.remarks || "—"}
          </span>
        ),
      },
    ],
    []
  );

  const actions = useMemo(() => {
    if (isLocked) return [];
    return [
      {
        label: "Edit",
        icon: IconPencil,
        onClick: (item) => onAdjustItem(item),
      },
    ];
  }, [isLocked, onAdjustItem]);

  return (
    <DataTable
      title="Workforce"
      headerExtra={
        !isLocked ? (
          <span className="text-[11px] text-muted-foreground">
            Editable until locked
          </span>
        ) : null
      }
      columns={columns}
      data={labourSummaries}
      actions={actions}
      empty={{
        icon: IconUsers,
        title: "No workforce entries",
        description: "No workers recorded for this day.",
      }}
    />
  );
}
