import React from "react";
import { Inbox, Loader2, Search, X } from "lucide-react";
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
 *  search         { value, onChange(value: string), placeholder? }  -> shows a search box
 *                 (controlled; debounce in the parent if you hit an API)
 *  headerActions  [{ label, icon, onClick, variant?: "primary"|"secondary"|"icon",
 *                    loading?, disabled?, hidden? }]  -> buttons on the right of the heading
 *                 ("icon" renders icon-only, label becomes the tooltip/aria-label)
 *  headerExtra    any custom node, rendered after headerActions
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
  typeof rowKey === "function" ? rowKey(row, index) : (row?.[rowKey] ?? index);

const BUTTON_STYLES = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
  icon: "btn-icon",
};

function HeaderButton({
  label,
  icon: Icon,
  onClick,
  variant = "secondary",
  loading,
  disabled,
}) {
  const iconOnly = variant === "icon";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
      className={`btn-sm ${BUTTON_STYLES[variant]}`}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        Icon && <Icon size={iconOnly ? 18 : 16} strokeWidth={2} />
      )}
      {!iconOnly && label}
    </button>
  );
}

function SearchBox({ value = "", onChange, placeholder = "Search..." }) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-8 text-[13.5px] text-slate-700 placeholder:text-slate-400 transition-colors focus:border-secondary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-secondary-500/20 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:bg-transparent"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange?.("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing to show",
  description,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-700/40 dark:text-slate-500">
        <Icon size={22} />
      </div>
      <p className="text-[14px] font-medium text-slate-700 dark:text-slate-200">
        {title}
      </p>
      {description && (
        <p className="max-w-xs text-[12.5px] text-slate-400 dark:text-slate-500">
          {description}
        </p>
      )}
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
  search,
  headerActions,
  headerExtra,
  empty,
  skeletonRows = 5,
}) {
  const hasActions = !!actions;
  const getActions = (row) =>
    (typeof actions === "function" ? actions(row) : actions || []).filter(
      (a) => !a.hidden?.(row),
    );

  const visibleOnMobile = columns.filter((c) => !c.hideOnMobile);
  const [titleCol, ...restCols] = visibleOnMobile;
  const headerCols = restCols.filter((c) => c.mobilePosition === "header");
  const bodyCols = restCols.filter((c) => c.mobilePosition !== "header");

  const isEmpty = !loading && data.length === 0;
  const searchTerm = search?.value?.trim();
  const visibleHeaderActions = (headerActions || []).filter((a) => !a.hidden);
  const hasHeaderRight = visibleHeaderActions.length > 0 || !!headerExtra;

  return (
    <div
      aria-busy={loading}
      className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#1C2536]"
    >
      {(title || hasHeaderRight || search) && (
        <div className="space-y-3 border-b border-slate-100 px-5 py-4 dark:border-slate-700 sm:px-6">
          {(title || hasHeaderRight) && (
            <div className="flex items-center justify-between gap-3">
              {title ? (
                <h2 className="text-[15px] font-semibold text-slate-800 dark:text-white">
                  {title}
                </h2>
              ) : (
                <span />
              )}
              {hasHeaderRight && (
                <div className="flex items-center gap-2">
                  {visibleHeaderActions.map((action) => (
                    <HeaderButton key={action.label} {...action} />
                  ))}
                  {headerExtra}
                </div>
              )}
            </div>
          )}
          {search && <SearchBox {...search} />}
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
                    <tr
                      key={r}
                      className="border-t border-slate-100 dark:border-slate-700/70"
                    >
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
                    <div className="min-w-0">
                      {titleCol && renderCell(titleCol, row, i)}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {headerCols.map((col) => (
                        <React.Fragment key={col.key}>
                          {renderCell(col, row, i)}
                        </React.Fragment>
                      ))}
                      {hasActions && (
                        <RowActionsMenu row={row} actions={getActions(row)} />
                      )}
                    </div>
                  </div>

                  {bodyCols.length > 0 && (
                    <div className="grid grid-cols-2 gap-y-2 pl-1 text-[12.5px]">
                      {bodyCols.map((col) => (
                        <React.Fragment key={col.key}>
                          <div className="text-slate-400 dark:text-slate-500">
                            {col.header}
                          </div>
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

      {isEmpty && (
        <EmptyState
          {...(searchTerm
            ? {
                icon: Search,
                title: "No results found",
                description: `Nothing matches “${searchTerm}”. Try a different search.`,
              }
            : empty)}
        />
      )}
    </div>
  );
}
