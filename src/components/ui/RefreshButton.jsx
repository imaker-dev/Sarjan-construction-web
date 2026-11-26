import React from "react";
import { IconRefresh } from "@tabler/icons-react";

/**
 * Reusable refresh button supporting compact icon-only mode (for panel headers)
 * or labeled button mode (`label` prop).
 */
export default function RefreshButton({
  onClick,
  loading = false,
  label,
  title = "Refresh",
  className = "",
}) {
  if (label) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={`btn btn-outline btn-xs inline-flex items-center gap-1 ${className}`.trim()}
      >
        <IconRefresh size={14} className={loading ? "animate-spin" : ""} />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title={title}
      aria-label={title}
      className={`p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 ${className}`.trim()}
    >
      <IconRefresh size={16} className={loading ? "animate-spin" : ""} />
    </button>
  );
}
