import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { IconBell, IconX } from "@tabler/icons-react";
import Avatar from "@components/ui/Avatar";

const NOTIFICATIONS = [
  {
    id: 1,
    type: "user",
    user: {
      name: "Roman",
    },
    title: "Joined the Team!",
    message: "Please welcome Roman to the team.",
    read: false,
  },
  {
    id: 2,
    type: "user",
    user: {
      name: "Salma",
    },
    title: "Sent you a new message",
    message: "You have a new message in your inbox.",
    read: false,
  },
  {
    id: 3,
    type: "common",
    title: "Payment received",
    message: "Your payment of $250 has been successfully processed.",
    read: false,
  },
  {
    id: 4,
    type: "user",
    user: {
      name: "Jolly",
    },
    title: "Completed tasks",
    message: "Jolly has completed the assigned tasks.",
    read: false,
  },
  {
    id: 5,
    type: "common",
    title: "System maintenance",
    message: "Scheduled maintenance will begin tonight at 11:00 PM.",
    read: true,
  },
];

function NotificationRow({ notification }) {
  const isUserNotification = notification.type === "user";

  return (
    <Link
      to="#"
      role="menuitem"
      className="group flex items-start gap-3 rounded-xl px-2.5 py-3 transition-colors hover:bg-primary-50 focus-visible:bg-primary-50 focus-visible:outline-none dark:hover:bg-primary-950/40 dark:focus-visible:bg-primary-950/40"
    >
      {isUserNotification && notification.user ? (
        <Avatar name={notification.user.name} size={36} />
      ) : (
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary-50 text-primary-500 dark:bg-primary-950/40 dark:text-primary-400">
          <IconBell className="h-[17px] w-[17px]" strokeWidth={1.8} />
        </span>
      )}

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[13.5px] font-semibold leading-5 text-foreground">
          {isUserNotification && notification.user && (
            <span>{notification.user.name} </span>
          )}
          {notification.title}
        </p>

        <p className="mt-0.5 line-clamp-2 text-[12px] leading-5 text-muted-foreground">
          {notification.message}
        </p>
      </div>
    </Link>
  );
}

export default function HeaderNotifications({
  notifications = NOTIFICATIONS,
  onViewAll,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  useEffect(() => {
    const handleClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open || window.innerWidth >= 640) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="relative inline-block">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-primary-50 hover:text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 dark:hover:bg-primary-950/40 dark:hover:text-primary-400 ${
          open ? "bg-primary-50 text-primary-500 dark:bg-primary-950/40" : ""
        }`}
      >
        <IconBell className="h-[19px] w-[19px]" strokeWidth={1.8} />

        {unreadCount > 0 && (
          <span className="absolute right-[7px] top-[6px] h-2.5 w-2.5 rounded-full bg-primary-500 ring-2 ring-card" />
        )}
      </button>

      {/* Mobile Backdrop */}
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
          className="fixed inset-x-3 bottom-3 z-50 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18)] animate-[notification-dropdown-in_160ms_ease-out] sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-[calc(100%+12px)] sm:w-[350px] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4">
            <h3 className="text-[16px] font-semibold text-foreground">
              Notifications
            </h3>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                  {unreadCount} new
                </span>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:hidden"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="max-h-[55vh] overflow-y-auto px-3 py-2 sm:max-h-[440px]">
            {notifications.length ? (
              notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                />
              ))
            ) : (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <Link
              to="/notifications"
              onClick={() => {
                setOpen(false);
                onViewAll?.();
              }}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-primary-200 text-[13.5px] font-medium text-primary-500 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 dark:border-primary-800 dark:hover:bg-primary-950/40"
            >
              See all Notifications
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @keyframes notification-dropdown-in {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
