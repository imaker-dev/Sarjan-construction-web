import { APP_CONFIG } from "@config/app.config";
import { useEffect, useState } from "react";

/**
 * Stays visible until the parent unmounts it.
 * Usage: {isLoading && <SplashScreen />}
 */
export default function SplashScreen({ message = "Loading your workspace" }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Loading ${APP_CONFIG.APP_NAME}`}
      className="fixed inset-0 z-[100] flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-slate-50 px-6 dark:bg-[#0A0B14]"
    >
      <style>{`
        @keyframes splash-slide {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>

      {/* Dotted grid, faded toward the edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(15_18_38/0.08)_1px,transparent_0)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_70%)] dark:bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.07)_1px,transparent_0)]"
      />

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-[60%] rounded-full bg-primary-500/15 blur-3xl motion-safe:animate-pulse sm:h-[560px] sm:w-[560px] dark:bg-primary-500/20"
      />

      {/* Brand */}
      <div
        className={`relative flex flex-col items-center transition-all duration-700 ease-out ${
          entered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        <img
          src={APP_CONFIG.LOGO_ICON}
          alt=""
          draggable={false}
          className="h-16 w-16 select-none sm:h-20 sm:w-20"
        />

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          {APP_CONFIG.APP_NAME}
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {message}
        </p>

        {/* Indeterminate loader */}
        <div className="mt-8 h-1 w-44 overflow-hidden rounded-full bg-slate-200 sm:w-56 dark:bg-white/10">
          <div className="h-full w-2/5 rounded-full bg-primary-600 dark:bg-primary-400 motion-safe:[animation:splash-slide_1.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
