import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { IconArrowUpRight, IconSearch, IconX } from "@tabler/icons-react";
import { NAV_CONFIG } from "@config/navigation.config";
import ModalBlank from "@components/ui/ModalBlank";

const flattenItems = (items) =>
  items.flatMap((item) => [
    ...(item.path ? [{ ...item }] : []),
    ...(item.children ? flattenItems(item.children) : []),
  ]);

function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const pages = useMemo(
    () =>
      NAV_CONFIG.flatMap(({ section, items }) =>
        flattenItems(items).map((item) => ({
          ...item,
          section,
        })),
      ),
    [],
  );

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) return pages;

    return pages.filter(({ title, path, section }) =>
      `${title} ${path} ${section}`.toLowerCase().includes(value),
    );
  }, [pages, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      {/* Search Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className={`flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-primary-50 hover:text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 dark:hover:bg-primary-950/40 dark:hover:text-primary-400 ${
          open ? "bg-primary-50 text-primary-500 dark:bg-primary-950/40" : ""
        }`}
      >
        <IconSearch className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </button>

      {/* Search Modal */}
      <ModalBlank
        id="search-modal"
        isOpen={open}
        onClose={close}
        placement="top"
        size="lg"
      >
        <div className="flex h-[calc(100dvh-32px)] max-h-[640px] flex-col">
          {/* Search Header */}
          <div className="shrink-0 px-4 pb-3 pt-4 sm:px-5 sm:pb-4 sm:pt-5">
            <div className="flex items-center rounded-xl border border-border bg-input px-3 transition-colors focus-within:border-primary-300 focus-within:ring-4 focus-within:ring-primary-500/10 dark:focus-within:border-primary-500/50">
              <IconSearch
                className="h-[19px] w-[19px] shrink-0 text-muted-foreground"
                strokeWidth={1.8}
              />

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages..."
                className="h-12 min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-input-foreground outline-none placeholder:text-muted-foreground focus:ring-0 sm:text-[15px]"
              />

              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <IconX className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </button>
            </div>

            {/* Search Meta */}
            <div className="mt-3 flex items-center justify-between px-1">
              <p className="text-[12px] text-muted-foreground">
                {query
                  ? `${results.length} ${
                      results.length === 1 ? "result" : "results"
                    } found`
                  : "Quick access to pages"}
              </p>

              <span className="hidden rounded-md border border-border bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground sm:inline-flex">
                ESC to close
              </span>
            </div>
          </div>

          {/* Results */}
          <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-4 sm:px-4 sm:pb-5">
            {results.length ? (
              <div className="space-y-1">
                {results.map((page) => (
                  <Link
                    key={page.path}
                    to={page.path}
                    onClick={close}
                    className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-primary-50 focus-visible:bg-primary-50 focus-visible:outline-none dark:hover:bg-primary-950/30 dark:focus-visible:bg-primary-950/30"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold leading-5 text-foreground transition-colors group-hover:text-primary-500 dark:group-hover:text-primary-400">
                        {page.title}
                      </span>

                      <span className="mt-0.5 block truncate text-[11.5px] leading-4 text-muted-foreground">
                        {page.path}
                      </span>
                    </span>

                    <IconArrowUpRight
                      className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                      strokeWidth={1.8}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <IconSearch className="h-5 w-5" strokeWidth={1.8} />
                </div>

                <p className="mt-4 text-sm font-semibold text-foreground">
                  No pages found
                </p>

                <p className="mt-1 max-w-[260px] text-xs leading-5 text-muted-foreground">
                  Try searching with a different page name or keyword.
                </p>
              </div>
            )}
          </div>
        </div>
      </ModalBlank>
    </>
  );
}

export default HeaderSearch;
