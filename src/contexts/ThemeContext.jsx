import { useEffect, useState, useCallback, useMemo } from "react";
import { ThemeContext } from "./ThemeContext.js";
import {
  THEME_STORAGE_KEYS,
  COLOR_MODES,
  THEME_PRESETS,
  readStoredTheme,
  readStoredMode,
  getSystemDarkPreference,
} from "@config/theme.config";

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(readStoredTheme);
  const [mode, setModeState] = useState(readStoredMode);

  // Compute resolved dark status
  const isDarkActive = useCallback(() => {
    if (mode === COLOR_MODES.DARK) return true;
    if (mode === COLOR_MODES.LIGHT) return false;
    return getSystemDarkPreference();
  }, [mode]);

  // Apply mode to <html>
  const syncModeToDom = useCallback(() => {
    const isDark = isDarkActive();
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, [isDarkActive]);

  // Sync mode changes & listen for system OS changes when mode is 'system'
  useEffect(() => {
    syncModeToDom();

    if (mode !== COLOR_MODES.SYSTEM) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => syncModeToDom();

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [mode, syncModeToDom]);

  // Sync palette theme changes to <html> data-theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEYS.THEME, theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

  // Handle bfcache (pageshow), browser history back/forward (popstate), and tab storage sync
  useEffect(() => {
    const handleSync = () => {
      const storedTheme = readStoredTheme();
      const storedMode = readStoredMode();
      setThemeState(storedTheme);
      setModeState(storedMode);

      document.documentElement.setAttribute("data-theme", storedTheme);

      const isDark =
        storedMode === COLOR_MODES.DARK ||
        (storedMode === COLOR_MODES.SYSTEM && getSystemDarkPreference());

      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    };

    window.addEventListener("pageshow", handleSync);
    window.addEventListener("popstate", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("pageshow", handleSync);
      window.removeEventListener("popstate", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Palette setter
  const setTheme = useCallback((newTheme) => {
    if (THEME_PRESETS.some((p) => p.id === newTheme)) {
      setThemeState(newTheme);
    }
  }, []);

  // Mode setter ('light' | 'dark' | 'system')
  const setMode = useCallback((newMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(THEME_STORAGE_KEYS.COLOR_MODE, newMode);
    } catch {
      /* storage unavailable */
    }
  }, []);

  // Fast toggle between light and dark
  const toggleDarkMode = useCallback(() => {
    setModeState((currentMode) => {
      const isCurrentlyDark =
        currentMode === COLOR_MODES.DARK ||
        (currentMode === COLOR_MODES.SYSTEM && getSystemDarkPreference());
      const nextMode = isCurrentlyDark ? COLOR_MODES.LIGHT : COLOR_MODES.DARK;

      try {
        localStorage.setItem(THEME_STORAGE_KEYS.COLOR_MODE, nextMode);
      } catch {
        /* storage unavailable */
      }

      return nextMode;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      mode,
      setMode,
      toggleDarkMode,
      isDark: isDarkActive(),
      presets: THEME_PRESETS,
      themes: THEME_PRESETS, // backward compatibility
    }),
    [theme, setTheme, mode, setMode, toggleDarkMode, isDarkActive]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
