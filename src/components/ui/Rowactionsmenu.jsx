import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

const MENU_W = 176;
const ITEM_H = 38;
const MENU_PADDING = 12;

/**
 * Three-dot dropdown for a table row.
 * Rendered in a portal so overflow containers (tables, cards) never clip it.
 *
 * actions: [{ label, icon, onClick(row), danger?, disabled? }]
 */
export default function RowActionsMenu({ row, actions, label = "Row actions" }) {
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const close = useCallback(() => setPos(null), []);

  const toggle = () => {
    if (pos) return close();
    const r = btnRef.current.getBoundingClientRect();
    const menuH = actions.length * ITEM_H + MENU_PADDING;
    const openUp = window.innerHeight - r.bottom < menuH + 12;
    setPos({
      left: Math.max(8, r.right - MENU_W),
      ...(openUp ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
    });
  };

  useEffect(() => {
    if (!pos) return undefined;
    const onDown = (e) => {
      if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      close();
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        close();
        btnRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [pos, close]);

  if (!actions?.length) return null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={!!pos}
        className={`rounded-md p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600 ${
          pos
            ? "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-200"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700/50 dark:hover:text-slate-200"
        }`}
      >
        <MoreHorizontal size={18} strokeWidth={2} />
      </button>

      {pos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: "fixed", width: MENU_W, ...pos }}
            className="z-50 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-[#1C2536]"
          >
            {actions.map(({ label: text, icon: Icon, onClick, danger, disabled }) => (
              <button
                key={text}
                type="button"
                role="menuitem"
                disabled={disabled}
                onClick={() => {
                  close();
                  onClick?.(row);
                }}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-[13.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  danger
                    ? "text-rose-500 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/40"
                }`}
              >
                {Icon && <Icon size={16} strokeWidth={2} />}
                {text}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}