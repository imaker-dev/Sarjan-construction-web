import React from "react";
import { Inbox } from "lucide-react";
import RowActionsMenu from "./RowActionsMenu";

/**
 * Reusable table: desktop table + stacked cards on mobile.
 *
 * Props
 *  columns        [{ key, header, render?(row, index), align?, width?, className?,
 *                    hideOnMobile?, mobilePosition?: "header" }]
 *                 - `key` supports dot paths ("user.name"); `render` overrides it.
 *                 - On mobile the first visible column is the card title, columns with
 *                   mobilePosition="header" sit beside it, the rest become label/value rows.
 *  data           array of rows
 *  actions        [{ label, icon, onClick(row), danger?, disabled?, hidden?(row) }]
 *                 or a function (row) => that array. Omit for no action column.
 *  loading        shows skeleton rows
 *  rowKey         field name or (row, index) => key   (default "id")
 *  title          card heading
 *  headerExtra    node rendered on the right of the heading (search/filters later)
 *  empty          { icon, title, description }
 *  skeletonRows   number of placeholder rows (default 5)
 */

const ALIGN = { left: "text-left", center: "text-center", right: "text-right" };
const SKELETON_WIDTHS = ["w-28", "w-20", "w-24", "w-16", "w-24"];

const getValue = (row, path) => path.split(".").reduce((o, k) => o?.[k], row);

const renderCell = (col, row, index) => {
  if (col.render) return col.render(row, index);
  const value = getValue(row, col.key);
  return value === null || value === undefined || value === "" ? "—" : value;
};

const getRowKey = (row, index, rowKey) =>
  typeof rowKey === "function" ? rowKey(row, index) : row?.[rowKey] ?? index;

function EmptyState({ icon: Icon = Inbox, title = "Nothing to show", description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-700/40 dark:text-slate-500">
        <Icon size={22} />
      </div>
      <p className="text-[14px] font-medium text-slate-700 dark:text-slate-200">{title}</p>
      {description && <p className="max-w-xs text-[12.5px] text-slate-400 dark:text-slate-500">{description}</p>}
    </div>
  );
}

export default function DataTable({
  columns = [],
  data = [],
  actions,
  loading = false,
  rowKey = "id",
  title,
  headerExtra,
  empty,
  skeletonRows = 5,
}) {
  const hasActions = !!actions;
  const getActions = (row) =>
    (typeof actions === "function" ? actions(row) : actions || []).filter((a) => !a.hidden?.(row));

  const visibleOnMobile = columns.filter((c) => !c.hideOnMobile);
  const [titleCol, ...restCols] = visibleOnMobile;
  const headerCols = restCols.filter((c) => c.mobilePosition === "header");
  const bodyCols = restCols.filter((c) => c.mobilePosition !== "header");

  const isEmpty = !loading && data.length === 0;

  return (
    <div
      aria-busy={loading}
      className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1C2536]"
    >
      {(title || headerExtra) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-700 sm:px-6">
          {title && <h2 className="text-[15px] font-semibold text-slate-800 dark:text-white">{title}</h2>}
          {headerExtra && <div className="flex items-center gap-2">{headerExtra}</div>}
        </div>
      )}

      {/* Desktop */}
      {!isEmpty && (
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/70 text-left text-slate-800 dark:bg-slate-800/30 dark:text-slate-200">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    style={col.width ? { width: col.width } : undefined}
                    className={`whitespace-nowrap px-6 py-3 font-semibold ${ALIGN[col.align] || ""}`}
                  >
                    {col.header}
                  </th>
                ))}
                {hasActions && (
                  <th scope="col" className="w-14 px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading
                ? Array.from({ length: skeletonRows }).map((_, r) => (
                    <tr key={r} className="border-t border-slate-100 dark:border-slate-700/70">
                      {columns.map((col, c) => (
                        <td key={col.key} className="px-6 py-4">
                          <div
                            className={`h-4 animate-pulse rounded bg-slate-100 dark:bg-slate-700/50 ${
                              SKELETON_WIDTHS[(r + c) % SKELETON_WIDTHS.length]
                            }`}
                          />
                        </td>
                      ))}
                      {hasActions && (
                        <td className="px-4 py-4">
                          <div className="ml-auto h-4 w-5 animate-pulse rounded bg-slate-100 dark:bg-slate-700/50" />
                        </td>
                      )}
                    </tr>
                  ))
                : data.map((row, i) => (
                    <tr
                      key={getRowKey(row, i, rowKey)}
                      className="border-t border-slate-100 transition-colors hover:bg-slate-50/60 dark:border-slate-700/70 dark:hover:bg-slate-700/20"
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-6 py-3.5 text-[13.5px] text-slate-700 dark:text-slate-200 ${
                            ALIGN[col.align] || ""
                          } ${col.className || ""}`}
                        >
                          {renderCell(col, row, i)}
                        </td>
                      ))}
                      {hasActions && (
                        <td className="px-4 py-3.5 text-right">
                          <RowActionsMenu row={row} actions={getActions(row)} />
                        </td>
                      )}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile */}
      {!isEmpty && (
        <div className="divide-y divide-slate-100 dark:divide-slate-700 sm:hidden">
          {loading
            ? Array.from({ length: Math.min(skeletonRows, 3) }).map((_, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="h-10 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-700/50" />
                </div>
              ))
            : data.map((row, i) => (
                <div key={getRowKey(row, i, rowKey)} className="px-5 py-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">{titleCol && renderCell(titleCol, row, i)}</div>
                    <div className="flex shrink-0 items-center gap-1">
                      {headerCols.map((col) => (
                        <React.Fragment key={col.key}>{renderCell(col, row, i)}</React.Fragment>
                      ))}
                      {hasActions && <RowActionsMenu row={row} actions={getActions(row)} />}
                    </div>
                  </div>

                  {bodyCols.length > 0 && (
                    <div className="grid grid-cols-2 gap-y-2 pl-1 text-[12.5px]">
                      {bodyCols.map((col) => (
                        <React.Fragment key={col.key}>
                          <div className="text-slate-400 dark:text-slate-500">{col.header}</div>
                          <div className="flex justify-end text-right text-slate-700 dark:text-slate-200">
                            {renderCell(col, row, i)}
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              ))}
        </div>
      )}

      {isEmpty && <EmptyState {...empty} />}
    </div>
  );
}