// src/hooks/useGlobalEffects.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to the top whenever the route changes.
 * Uses #main-content if it exists, otherwise the window.
 * Must be used inside <BrowserRouter>.
 */
export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const main = document.getElementById("main-content");

    if (main) {
      main.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname]);
};

/**
 * Prevents the mouse wheel from changing the value of a focused
 * <input type="number">. The input is blurred on scroll, so the value
 * stays the same and the page keeps scrolling normally.
 */
export const usePreventNumberInputScroll = () => {
  useEffect(() => {
    const handleWheel = (e) => {
      const el = e.target;

      if (
        el instanceof HTMLInputElement &&
        el.type === "number" &&
        document.activeElement === el
      ) {
        el.blur();
      }
    };

    document.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      document.removeEventListener("wheel", handleWheel);
    };
  }, []);
};
