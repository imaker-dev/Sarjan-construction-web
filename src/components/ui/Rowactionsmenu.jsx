import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

const GAP = 6; // space between the trigger and the menu
const EDGE = 8; // minimum distance from the viewport edge

/**
 * Three-dot dropdown for a table row.
 *
 * - Rendered in a portal, so overflow containers never clip it.
 * - Sizes itself to its content (long labels never wrap), right-aligned to the trigger.
 * - Measures itself after render and flips upward when there's no room below.
 * - Keyboard: Arrow keys / Home / End to move, Esc to close, focus returns to trigger.
 *
 * actions: [{ label, icon, onClick(row), danger?, disabled?, divider? }]
 *  - `divider: true` draws a separator above that item (danger items get one automatically).
 */
export default function RowActionsMenu({ row, actions, label = "Row actions" }) {
  const [anchor, setAnchor] = useState(null); // trigger rect while open
  const [top, setTop] = useState(0);
  const [ready, setReady] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const close = useCallback((returnFocus = false) => {
    setAnchor(null);
    setReady(false);
    if (returnFocus) btnRef.current?.focus();
  }, []);

  const toggle = () => {
    if (anchor) return close();
    const r = btnRef.current.getBoundingClientRect();
    setReady(false);
    setTop(r.bottom + GAP);
    setAnchor({ top: r.top, bottom: r.bottom, right: r.right });
  };

  // Measure the real menu height, then decide whether to open up or down
  useLayoutEffect(() => {
    if (!anchor || !menuRef.current) return;
    const h = menuRef.current.offsetHeight;
    const spaceBelow = window.innerHeight - anchor.bottom - GAP - EDGE;
    const spaceAbove = anchor.top - GAP - EDGE;
    const openUp = h > spaceBelow && spaceAbove > spaceBelow;
    setTop(openUp ? Math.max(EDGE, anchor.top - GAP - h) : anchor.bottom + GAP);
    setReady(true);
    menuRef.current.querySelector('[role="menuitem"]:not(:disabled)')?.focus({ preventScroll: true });
  }, [anchor]);

  useEffect(() => {
    if (!anchor) return undefined;
    const onDown = (e) => {
      if (
        menuRef.current?.contains(e.target) ||
        btnRef.current?.contains(e.target)
      )
        return;
      close();
    };
    const onKey = (e) => e.key === "Escape" && close(true);
    const onScroll = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    const onResize = () => close();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [anchor, close]);

  const onMenuKeyDown = (e) => {
    const items = [
      ...menuRef.current.querySelectorAll('[role="menuitem"]:not(:disabled)'),
    ];
    if (!items.length) return;
    const idx = items.indexOf(document.activeElement);
    let next = null;
    if (e.key === "ArrowDown") next = items[(idx + 1) % items.length];
    else if (e.key === "ArrowUp")
      next = items[(idx - 1 + items.length) % items.length];
    else if (e.key === "Home") next = items[0];
    else if (e.key === "End") next = items[items.length - 1];
    else if (e.key === "Tab") return close();
    if (next) {
      e.preventDefault();
      next.focus();
    }
  };

  if (!actions?.length) return null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={!!anchor}
        className={`rounded-lg p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600 ${
          anchor
            ? "bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-200"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700/50 dark:hover:text-slate-200"
        }`}
      >
        <MoreHorizontal size={18} strokeWidth={2} />
      </button>

      {anchor &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            onKeyDown={onMenuKeyDown}
            style={{
              position: "fixed",
              top,
              right: Math.max(EDGE, window.innerWidth - anchor.right),
              width: "max-content",
              minWidth: 200,
              maxWidth: `calc(100vw - ${EDGE * 2}px)`,
              maxHeight: `calc(100vh - ${EDGE * 2}px)`,
              opacity: ready ? 1 : 0,
              pointerEvents: ready ? "auto" : "none",
            }}
            className="z-50 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-[#1C2536] dark:shadow-black/40"
          >
            {actions.map(
              (
                { label: text, icon: Icon, onClick, danger, disabled, divider },
                index,
              ) => (
                <React.Fragment key={`${text}-${index}`}>
                  {index > 0 && (divider || danger) && (
                    <div
                      role="separator"
                      className="mx-1 my-1.5 h-px bg-slate-100 dark:bg-slate-700/70"
                    />
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    disabled={disabled}
                    onClick={() => {
                      close();
                      onClick?.(row);
                    }}
                    className={`group flex w-full items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-left text-[13.5px] transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 ${
                      danger
                        ? "text-rose-500 hover:bg-rose-50 focus-visible:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:focus-visible:bg-rose-500/10"
                        : "text-slate-700 hover:bg-slate-50 focus-visible:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/40 dark:focus-visible:bg-slate-700/40"
                    }`}
                  >
                    {Icon && (
                      <Icon
                        size={16}
                        strokeWidth={2}
                        className={`shrink-0 transition-colors ${
                          danger
                            ? ""
                            : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-200"
                        }`}
                      />
                    )}
                    {text}
                  </button>
                </React.Fragment>
              ),
            )}
          </div>,
          document.body,
        )}
    </>
  );
}