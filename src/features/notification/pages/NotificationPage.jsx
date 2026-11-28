import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IconBell, IconCheck, IconRefresh } from "@tabler/icons-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import StatusBadge from "@components/ui/StatusBadge";
import { ROUTES } from "@constants/routes";
import {
  getUnreadNotificationCount,
  listNotifications,
  markNotificationAsRead,
} from "@store/slices/notification.slice";
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

export default function NotificationPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // "all" | "unread"

  const {
    notificationsData,
    unreadCount,
    isListingNotifications,
    isMarkingNotificationAsRead,
    nextCursor,
    hasMore,
  } = useSelector((state) => state.notification);

  const loadNotifications = useCallback(
    (cursor) => {
      const params = {
        limit: 50,
        ...(filter === "unread" ? { unreadOnly: true } : {}),
        ...(cursor ? { cursor } : {}),
      };
      dispatch(listNotifications(params));
      if (!cursor) {
        dispatch(getUnreadNotificationCount());
      }
    },
    [dispatch, filter]
  );

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const notifications = useMemo(
    () => extractList(notificationsData),
    [notificationsData]
  );

  return (
    <div className="space-y-5">
      <PageHeaderBanner
        title="Notifications"
        subtitle="Stay updated on leave approvals, attendance alerts, and site activity."
      />

      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800/60">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === "all"
                  ? "bg-white text-slate-800 shadow-xs dark:bg-[#1C2536] dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === "unread"
                  ? "bg-white text-slate-800 shadow-xs dark:bg-[#1C2536] dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <button
            type="button"
            onClick={() => loadNotifications()}
            disabled={isListingNotifications}
            className="btn btn-outline btn-xs inline-flex items-center gap-1.5"
          >
            <IconRefresh
              size={14}
              className={isListingNotifications ? "animate-spin" : ""}
            />
            <span>Refresh</span>
          </button>
        </div>

        {/* List */}
        {isListingNotifications && notifications.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-400">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-14 px-4 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <IconBell size={22} />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Your inbox is up to date.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {notifications.map((item) => {
              const unread = !isRead(item);
              const deepLink = getDeepLink(item);
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (unread && item.id) {
                      dispatch(markNotificationAsRead(item.id));
                    }
                    if (deepLink) {
                      navigate(deepLink);
                    }
                  }}
                  className={`px-5 py-4 flex items-start justify-between gap-4 transition-colors ${
                    deepLink ? "cursor-pointer" : ""
                  } ${
                    unread
                      ? "bg-indigo-50/30 dark:bg-indigo-500/5"
                      : "hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        unread
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400"
                      }`}
                    >
                      <IconBell size={17} />
                    </span>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">
                          {item.title || "Notification"}
                        </p>
                        {unread && (
                          <StatusBadge label="New" tone="indigo" size="xs" />
                        )}
                      </div>
                      {(item.message || item.body) && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {item.message || item.body}
                        </p>
                      )}
                      {item.createdAt && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                          {new Date(item.createdAt).toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                  </div>

                  {unread && item.id && (
                    <button
                      type="button"
                      disabled={isMarkingNotificationAsRead}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(markNotificationAsRead(item.id));
                      }}
                      className="btn btn-outline btn-xs shrink-0 inline-flex items-center gap-1"
                    >
                      <IconCheck size={13} />
                      <span>Mark read</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Cursor Pagination */}
        {hasMore && nextCursor && (
          <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-700/60 flex justify-center">
            <button
              type="button"
              disabled={isListingNotifications}
              onClick={() => loadNotifications(nextCursor)}
              className="btn btn-secondary btn-sm"
            >
              {isListingNotifications ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
