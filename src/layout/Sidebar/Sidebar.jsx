import { Link, NavLink, useLocation } from "react-router-dom";
import SidebarLinkGroup from "./SidebarLinkGroup";
import SidebarFooter from "./SidebarFooter";
import { NAV_CONFIG } from "@config/navigation.config";
import { APP_CONFIG } from "@config/app.config";
import { IconChevronDown, IconPoint } from "@tabler/icons-react";

function Sidebar({ mobileOpen, setMobileOpen, collapsed, onLogout }) {
  const { pathname } = useLocation();

  const isItemActive = (item) => {
    if (item.path)
      return pathname === item.path || pathname.startsWith(`${item.path}/`);

    if (item.children) {
      return item.children.some(
        (child) =>
          pathname === child.path || pathname.startsWith(`${child.path}/`),
      );
    }

    return false;
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 dark:bg-black/50 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-[100dvh] w-64 shrink-0 flex-col border-border border-r bg-background  lg:static ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        {/* Logo */}
        <div
          className={`relative flex h-16 shrink-0 items-center px-5 ${
            collapsed ? "lg:justify-center lg:px-0" : ""
          }`}
        >
          <NavLink to="/" className="flex items-center overflow-hidden">
            {/* Collapsed icon - desktop only */}
            <img
              src={APP_CONFIG.LOGO_ICON}
              alt={`${APP_CONFIG.APP_NAME} logo`}
              className={`shrink-0 object-contain transition-all duration-300 ${
                collapsed
                  ? "hidden w-11 opacity-0 lg:block lg:opacity-100"
                  : "hidden w-0 opacity-0"
              }`}
            />

            {/* Full logo */}
            <img
              src={APP_CONFIG.LOGO}
              alt={`${APP_CONFIG.APP_NAME} logo`}
              className={`h-auto object-contain transition-all duration-300 ${
                collapsed
                  ? "w-32 opacity-100 lg:w-0 lg:opacity-0"
                  : "w-48 opacity-100"
              }`}
            />
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="no-scrollbar flex-1 space-y-7 overflow-y-auto p-5">
          {NAV_CONFIG.map((group) => (
            <div key={group.section}>
              <p
                className={`mb-2.5 h-4 text-[12px] font-semibold uppercase tracking-wide text-gray-800 dark:text-slate-400 ${
                  collapsed ? "lg:px-0 lg:text-center" : ""
                }`}
              >
                <span className={collapsed ? "lg:hidden" : ""}>
                  {group.section}
                </span>
                <span className={`hidden ${collapsed ? "lg:inline" : ""}`}>
                  •••
                </span>
              </p>

              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isItemActive(item);
                  const Icon = item.icon;

                  if (item.children) {
                    return (
                      <SidebarLinkGroup
                        key={item.title}
                        activecondition={active}
                      >
                        {(handleClick, open) => (
                          <div>
                            <Link
                              to="#"
                              title={collapsed ? item.title : undefined}
                              onClick={(e) => {
                                e.preventDefault();
                                handleClick();
                              }}
                              className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-3 transition-colors duration-200 ${
                                active || open
                                  ? "bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300"
                                  : "text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-800/60"
                              } ${collapsed ? "lg:justify-center lg:gap-0 lg:px-0" : "justify-between"}`}
                            >
                              <span
                                className={`flex items-center gap-3 overflow-hidden ${collapsed ? "lg:gap-0" : ""}`}
                              >
                                <Icon
                                  className="h-5 w-5 shrink-0"
                                  strokeWidth={1.75}
                                />

                                <span
                                  className={`overflow-hidden whitespace-nowrap text-[14px] font-normal transition-all duration-300 ${
                                    collapsed
                                      ? "lg:max-w-0 lg:opacity-0"
                                      : "lg:max-w-[160px] lg:opacity-100"
                                  }`}
                                >
                                  {item.title}
                                </span>
                              </span>

                              <span
                                className={`flex items-center overflow-hidden transition-all duration-300 ${
                                  collapsed
                                    ? "lg:max-w-0 lg:gap-0 lg:opacity-0"
                                    : "gap-2 lg:max-w-[80px] lg:opacity-100"
                                }`}
                              >
                                {item.badge && (
                                  <span className="rounded-full bg-primary-500 px-2.5 py-0.5 text-[11px] font-medium text-white">
                                    {item.badge.text || item.badge}
                                  </span>
                                )}

                                <IconChevronDown
                                  className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-300 dark:text-slate-500 ${
                                    open ? "rotate-180" : ""
                                  }`}
                                />
                              </span>
                            </Link>

                            <ul
                              className={`mt-1 overflow-hidden transition-all duration-300 ${
                                collapsed ? "lg:hidden" : ""
                              } ${open ? "mb-1 max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
                            >
                              {item.children.map((child) => {
                                const childActive =
                                  pathname === child.path ||
                                  pathname.startsWith(`${child.path}/`);

                                return (
                                  <li key={child.title}>
                                    <NavLink
                                      to={child.path}
                                      onClick={() => setMobileOpen(false)}
                                      className={`grid grid-cols-[20px_1fr] items-center gap-3 rounded-lg px-4 py-2 text-[14px] font-normal leading-5 transition-colors duration-200 ${
                                        childActive
                                          ? "bg-primary-500 text-white shadow-sm shadow-primary-200/40 dark:shadow-primary-950/30"
                                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                                      }`}
                                    >
                                      <IconPoint
                                        className="h-5 w-5 shrink-0"
                                        strokeWidth={1.75}
                                      />
                                      <span className="truncate">
                                        {child.title}
                                      </span>
                                    </NavLink>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </SidebarLinkGroup>
                    );
                  }

                  return (
                    <li key={item.title}>
                      <NavLink
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        title={collapsed ? item.title : undefined}
                        className={`flex items-center gap-2 rounded-lg px-3 py-3 transition-colors duration-200 ${
                          active
                            ? "bg-primary-500 text-white shadow-sm shadow-primary-200/40 dark:shadow-primary-950/30"
                            : "text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-800/60"
                        } ${collapsed ? "lg:justify-center lg:gap-0 lg:px-0" : "justify-between"}`}
                      >
                        <span
                          className={`flex items-center gap-3 overflow-hidden ${collapsed ? "lg:gap-0" : ""}`}
                        >
                          <Icon
                            className="h-5 w-5 shrink-0"
                            strokeWidth={1.75}
                          />

                          <span
                            className={`overflow-hidden whitespace-nowrap text-[14px] font-normal transition-all duration-300 ${
                              collapsed
                                ? "lg:max-w-0 lg:opacity-0"
                                : "lg:max-w-[160px] lg:opacity-100"
                            }`}
                          >
                            {item.title}
                          </span>
                        </span>

                        {item.badge && (
                          <span
                            className={`shrink-0 overflow-hidden rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all duration-300 ${
                              active
                                ? "bg-white/25 text-white"
                                : "bg-primary-500 text-white"
                            } ${collapsed ? "lg:max-w-0 lg:px-0 lg:opacity-0" : "lg:max-w-[60px] lg:opacity-100"}`}
                          >
                            {item.badge.text || item.badge}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <SidebarFooter collapsed={collapsed} onLogout={onLogout} />
      </aside>
    </>
  );
}

export default Sidebar;
