import { cloneElement, isValidElement } from "react";

/**
 * EmptyState – reusable "no data found" fallback.
 *
 * Props
 * - icon         Component (e.g. lucide's `Inbox`) OR an element (<Inbox />). Optional.
 * - title        string | node
 * - description  string | node
 * - size         "sm" | "md" | "lg"  (default "md")
 * - className    extra classes for the root element
 * - children     optional slot for actions (buttons / links)
 *
 * Usage
 *   import { SearchX } from "lucide-react";
 *
 *   <EmptyState
 *     icon={SearchX}
 *     title="No results found"
 *     description="Try adjusting your search or filters to find what you're looking for."
 *     size="lg"
 *     className="min-h-[420px]"
 *   >
 *     <button className="...">Clear filters</button>
 *   </EmptyState>
 *
 * Tip: if you already use `clsx` / `tailwind-merge`, swap `cx` below for your `cn` helper.
 */

const cx = (...parts) => parts.filter(Boolean).join(" ");

const SIZES = {
  sm: {
    root: "px-4 pb-4",
    tilePx: 44,
    gapPx: 16,
    tile: "h-11 w-11 rounded-xl",
    icon: "h-5 w-5",
    rings: [80, 112],
    title: "text-sm",
    desc: "text-xs leading-5",
    max: "max-w-xs",
    actions: "mt-4",
  },
  md: {
    root: "px-6 pb-6",
    tilePx: 64,
    gapPx: 24,
    tile: "h-16 w-16 rounded-[18px]",
    icon: "h-7 w-7",
    rings: [108, 148, 188],
    title: "text-base",
    desc: "text-sm leading-6",
    max: "max-w-sm",
    actions: "mt-6",
  },
  lg: {
    root: "px-8 pb-8",
    tilePx: 76,
    gapPx: 28,
    tile: "h-[76px] w-[76px] rounded-[22px]",
    icon: "h-8 w-8",
    rings: [128, 176, 224, 272],
    title: "text-lg",
    desc: "text-base leading-7",
    max: "max-w-md",
    actions: "mt-7",
  },
};

/* Default icon (inline, so the component has zero dependencies) */
const DefaultIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

function renderIcon(icon, className) {
  if (!icon) return <DefaultIcon className={className} />;

  // <Inbox /> style element
  if (isValidElement(icon)) {
    return cloneElement(icon, {
      className: cx(className, icon.props.className),
      "aria-hidden": true,
    });
  }

  // Inbox style component (function, memo or forwardRef)
  const Icon = icon;
  return <Icon className={className} aria-hidden="true" />;
}

export default function EmptyState({
  icon,
  title = "No data found",
  description = "There's nothing to show here yet.",
  size = "md",
  className = "",
  children,
}) {
  const s = SIZES[size] ?? SIZES.md;
  const ringArea = s.rings[s.rings.length - 1];

  return (
    <div
      role="status"
      className={cx(
        "relative flex w-full flex-col items-center justify-center overflow-x-clip text-center",
        s.root,
        className
      )}
    >
      {/* Illustration */}
      <div
        className="relative flex shrink-0 items-center justify-center"
        style={{ width: ringArea, height: s.tilePx }}
      >
        {/* Concentric rings, faded outwards */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,black,transparent)] [-webkit-mask-image:radial-gradient(closest-side,black,transparent)]"
          style={{ width: ringArea, height: ringArea }}
        >
          {s.rings.map((px) => (
            <span
              key={px}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 dark:border-white/10"
              style={{ width: px, height: px }}
            />
          ))}
        </div>

        {/* Soft accent glow */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/20 blur-2xl dark:bg-primary-400/20"
          style={{ width: s.tilePx * 1.3, height: s.tilePx * 1.3 }}
        />

        {/* Layered ghost cards for depth */}
        <span
          aria-hidden="true"
          className={cx(
            "absolute -rotate-[10deg] scale-[0.92] border border-slate-200/80 bg-white/70 dark:border-white/[0.06] dark:bg-white/[0.03]",
            "-translate-x-2.5 translate-y-0.5",
            s.tile
          )}
        />
        <span
          aria-hidden="true"
          className={cx(
            "absolute rotate-[10deg] scale-[0.92] border border-slate-200/80 bg-white/70 dark:border-white/[0.06] dark:bg-white/[0.03]",
            "translate-x-2.5 translate-y-0.5",
            s.tile
          )}
        />

        {/* Icon tile */}
        <div
          className={cx(
            "relative flex items-center justify-center overflow-hidden",
            "bg-gradient-to-b from-white to-slate-50 dark:from-slate-700/80 dark:to-slate-800",
            "border border-slate-200 dark:border-white/[0.12]",
            "shadow-[inset_0_1px_0_rgba(255,255,255,1),0_1px_2px_rgba(15,23,42,0.06),0_12px_28px_-8px_rgba(79,70,229,0.25)]",
            "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_1px_2px_rgba(0,0,0,0.5),0_12px_32px_-8px_rgba(99,102,241,0.45)]",
            s.tile
          )}
        >
          {/* top sheen */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/70 to-transparent dark:from-white/[0.08]"
          />
          {/* icon */}
          <span className="relative flex items-center justify-center text-primary-600 dark:text-primary-300 dark:drop-shadow-[0_0_10px_rgba(129,140,248,0.55)]">
            {renderIcon(icon, s.icon)}
          </span>
        </div>
      </div>

      {/* Copy */}
      <div className={cx("relative", s.max)} style={{ marginTop: s.gapPx }}>
        <h3
          className={cx(
            "font-semibold tracking-tight text-slate-900 dark:text-slate-50",
            s.title
          )}
        >
          {title}
        </h3>
        {description ? (
          <p
            className={cx(
              "mt-1.5 text-balance text-slate-500 dark:text-slate-400",
              s.desc
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {/* Optional actions */}
      {children ? (
        <div className={cx("relative flex flex-wrap items-center justify-center gap-2", s.actions)}>
          {children}
        </div>
      ) : null}
    </div>
  );
}