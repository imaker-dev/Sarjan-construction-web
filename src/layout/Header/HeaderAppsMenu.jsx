import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { ROUTES } from "@constants/routes";
import {
  IconCalendar,
  IconCategory,
  IconChevronDown,
  IconChevronRight,
  IconGridDots,
  IconMail,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";

const HEADER_MENUS = [
  {
    title: "Apps",
    children: [
      {
        title: "Chat Application",
        subtitle: "Messages & Emails",
        icon: "💬",
        path: ROUTES.APPS.CHAT,
      },
      {
        title: "Invoice App",
        subtitle: "Get latest invoice",
        icon: "💰",
        path: ROUTES.APPS.INVOICE,
      },
      {
        title: "Contact Application",
        subtitle: "2 Unsaved Contacts",
        icon: "📇",
        path: ROUTES.APPS.CONTACTS,
      },
      {
        title: "Email App",
        subtitle: "Get new emails",
        icon: "✉️",
        path: ROUTES.APPS.EMAIL,
      },
      {
        title: "Todo App",
        subtitle: "Completed task",
        icon: "🛒",
        path: ROUTES.APPS.TODO,
      },
      {
        title: "Calendar App",
        subtitle: "Get Dates",
        icon: "📅",
        path: ROUTES.APPS.CALENDAR,
      },
      {
        title: "Tickets App",
        subtitle: "Create new ticket",
        icon: "🎫",
        path: ROUTES.APPS.TICKETS,
      },
      {
        title: "Contact List",
        subtitle: "Create new contact",
        icon: "🧩",
        path: ROUTES.APPS.CONTACT_LIST,
      },
    ],
  },
  { title: "Calendar", path: "/calendar" },
  { title: "Email", path: "/email" },
];

function HeaderAppsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAppsOpen, setMobileAppsOpen] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    const handler = ({ target }) => {
      if (ref.current && !ref.current.contains(target)) setIsOpen(false);
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const appsMenu = HEADER_MENUS.find((menu) => menu.children);
  const directMenus = HEADER_MENUS.filter((menu) => !menu.children);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Desktop */}
      <div ref={ref} className="hidden items-center gap-1 lg:flex">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-[350ms] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Apps
            <IconChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute left-0 z-50 mt-2 w-[95vw] max-w-3xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-[#2A3548] dark:bg-[#1C2536] dark:shadow-black/30">
              <div className="grid grid-cols-1 gap-2 p-5 sm:grid-cols-2">
                {appsMenu.children.map((app) => (
                  <NavLink
                    key={app.title}
                    to={app.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-start gap-3 rounded-xl p-2 transition-colors duration-[350ms] hover:bg-gray-50 dark:hover:bg-white/10"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base bg-gray-100`}
                    >
                      {app.icon}
                    </span>

                    <span>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        {app.title}
                      </p>
                      <p className="text-xs text-gray-400">{app.subtitle}</p>
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>

        {directMenus.map((menu) => (
          <NavLink
            key={menu.title}
            to={menu.path}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-[350ms] hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-white"
          >
            {menu.title}
          </NavLink>
        ))}
      </div>

      {/* Mobile Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10 lg:hidden"
        aria-label="Open navigation"
      >
        <IconGridDots className="h-5 w-5" strokeWidth={1.8} />
      </button>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 dark:bg-black/50 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobile}
      />

      {/* Mobile Drawer */}
      <aside
        className={`fixed right-0 top-0 z-[60] flex h-[100dvh] w-[min(75vw,300px)] flex-col border-l border-border bg-card text-card-foreground shadow-2xl transition-transform duration-300 ease-out dark:shadow-black/40 lg:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
          <h2 className="text-base font-semibold text-foreground">
            Navigation
          </h2>

          <button
            type="button"
            onClick={closeMobile}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            aria-label="Close navigation"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="no-scrollbar flex-1 overflow-y-auto px-3 py-3">
          {/* Calendar */}
          <NavLink
            to="/calendar"
            onClick={closeMobile}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <IconCalendar
              className="h-[19px] w-[19px] text-muted-foreground"
              strokeWidth={1.7}
            />
            Calendar
          </NavLink>

          {/* Email */}
          <NavLink
            to="/email"
            onClick={closeMobile}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <IconMail
              className="h-[19px] w-[19px] text-muted-foreground"
              strokeWidth={1.7}
            />
            Email
          </NavLink>

          {/* Apps */}
          <div className="mt-1">
            <button
              type="button"
              onClick={() => setMobileAppsOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <span className="flex items-center gap-3">
                <IconCategory
                  className="h-[19px] w-[19px] text-muted-foreground"
                  strokeWidth={1.7}
                />
                Apps
              </span>

              <IconChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
                  mobileAppsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                mobileAppsOpen
                  ? "max-h-[1000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="mt-1 space-y-0.5 pl-3">
                {appsMenu.children.map((app) => (
                  <NavLink
                    key={app.title}
                    to={app.path}
                    onClick={closeMobile}
                    className="flex items-center gap-2.5 rounded-xl p-2 transition-colors hover:bg-muted"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm">
                      {app.icon}
                    </span>

                    <span className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-foreground">
                        {app.title}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {app.subtitle}
                      </p>
                    </span>

                    <IconChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default HeaderAppsMenu;
