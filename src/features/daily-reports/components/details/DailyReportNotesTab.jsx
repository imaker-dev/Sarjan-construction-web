import React from "react";
import { IconShieldCheck } from "@tabler/icons-react";

/**
 * Site work progress, obstacles, and safety notes tab.
 */
export default function DailyReportNotesTab({ report }) {
  const noteCards = [
    {
      title: "Work Progress Notes",
      content: report.workProgressNotes || "No progress notes recorded for this report.",
      fullWidth: false,
    },
    {
      title: "Site Obstacles & Impediments",
      content: report.siteObstaclesRemarks || "No site obstacles reported.",
      fullWidth: false,
    },
    {
      title: "Safety Notes & Toolbox Talk (TVT)",
      content: report.safetyNotes || "No safety or TVT notes recorded.",
      icon: IconShieldCheck,
      fullWidth: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {noteCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`rounded-xl border border-border bg-background p-5 shadow-sm space-y-2 ${
              card.fullWidth ? "md:col-span-2" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              {Icon && <Icon size={18} className="text-emerald-500" />}
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {card.title}
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {card.content}
            </p>
          </div>
        );
      })}
    </div>
  );
}
