import React, { useMemo } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

/**
 * Reusable page-based pagination bar.
 *
 * Props:
 *  page            1-based current page
 *  pageSize        items per page
 *  totalItems      total number of items
 *  onPageChange    (nextPage: number) => void
 *  onPageSizeChange (nextSize: number) => void (optional)
 *  pageSizeOptions array of sizes (default [10, 20, 50])
 *  className       extra wrapper classes
 */
export default function Pagination({
  page = 1,
  pageSize = 10,
  totalItems = 0,
  itemLabel = "",
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className = "",
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const pages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const items = [1];
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);

    if (start > 2) items.push("...");
    for (let p = start; p <= end; p += 1) items.push(p);
    if (end < totalPages - 1) items.push("...");
    items.push(totalPages);
    return items;
  }, [safePage, totalPages]);

  if (totalItems === 0 || (totalPages <= 1 && !onPageSizeChange)) {
    return null;
  }

  const from = (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, totalItems);

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-5 py-3.5 text-xs text-slate-500 dark:border-slate-700/70 dark:text-slate-400 sm:px-6 ${className}`}
    >
      <span className="tabular-nums text-[12.5px] text-slate-500 dark:text-slate-300">
        Showing{" "}
        <strong className="font-semibold text-slate-800 dark:text-white">
          {from}–{to}
        </strong>{" "}
        of{" "}
        <strong className="font-semibold text-slate-800 dark:text-white">
          {totalItems}
        </strong>
        {itemLabel ? ` ${itemLabel}` : ""}
      </span>

      <div className="flex flex-wrap items-center gap-4 ml-auto">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-[12.5px] text-slate-500 dark:text-slate-400">
              Rows per page:
            </span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Rows per page"
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 focus:border-primary-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size} className="dark:bg-[#1C2536]">
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {totalPages > 1 && (
          <nav aria-label="Pagination" className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => onPageChange?.(safePage - 1)}
              aria-label="Previous page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200/70 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700/70"
            >
              <IconChevronLeft size={14} />
            </button>

            {pages.map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange?.(p)}
                  aria-current={p === safePage ? "page" : undefined}
                  className={`inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-xs font-semibold tabular-nums transition-colors ${
                    p === safePage
                      ? "bg-primary-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700/70"
                  }`}
                >
                  {p}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => onPageChange?.(safePage + 1)}
              aria-label="Next page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200/70 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700/70"
            >
              <IconChevronRight size={14} />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
