import React, { forwardRef } from "react";
import { CircleAlert, TriangleAlert, CircleCheck, Info, X } from "lucide-react";

/**
 * @typedef {Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "className">} NativeDivProps
 */

/**
 * @typedef {Object} AlertOwnProps
 * @property {"success" | "error" | "warning" | "info" | "neutral"} [type] Style + default icon. Default: `"info"`
 * @property {"card" | "flat"} [variant] `"card"`: panel with icon chip, `"flat"`: compact strip. Default: `"card"`
 * @property {"sm" | "md" | "lg"} [size] Size preset. Default: `"md"`
 * @property {React.ReactNode} [title] Heading.
 * @property {React.ReactNode} [description] Supporting text.
 * @property {React.ElementType | React.ReactElement} [icon] Custom icon: component (`icon={Bell}`) or element (`icon={<Bell />}`).
 * @property {number} [iconSize] Icon size in px (overrides the size preset).
 * @property {React.ReactNode} [action] Buttons / links shown under the text.
 * @property {() => void} [onClose] Shows a dismiss button when provided.
 * @property {string} [dismissLabel] Accessible label for the dismiss button. Default: `"Dismiss"`
 * @property {"alert" | "status" | "none"} [role] ARIA role. Default: `"alert"` for error/warning, otherwise `"status"`.
 * @property {string} [className] Extra classes for the outer element.
 */

/** @typedef {AlertOwnProps & NativeDivProps} AlertProps */

/* ------------------------------------------------------------------
   Type config (full class names so Tailwind v3+ can detect them)
   - bg:   pastel surface (translucent tint in dark mode)
   - icon: color of the filled default icon
------------------------------------------------------------------- */
const TYPES = {
  success: {
    Icon: CircleCheck,
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    icon: "text-emerald-500 dark:text-emerald-400",
  },
  error: {
    Icon: TriangleAlert,
    bg: "bg-red-50 dark:bg-red-500/10",
    icon: "text-red-500 dark:text-red-400",
  },
  warning: {
    Icon: CircleAlert,
    bg: "bg-amber-50 dark:bg-amber-500/10",
    icon: "text-amber-500 dark:text-amber-400",
  },
  info: {
    Icon: Info,
    bg: "bg-sky-50 dark:bg-sky-500/10",
    icon: "text-sky-500 dark:text-sky-400",
  },
  neutral: {
    Icon: Info,
    bg: "bg-slate-100 dark:bg-white/5",
    icon: "text-slate-500 dark:text-slate-400",
  },
};

/* ------------------------------------------------------------------
   Size presets
   card = rounded panel with a white icon chip
   flat = compact strip with the icon directly on the tint
------------------------------------------------------------------- */
const SIZES = {
  sm: {
    cardBox: "gap-3 p-3 rounded-xl",
    chip: "h-9 w-9",
    cardIcon: 18,
    flatBox: "gap-2.5 px-3 py-2.5 rounded-md",
    flatIcon: 16,
    flatIconPad: "mt-0.5",
    title: "text-[13px] leading-5",
    description: "text-xs leading-5",
  },
  md: {
    cardBox: "gap-4 p-4 rounded-2xl",
    chip: "h-12 w-12",
    cardIcon: 22,
    flatBox: "gap-3 px-3.5 py-3 rounded-lg",
    flatIcon: 20,
    flatIconPad: "",
    title: "text-[15px] leading-5",
    description: "text-sm leading-5",
  },
  lg: {
    cardBox: "gap-5 p-5 rounded-2xl",
    chip: "h-14 w-14",
    cardIcon: 26,
    flatBox: "gap-3.5 px-4 py-3.5 rounded-lg",
    flatIcon: 24,
    flatIconPad: "",
    title: "text-base leading-6",
    description: "text-[15px] leading-6",
  },
};

/**
 * Alert
 *
 * @type {React.ForwardRefExoticComponent<
 *   AlertProps & React.RefAttributes<HTMLDivElement>
 * >}
 */
const Alert = forwardRef(function Alert(
  {
    type = "info",
    variant = "card",
    size = "md",
    title,
    description,
    icon,
    iconSize,
    action,
    onClose,
    dismissLabel = "Dismiss",
    role,
    className = "",
    ...rest
  },
  ref
) {
  const t = TYPES[type] ?? TYPES.info;
  const s = SIZES[size] ?? SIZES.md;
  const isCard = variant !== "flat";
  const px = iconSize ?? (isCard ? s.cardIcon : s.flatIcon);

  const resolvedRole =
    role ?? (type === "error" || type === "warning" ? "alert" : "status");
  const ariaRole = resolvedRole === "none" ? undefined : resolvedRole;

  const alignTop = !isCard || Boolean(action);

  let iconNode;
  if (icon) {
    // Custom icon: stroke-only, tinted with the type color
    iconNode = React.isValidElement(icon)
      ? React.cloneElement(icon, {
          size: px,
          strokeWidth: 2,
          "aria-hidden": true,
          ...icon.props,
        })
      : React.createElement(icon, {
          size: px,
          strokeWidth: 2,
          "aria-hidden": true,
        });
  } else {
    // Default icon: solid shape with a contrasting glyph
    const DefaultIcon = t.Icon;
    iconNode = (
      <DefaultIcon
        size={px}
        strokeWidth={2}
        className="fill-current stroke-white dark:stroke-slate-900"
        aria-hidden="true"
      />
    );
  }

  const surface = isCard
    ? `${s.cardBox} ${
        alignTop ? "items-start" : "items-center"
      } border-2 border-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-white/10 dark:shadow-none`
    : `${s.flatBox} items-start`;

  return (
    <div
      {...rest}
      ref={ref}
      role={ariaRole}
      className={`flex w-full ${surface} ${t.bg} ${className}`}
    >
      {/* Icon */}
      {isCard ? (
        <span
          className={`flex shrink-0 items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)] dark:bg-white/10 dark:shadow-none ${s.chip} ${t.icon}`}
        >
          {iconNode}
        </span>
      ) : (
        <span className={`shrink-0 ${s.flatIconPad} ${t.icon}`}>
          {iconNode}
        </span>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        {title && (
          <div
            className={`break-words text-slate-900 dark:text-slate-50 ${s.title} ${
              isCard ? "font-semibold" : "font-medium"
            }`}
          >
            {title}
          </div>
        )}
        {description && (
          <div
            className={`break-words text-slate-600 dark:text-slate-400 ${
              title ? "mt-1" : ""
            } ${s.description}`}
          >
            {description}
          </div>
        )}
        {action && (
          <div className="mt-3 flex flex-wrap items-center gap-2">{action}</div>
        )}
      </div>

      {/* Dismiss */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={dismissLabel}
          className={`-m-1 shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-900/5 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-300 ${
            alignTop ? "self-start" : "self-center"
          }`}
        >
          <X size={isCard ? 18 : 16} strokeWidth={1.75} aria-hidden="true" />
        </button>
      )}
    </div>
  );
});

export default Alert;