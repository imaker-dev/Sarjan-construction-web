import { useEffect, useRef, useState } from "react";
import { User, Inbox, LayoutGrid, LogOut, X } from "lucide-react";
import { useSelector } from "react-redux";
import Avatar from "@components/ui/Avatar";

const DEFAULT_MENU_ITEMS = [
  {
    icon: User,
    label: "My Profile",
    caption: "Account settings",
    href: "#",
  },
  {
    icon: Inbox,
    label: "My Inbox",
    caption: "Messages & email",
    href: "#",
  },
  {
    icon: LayoutGrid,
    label: "My Tasks",
    caption: "To-do & daily tasks",
    href: "#",
  },
];

function MenuRow({ icon: Icon, label, caption, href }) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-primary-50 focus-visible:bg-primary-50 focus-visible:outline-none dark:hover:bg-primary-950/40 dark:focus-visible:bg-primary-950/40"
    >
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary-50 text-primary-500 transition-colors group-hover:bg-primary-500 group-hover:text-white dark:bg-primary-950/40 dark:text-primary-400 dark:group-hover:bg-primary-500 dark:group-hover:text-white">
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </span>

      <span className="min-w-0">
        <span className="block truncate text-[13.5px] font-semibold text-foreground">
          {label}
        </span>
        <span className="block truncate text-[12px] text-muted-foreground">
          {caption}
        </span>
      </span>
    </a>
  );
}

export default function ProfileDropdown({
  menuItems = DEFAULT_MENU_ITEMS,
  onLogout,
}) {
  const { meData } = useSelector((state) => state.auth);

  const { displayName, role, loginId } = meData || {};

  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (open && window.innerWidth < 640) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <div className="relative inline-block">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative rounded-full p-2 transition-all duration-200 ease-in-out hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 dark:hover:bg-primary-950/40 dark:focus-visible:ring-primary-500/40"
      >
        <Avatar name={displayName || "Guest"} size={36} />
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] sm:hidden dark:bg-black/50"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Dropdown */}
      {open && (
        <div
          ref={containerRef}
          role="menu"
          className="fixed inset-x-3 bottom-3 z-50 origin-top-right rounded-2xl border border-border bg-card text-card-foreground shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18)] animate-[dropdown-in_0.16s_ease-out] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)] sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-[calc(100%+12px)] sm:w-[280px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <h3 className="text-[17px] font-bold text-foreground">
              User Profile
            </h3>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:hidden"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Identity */}
          <div className="flex items-center gap-3 px-4 pb-4">
            <Avatar name={displayName || "Guest"} size={56} />

            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-foreground">
                {displayName}
              </p>

              <p className="truncate text-[13px] font-medium text-primary-500 dark:text-primary-400">
                {role}
              </p>

              <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
                {loginId}
              </p>
            </div>
          </div>

          <div className="mx-4 border-t border-border" />

          {/* Menu Items */}
          <div className="max-h-[45vh] overflow-y-auto px-2.5 py-2 sm:max-h-none">
            {menuItems.map((item) => (
              <MenuRow key={item.label} {...item} />
            ))}
          </div>

          {/* Logout */}
          <div className="p-4 pt-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="btn btn-outline-danger w-full"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
              Logout
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropdown-in {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 639px) {
          [role="menu"] {
            animation: sheet-in 0.2s ease-out;
          }
        }

        @keyframes sheet-in {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
