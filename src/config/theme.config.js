import { STORAGE_CONFIG } from "./storage.config";

export const THEME_STORAGE_KEYS = {
  THEME: STORAGE_CONFIG.THEME || "app-theme",
  COLOR_MODE: STORAGE_CONFIG.COLOR_MODE || "dark-mode",
};

export const COLOR_MODES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

export const THEME_PRESETS = [
  {
    id: "violet",
    name: "Violet",
    description: "Modern purple and magenta",
    primary: "#753CEF",
    secondary: "#B63CEF",
    light: "#F7F3FF",
    dark: "#281653",
  },
  {
    id: "blue",
    name: "Blue",
    description: "Clean blue and cyan",
    primary: "#5D87FF",
    secondary: "#44B7F7",
    light: "#F5F7FF",
    dark: "#202D5C",
  },
  {
    id: "emerald",
    name: "Emerald",
    description: "Fresh green and cyan",
    primary: "#10B981",
    secondary: "#06B6D4",
    light: "#ECFDF5",
    dark: "#022C22",
  },
  {
    id: "rose",
    name: "Rose",
    description: "Bold rose and pink",
    primary: "#E11D48",
    secondary: "#F43F5E",
    light: "#FFF1F2",
    dark: "#4C0519",
  },
  {
    id: "orange",
    name: "Orange",
    description: "Warm orange and amber",
    primary: "#F97316",
    secondary: "#F59E0B",
    light: "#FFF7ED",
    dark: "#431407",
  },
];

export const DEFAULT_THEME = "violet";
export const DEFAULT_MODE = COLOR_MODES.SYSTEM;

/**
 * Checks system preference for dark mode
 */
export const getSystemDarkPreference = () => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

/**
 * Reads initial theme from storage with fallback
 */
export const readStoredTheme = () => {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEYS.THEME);
    return THEME_PRESETS.some((t) => t.id === saved) ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

/**
 * Reads initial mode from storage with fallback
 */
export const readStoredMode = () => {
  if (typeof window === "undefined") return DEFAULT_MODE;
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEYS.COLOR_MODE);
    if (saved === COLOR_MODES.LIGHT || saved === COLOR_MODES.DARK || saved === COLOR_MODES.SYSTEM) {
      return saved;
    }
    // Backward compatibility if old boolean was stored
    if (saved === "true") return COLOR_MODES.DARK;
    if (saved === "false") return COLOR_MODES.LIGHT;
    return DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
};

/**
 * Enterprise white-labeling helper: dynamically injects custom theme brand colors
 */
export const applyCustomBrandColors = (primaryHex, secondaryHex) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (primaryHex) {
    root.style.setProperty("--primary-500", primaryHex);
    root.style.setProperty("--brand-primary", primaryHex);
    root.style.setProperty("--primary-50", `color-mix(in srgb, ${primaryHex} 8%, #ffffff)`);
    root.style.setProperty("--primary-100", `color-mix(in srgb, ${primaryHex} 16%, #ffffff)`);
    root.style.setProperty("--primary-600", `color-mix(in srgb, ${primaryHex} 85%, #000000)`);
    root.style.setProperty("--primary-700", `color-mix(in srgb, ${primaryHex} 70%, #000000)`);
  }
  if (secondaryHex) {
    root.style.setProperty("--secondary-500", secondaryHex);
    root.style.setProperty("--brand-secondary", secondaryHex);
  }
};
