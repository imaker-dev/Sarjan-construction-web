import { isValidElement, memo } from "react";

/**
 * StatCard: one reusable stat component for dashboards.
 *
 * Props
 * - label     string            Text under/next to the value ("Income")
 * - value     string | number   "$95.3k" or 1400 (numbers are formatted: 1,400)
 * - icon      Component | Element   <Wallet /> from lucide, or a custom image/svg element
 * - variant   "soft" | "tile" | "card"            (default "soft")
 *               soft : tinted card, value + label left, icon right
 *               tile : centered tinted tile, icon on top, colored label + value
 *               card : white bordered card, icon in tinted square, optional progress bar
 * - color     "primary" | "sky" | "teal" | "amber" | "blue" | "rose" | "violet" | "gray"
 * - progress  number (0-100)   Optional. Shown on the "card" variant only
 * - onClick   function         Optional. Makes the card a focusable button
 * - className string           Optional. Extra classes (e.g. grid sizing)
 *
 * To add or change a color, edit COLORS below. It's the only place colors live.
 * (Full class names are written out so Tailwind can detect them.)
 */

const COLORS = {
  primary: {
    soft: "bg-primary-500/10",
    text: "text-primary-500",
    bar: "bg-primary-500",
    track: "bg-primary-500/20",
  },
  emerald: {
    soft: "bg-emerald-500/10",
    text: "text-emerald-500",
    bar: "bg-emerald-500",
    track: "bg-emerald-500/20",
  },
  sky: {
    soft: "bg-sky-50 dark:bg-sky-500/10",
    text: "text-sky-500 dark:text-sky-400",
    bar: "bg-sky-500",
    track: "bg-sky-100 dark:bg-sky-500/20",
  },
  teal: {
    soft: "bg-teal-50 dark:bg-teal-500/10",
    text: "text-teal-500 dark:text-teal-400",
    bar: "bg-teal-500",
    track: "bg-teal-100 dark:bg-teal-500/20",
  },
  amber: {
    soft: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-500 dark:text-amber-400",
    bar: "bg-amber-500",
    track: "bg-amber-100 dark:bg-amber-500/20",
  },
  blue: {
    soft: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-500 dark:text-blue-400",
    bar: "bg-blue-500",
    track: "bg-blue-100 dark:bg-blue-500/20",
  },
  rose: {
    soft: "bg-rose-50 dark:bg-rose-500/10",
    text: "text-rose-500 dark:text-rose-400",
    bar: "bg-rose-500",
    track: "bg-rose-100 dark:bg-rose-500/20",
  },
  violet: {
    soft: "bg-violet-50 dark:bg-violet-500/10",
    text: "text-violet-500 dark:text-violet-400",
    bar: "bg-violet-500",
    track: "bg-violet-100 dark:bg-violet-500/20",
  },
  indigo: {
    soft: "bg-indigo-50 dark:bg-indigo-500/10",
    text: "text-indigo-500 dark:text-indigo-400",
    bar: "bg-indigo-500",
    track: "bg-indigo-100 dark:bg-indigo-500/20",
  },
  cyan: {
    soft: "bg-cyan-50 dark:bg-cyan-500/10",
    text: "text-cyan-500 dark:text-cyan-400",
    bar: "bg-cyan-500",
    track: "bg-cyan-100 dark:bg-cyan-500/20",
  },
  gray: {
    soft: "bg-gray-100 dark:bg-gray-500/10",
    text: "text-gray-500 dark:text-gray-400",
    bar: "bg-gray-500",
    track: "bg-gray-200 dark:bg-gray-500/20",
  },
};

const formatValue = (v) => (typeof v === "number" ? v.toLocaleString() : v);

const clamp = (n) => Math.min(100, Math.max(0, Number(n) || 0));

// Accepts a component (<Icon className="..." />) or a ready element (<img />, <Svg />)
const renderIcon = (icon, sizeClass) => {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  const Icon = icon;
  return <Icon className={sizeClass} aria-hidden="true" />;
};

const StatCard = ({
  label,
  value,
  icon,
  variant = "soft",
  color = "primary",
  progress,
  onClick,
  className = "",
}) => {
  const c = COLORS[color] ?? COLORS.primary;
  const Tag = onClick ? "button" : "div";

  const root = [
    "w-full rounded-xl text-left",
    onClick
      ? "cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const rootProps = onClick ? { onClick, type: "button" } : {};

  // ---------- tile: centered, icon on top ----------
  if (variant === "tile") {
    return (
      <Tag {...rootProps} className={`${root} ${c.soft} flex flex-col items-center gap-2 px-4 py-6 text-center`}>
        {icon && (
          <span className={`flex h-12 w-12 items-center justify-center ${c.text}`}>
            {renderIcon(icon, "h-9 w-9")}
          </span>
        )}
        <span className="mt-1 flex flex-col items-center">
          <span className={`text-sm font-medium ${c.text}`}>{label}</span>
          <span className={`text-2xl font-semibold leading-tight ${c.text}`}>
            {formatValue(value)}
          </span>
        </span>
      </Tag>
    );
  }

  // ---------- card: white card, icon box, optional progress ----------
  if (variant === "card") {
    const pct = clamp(progress);
    return (
      <Tag
        {...rootProps}
        className={`${root} border border-gray-100 bg-white px-5 py-5 shadow-sm dark:border-gray-700 dark:bg-gray-800`}
      >
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="block truncate text-2xl font-semibold text-gray-800 dark:text-gray-100">
              {formatValue(value)}
            </span>
            <span className="block truncate text-sm text-gray-600 dark:text-gray-400">
              {label}
            </span>
          </span>
          {icon && (
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.soft} ${c.text}`}
            >
              {renderIcon(icon, "h-5 w-5")}
            </span>
          )}
        </span>

        {progress !== undefined && (
          <span
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            className={`mt-4 block h-1.5 w-full overflow-hidden rounded-full ${c.track}`}
          >
            <span
              className={`block h-full rounded-full ${c.bar}`}
              style={{ width: `${pct}%` }}
            />
          </span>
        )}
      </Tag>
    );
  }

  // ---------- soft (default): tinted card, icon right ----------
  return (
    <Tag {...rootProps} className={`${root} ${c.soft} flex items-center justify-between gap-3 px-5 py-4`}>
      <span className="min-w-0">
        <span className="block truncate text-2xl font-semibold text-gray-800 dark:text-gray-100">
          {formatValue(value)}
        </span>
        <span className="block truncate text-sm text-gray-600 dark:text-gray-400">
          {label}
        </span>
      </span>
      {icon && (
        <span className={`shrink-0 ${c.text}`}>{renderIcon(icon, "h-6 w-6")}</span>
      )}
    </Tag>
  );
};

export default memo(StatCard);