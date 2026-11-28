import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IconBellRinging, IconX } from "@tabler/icons-react";
import Avatar from "@components/ui/Avatar";
import { ROUTES } from "@constants/routes";
import {
  getUnreadNotificationCount,
  listNotifications,
  markNotificationAsRead,
} from "@store/slices/notification.slice";
import { useNotificationStream } from "@hooks/useNotificationStream";
import { extractList } from "@utils/api.utils";

const isRead = (n) => Boolean(n?.read || n?.isRead || n?.readAt);

const getDeepLink = (notification) => {
  switch (notification?.resourceType) {
    case "LEAVE_REQUEST":
      return ROUTES.LEAVE?.ROOT;
    case "ATTENDANCE_SESSION":
      return ROUTES.ATTENDANCE?.ROOT;
    case "DAILY_SITE_REPORT":
      return notification?.resourceId && ROUTES.DAILY_REPORTS?.DETAILS
        ? ROUTES.DAILY_REPORTS.DETAILS.replace(":id", notification.resourceId)
        : ROUTES.DAILY_REPORTS?.ROOT || ROUTES.ATTENDANCE?.ROOT;
    case "DOCUMENT":
      return ROUTES.EMPLOYEES?.DOCUMENTS;
    default:
      return null;
  }
};

function NotificationRow({ notification, onClickRow }) {
  const isUserNotification = notification.type === "user" && notification.user;
  const unread = !isRead(notification);

  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => onClickRow?.(notification)}
      className={`group w-full text-left flex items-start gap-3 rounded-xl px-2.5 py-3 transition-colors hover:bg-primary-50 focus-visible:bg-primary-50 focus-visible:outline-none dark:hover:bg-primary-950/40 dark:focus-visible:bg-primary-950/40 ${
        unread ? "bg-primary-50/40 dark:bg-primary-950/20" : ""
      }`}
    >
      {isUserNotification ? (
        <Avatar name={notification.user.name} size={36} />
      ) : (
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary-50 text-primary-500 dark:bg-primary-950/40 dark:text-primary-400">
          <IconBellRinging className="h-[17px] w-[17px]" strokeWidth={1.8} />
        </span>
      )}

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13.5px] font-semibold leading-5 text-foreground">
            {isUserNotification && <span>{notification.user.name} </span>}
            {notification.title || "Notification"}
          </p>
          {unread && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
          )}
        </div>

        {(notification.message || notification.body) && (
          <p className="mt-0.5 line-clamp-2 text-[12px] leading-5 text-muted-foreground">
            {notification.message || notification.body}
          </p>
        )}
      </div>
    </button>
  );
}

export default function HeaderNotifications({ onViewAll }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  const { notificationsData, unreadCount, isListingNotifications } = useSelector(
    (state) => state.notification,
  );
  const isAuthenticated = useSelector((state) => Boolean(state.auth?.meData));

  // Connect live WebSocket stream with single-use subprotocol ticket
  useNotificationStream(isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(getUnreadNotificationCount());
    dispatch(listNotifications({ limit: 15 }));
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!open || !isAuthenticated) return;
    dispatch(listNotifications({ limit: 15 }));
  }, [dispatch, open, isAuthenticated]);

  const notifications = useMemo(
    () => extractList(notificationsData),
    [notificationsData],
  );

  const handleRowClick = (notification) => {
    if (!isRead(notification) && notification.id) {
      dispatch(markNotificationAsRead(notification.id));
    }
    const target = getDeepLink(notification);
    if (target) {
      setOpen(false);
      navigate(target);
    }
  };

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
        <IconBellRinging className="h-[19px] w-[19px]" strokeWidth={1.8} />

        {unreadCount > 0 && (
          <span className="absolute right-[6px] top-[5px] h-2 w-2 rounded-full bg-primary-500" />
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
                <span className="rounded-full bg-primary-500 px-2.5 py-1 text-[11px] font-semibold text-white tabular-nums">
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
            {isListingNotifications && notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length ? (
              notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onClickRow={handleRowClick}
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
              to={ROUTES.NOTIFICATIONS.ROOT}
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
