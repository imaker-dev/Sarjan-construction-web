import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "@hooks/useTheme";

function ThemeToggle() {
  const { isDark, toggleDarkMode, mode } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      title={`Switch to ${isDark ? "light" : "dark"} mode (current mode: ${mode})`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="
        flex h-10 w-10 items-center justify-center
        rounded-full
        text-gray-700
        transition-all duration-200 ease-in-out
        hover:bg-primary-50
        hover:text-primary-500
        dark:text-gray-200
        dark:hover:bg-primary-900/40
        dark:hover:text-primary-300
      "
    >
      {isDark ? (
        <IconSun className="h-5 w-5" strokeWidth={1.8} />
      ) : (
        <IconMoon className="h-5 w-5" strokeWidth={1.8} />
      )}
    </button>
  );
}

export default ThemeToggle;
