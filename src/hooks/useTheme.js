import { useContext } from "react";
import { ThemeContext } from "@contexts/ThemeContext.js";

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
};

export default useTheme;
