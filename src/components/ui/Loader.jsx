/**
 * Loader – page / content loading state.
 *
 * It fills its PARENT (not the viewport), so it never covers your header or
 * sidebar. Drop it inside the content area and it centers itself there.
 *
 * Props
 * - title        string | node   (default "Loading")
 * - description  string | node   (optional)
 * - className    extra classes for the root element
 *
 * Usage
 *   // content area that already has height (flex-1 / h-full)
 *   if (isLoading) return <Loader title="Loading orders" description="Fetching the latest data." />;
 *
 *   // content area without a fixed height: give it one via className
 *   <Loader className="min-h-[calc(100vh-4rem)]" />   // 4rem = your header height
 *
 * Tip: if you already use `clsx` / `tailwind-merge`, swap `cx` below for your `cn` helper.
 */

const cx = (...parts) => parts.filter(Boolean).join(" ");

/* Self-contained keyframes: no tailwind.config changes needed */
const KEYFRAMES = `
@keyframes ld-spin  { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
@keyframes ld-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes ld-bar   { 0%,100% { transform: scaleY(.4); } 50% { transform: scaleY(1); } }
@keyframes ld-glow  { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .ld-anim { animation: none !important; } }
`;

const RINGS = [112, 160, 208, 256];
const AREA = RINGS[RINGS.length - 1];

export default function Loader({
  title = "Loading",
  description,
  className = "",
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cx(
        "relative flex h-full min-h-[320px] w-full flex-1 flex-col items-center justify-center overflow-hidden px-6 py-12 text-center",
        className
      )}
    >
      <style>{KEYFRAMES}</style>

      {/* Quiet dotted backdrop that fades out toward the edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-size:22px_22px] bg-[radial-gradient(circle_at_center,rgb(148_163_184/0.4)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgb(255_255_255/0.07)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />

      {/* Illustration */}
      <div
        aria-hidden="true"
        className="relative flex h-16 w-16 shrink-0 items-center justify-center"
      >
        {/* Concentric rings, fading outwards */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(closest-side,black,transparent)] [-webkit-mask-image:radial-gradient(closest-side,black,transparent)]"
          style={{ width: AREA, height: AREA }}
        >
          {RINGS.map((px) => (
            <span
              key={px}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 dark:border-white/10"
              style={{ width: px, height: px }}
            />
          ))}
        </div>

        {/* Orbiting dots (on rings 160 and 208) */}
        <div
          className="ld-anim pointer-events-none absolute left-1/2 top-1/2 -ml-20 -mt-20 h-40 w-40"
          style={{ animation: "ld-orbit 5s linear infinite" }}
        >
          <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500 shadow-[0_0_10px_2px_rgba(99,102,241,0.55)] dark:bg-indigo-300" />
        </div>
        <div
          className="ld-anim pointer-events-none absolute left-1/2 top-1/2 -ml-[104px] -mt-[104px] h-[208px] w-[208px]"
          style={{ animation: "ld-orbit 9s linear infinite reverse" }}
        >
          <span className="absolute left-1/2 top-0 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400/70 dark:bg-indigo-300/60" />
        </div>

        {/* Breathing glow */}
        <span
          className="ld-anim pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/25 blur-2xl dark:bg-indigo-400/25"
          style={{ animation: "ld-glow 2.4s ease-in-out infinite" }}
        />

        {/* Tile with a travelling light along its edge */}
        <div
          className={cx(
            "relative h-16 w-16 overflow-hidden rounded-[20px] p-[1.5px]",
            "bg-slate-200 dark:bg-white/10",
            "shadow-[0_1px_2px_rgba(15,23,42,0.06),0_14px_30px_-10px_rgba(79,70,229,0.35)]",
            "dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),0_14px_34px_-10px_rgba(99,102,241,0.55)]"
          )}
        >
          <span
            className="ld-anim absolute left-1/2 top-1/2 h-[220%] w-[220%]"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, transparent 230deg, rgba(99,102,241,0.95) 360deg)",
              animation: "ld-spin 1.8s linear infinite",
            }}
          />
          <div
            className={cx(
              "relative flex h-full w-full items-center justify-center overflow-hidden rounded-[18.5px]",
              "bg-gradient-to-b from-white to-slate-50 dark:from-slate-700 dark:to-slate-800"
            )}
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/80 to-transparent dark:from-white/[0.07]" />
            {/* tiny equalizer = "content is being prepared" */}
            <span className="relative flex h-6 items-center gap-[5px]">
              {[0, 160, 320].map((d) => (
                <span
                  key={d}
                  className="ld-anim h-full w-[3.5px] origin-center rounded-full bg-indigo-600 dark:bg-indigo-300"
                  style={{ animation: "ld-bar 1s ease-in-out infinite", animationDelay: `${d}ms` }}
                />
              ))}
            </span>
          </div>
        </div>
      </div>

      {/* Copy */}
      <div className="relative mt-10 max-w-sm">
        <p className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {title}
        </p>
        {description ? (
          <p className="mt-1.5 text-balance text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}