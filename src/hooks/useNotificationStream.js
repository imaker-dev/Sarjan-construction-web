import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  addNotification,
  createNotificationTicket,
  getUnreadNotificationCount,
  listNotifications,
} from "@store/slices/notification.slice";
import { clearAuthStorage, getCompanyId } from "@utils/auth.utils";

const buildStreamUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
  const trimmed = apiUrl.replace(/\/+$/, "");
  const wsBase = trimmed.startsWith("https://")
    ? trimmed.replace(/^https:\/\//, "wss://")
    : trimmed.startsWith("http://")
      ? trimmed.replace(/^http:\/\//, "ws://")
      : `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;

  return `${wsBase}/notifications/stream`;
};

/**
 * Connects to GET /api/v1/notifications/stream using a single-use 30s ticket
 * passed via the `sarjan-ticket.<ticket>` WebSocket subprotocol.
 * Implements reconnect + inbox catch-up per NOTIFICATIONS-REALTIME.md §7.
 */
export function useNotificationStream(enabled = true) {
  const dispatch = useDispatch();
  const meData = useSelector((state) => state.auth?.meData);
  const isAuthenticated = Boolean(meData);
  const companyId =
    getCompanyId() || meData?.company?.id || meData?.companyId || null;

  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const attemptsRef = useRef(0);
  const closedIntentionallyRef = useRef(false);

  useEffect(() => {
    if (!enabled || !isAuthenticated || !companyId) return;
    closedIntentionallyRef.current = false;

    const connect = async (isReconnect = false) => {
      if (closedIntentionallyRef.current) return;

      try {
        if (isReconnect) {
          // Catch up on any frames missed while offline (§7)
          dispatch(listNotifications({ limit: 15 }));
          dispatch(getUnreadNotificationCount());
        }

        const res = await dispatch(
          createNotificationTicket({ companyId }),
        ).unwrap();
        const ticket = res?.ticket || res?.data?.ticket;
        if (!ticket || closedIntentionallyRef.current) return;

        const ws = new WebSocket(buildStreamUrl(), `sarjan-ticket.${ticket}`);
        socketRef.current = ws;

        ws.onopen = () => {
          attemptsRef.current = 0;
          console.debug("[NotificationStream] connected");
        };

        ws.onmessage = (event) => {
          console.debug("[NotificationStream] frame:", event.data);
          try {
            const frame = JSON.parse(event.data);
            if (frame && (frame.notificationId || frame.id || frame.title)) {
              dispatch(addNotification(frame));
              window.dispatchEvent(
                new CustomEvent("sarjan:realtime-notification", { detail: frame }),
              );
              if (frame.title) {
                toast.info(frame.title);
              }
            }
          } catch {
            // ignore non-JSON heartbeat frames
          }
        };

        ws.onclose = (event) => {
          console.debug("[NotificationStream] closed:", event.code, event.reason);
          socketRef.current = null;
          if (closedIntentionallyRef.current) return;

          // 4403 (session revoked): clear auth storage and redirect to login
          if (event.code === 4403) {
            clearAuthStorage();
            window.location.replace("/auth");
            return;
          }
          // 4401 (unauthorized): stop reconnecting with dead auth
          if (event.code === 4401) {
            return;
          }

          const baseDelay = Math.min(30_000, 2000 * 2 ** attemptsRef.current);
          const jitter = Math.floor(Math.random() * 1000);
          attemptsRef.current += 1;
          timerRef.current = setTimeout(() => connect(true), baseDelay + jitter);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        if (closedIntentionallyRef.current) return;
        const baseDelay = Math.min(30_000, 3000 * 2 ** attemptsRef.current);
        const jitter = Math.floor(Math.random() * 1000);
        attemptsRef.current += 1;
        timerRef.current = setTimeout(() => connect(true), baseDelay + jitter);
      }
    };

    connect(false);

    return () => {
      closedIntentionallyRef.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [dispatch, enabled, isAuthenticated, companyId]);
}
