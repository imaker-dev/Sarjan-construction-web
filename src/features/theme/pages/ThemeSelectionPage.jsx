import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import { useTheme } from "@hooks/useTheme";
import { COLOR_MODES } from "@config/theme.config";
import { Check, Sun, Moon, Monitor } from "lucide-react";

/* =======================================================
   THEME PREVIEW
   ======================================================= */

const ThemePreview = ({ theme }) => {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-xl
        border
        border-black/[0.06]
        bg-[#f8f9fc]
        dark:border-white/[0.08]
        dark:bg-[#151922]
      "
      style={{
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
      }}
    >
      {/* Top bar */}
      <div
        className="
          flex
          h-9
          items-center
          justify-between
          border-b
          border-black/[0.05]
          bg-white
          px-3
          dark:border-white/[0.06]
          dark:bg-[#1c202b]
        "
      >
        <div className="flex items-center gap-1.5">
          <div
            className="h-2.5 w-2.5 rounded-[4px]"
            style={{
              background: `linear-gradient(
                135deg,
                ${theme.primary},
                ${theme.secondary}
              )`,
            }}
          />

          <div className="h-1.5 w-12 rounded-full bg-gray-200 dark:bg-white/15" />
        </div>

        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-gray-100 dark:bg-white/10" />
          <div className="h-2 w-2 rounded-full bg-gray-100 dark:bg-white/10" />
        </div>
      </div>

      {/* Dashboard */}
      <div className="flex h-[155px]">
        {/* Sidebar */}
        <div
          className="w-[25%] shrink-0 p-2.5"
          style={{
            backgroundColor: theme.dark,
          }}
        >
          {/* Logo */}
          <div className="mb-5 flex items-center gap-1.5">
            <div
              className="h-5 w-5 rounded-md"
              style={{
                background: `linear-gradient(
                  135deg,
                  ${theme.primary},
                  ${theme.secondary}
                )`,
              }}
            />

            <div className="h-1.5 w-9 rounded-full bg-white/20" />
          </div>

          {/* Active item */}
          <div
            className="mb-1.5 flex h-5 items-center gap-1.5 rounded-md px-1.5"
            style={{
              backgroundColor: theme.primary,
            }}
          >
            <div className="h-2 w-2 rounded-sm bg-white/80" />
            <div className="h-1 w-7 rounded-full bg-white/70" />
          </div>

          {/* Other items */}
          <div className="space-y-1.5 px-1.5">
            <div className="h-1.5 w-10 rounded-full bg-white/15" />
            <div className="h-1.5 w-8 rounded-full bg-white/15" />
            <div className="h-1.5 w-11 rounded-full bg-white/15" />
            <div className="h-1.5 w-7 rounded-full bg-white/15" />
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 bg-[#f8f9fc] p-3 dark:bg-[#151922]">
          {/* Heading */}
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="mb-1.5 h-2 w-16 rounded-full bg-gray-700 dark:bg-gray-200/70" />
              <div className="h-1 w-11 rounded-full bg-gray-200 dark:bg-white/15" />
            </div>

            <div
              className="h-5 w-11 rounded-md"
              style={{
                backgroundColor: theme.primary,
              }}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  rounded-md
                  border
                  border-gray-100
                  bg-white
                  p-2
                  dark:border-white/[0.06]
                  dark:bg-[#1c202b]
                "
              >
                <div
                  className="mb-1.5 h-3 w-3 rounded-sm"
                  style={{
                    backgroundColor: theme.light,
                  }}
                />

                <div className="mb-1 h-1.5 w-8 rounded-full bg-gray-300 dark:bg-white/20" />
                <div className="h-1 w-5 rounded-full bg-gray-100 dark:bg-white/10" />
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="mt-1.5 flex gap-1.5">
            {/* Chart */}
            <div
              className="
                flex
                flex-1
                items-end
                gap-1
                rounded-md
                border
                border-gray-100
                bg-white
                px-2
                pb-2
                pt-3
                dark:border-white/[0.06]
                dark:bg-[#1c202b]
              "
            >
              {[35, 50, 42, 68, 55, 78, 64, 88].map((height, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-t-[2px]"
                  style={{
                    height: `${height}%`,
                    opacity: index === 7 ? 1 : 0.35,
                    backgroundColor: theme.primary,
                  }}
                />
              ))}
            </div>

            {/* Activity */}
            <div
              className="
                w-[38%]
                rounded-md
                border
                border-gray-100
                bg-white
                p-2
                dark:border-white/[0.06]
                dark:bg-[#1c202b]
              "
            >
              <div className="mb-2 h-1.5 w-9 rounded-full bg-gray-300 dark:bg-white/20" />

              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center gap-1">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: theme.light,
                      }}
                    />

                    <div className="h-1 flex-1 rounded-full bg-gray-100 dark:bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   THEME CARD
============================================================================ */
const ThemeCard = ({ theme, selected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        group
        relative
        w-full
        overflow-hidden
        rounded-2xl
        border
        bg-card
        text-left
        transition-all
        duration-200
        focus:outline-none
        ${
          selected
            ? "scale-[1.01]"
            : "border-border hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md dark:hover:shadow-black/25"
        }
      `}
      style={
        selected
          ? {
              borderColor: theme.primary,
              boxShadow: `0 0 0 1px ${theme.primary}, 0 10px 28px ${theme.primary}26`,
            }
          : undefined
      }
    >
      {/* THEME PREVIEW */}
      <div className="p-2.5">
        <ThemePreview theme={theme} />
      </div>

      {/* THEME INFORMATION */}
      <div className="flex items-center justify-between px-4 pb-4 pt-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {/* Theme color indicator */}
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{
                background: `linear-gradient(
                  135deg,
                  ${theme.primary},
                  ${theme.secondary}
                )`,
              }}
            />

            {/* Theme name */}
            <span className="text-sm font-semibold text-foreground">
              {theme.name}
            </span>
          </div>

          {/* Theme description */}
          <p className="mt-1 text-xs text-muted-foreground">
            {theme.description}
          </p>
        </div>

        {/* SELECTED INDICATOR */}
        {selected && (
          <span
            className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-full
              text-white
              shadow-sm
              transition-shadow
              dark:shadow-black/20
            "
            style={{
              backgroundColor: theme.primary,
            }}
          >
            <Check size={14} strokeWidth={2.75} />
          </span>
        )}
      </div>
    </button>
  );
};

/* ============================================================================
   MODE CARD
============================================================================ */
const ModeCard = ({ label, description, icon: Icon, active, onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        relative flex items-center justify-between gap-3 p-4 rounded-xl border text-left transition-all duration-200
        bg-card focus:outline-none
        ${
          active
            ? "border-primary-500 shadow-sm ring-1 ring-primary-500"
            : "border-border hover:border-border/80 hover:bg-muted/50"
        }
      `}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`
            flex h-10 w-10 items-center justify-center rounded-lg transition-colors
            ${active ? "bg-primary-500 text-white" : "bg-muted text-muted-foreground"}
          `}
        >
          <Icon size={20} strokeWidth={1.8} />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>

      {active && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white shadow-xs">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
    </button>
  );
};

/* =======================================================
   PAGE
   ======================================================= */

const ThemeSelectionPage = () => {
  const { theme, setTheme, mode, setMode, presets } = useTheme();

  return (
    <div className="space-y-8">
      <PageHeaderBanner title="Themes & Appearance" />

      {/* APPEARANCE MODE SECTION */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Appearance Mode</h2>
          <p className="text-xs text-muted-foreground">
            Select your preferred display mode or sync automatically with your system settings.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <ModeCard
            modeId={COLOR_MODES.LIGHT}
            label="Light"
            description="Crisp & clean light palette"
            icon={Sun}
            active={mode === COLOR_MODES.LIGHT}
            onSelect={() => setMode(COLOR_MODES.LIGHT)}
          />
          <ModeCard
            modeId={COLOR_MODES.DARK}
            label="Dark"
            description="Easy on the eyes in low light"
            icon={Moon}
            active={mode === COLOR_MODES.DARK}
            onSelect={() => setMode(COLOR_MODES.DARK)}
          />
          <ModeCard
            modeId={COLOR_MODES.SYSTEM}
            label="System"
            description="Matches your operating system"
            icon={Monitor}
            active={mode === COLOR_MODES.SYSTEM}
            onSelect={() => setMode(COLOR_MODES.SYSTEM)}
          />
        </div>
      </section>

      {/* COLOR THEME PRESETS SECTION */}
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Color Palette</h2>
          <p className="text-xs text-muted-foreground">
            Choose the accent branding used for buttons, links, charts, and interactive highlights.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {presets.map((t) => (
            <ThemeCard
              key={t.id}
              theme={t}
              selected={theme === t.id}
              onSelect={() => setTheme(t.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ThemeSelectionPage;
