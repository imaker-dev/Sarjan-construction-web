import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import notificationApi from "@store/api/notification.api";
import { toast } from "sonner";

// List notifications
export const listNotifications = createAsyncThunk(
  "notification/listNotifications",
  async (params = {}) => {
    const res = await notificationApi.listNotificationsApi(params);
    return res.data;
  },
);

// Get unread count
export const getUnreadNotificationCount = createAsyncThunk(
  "notification/getUnreadNotificationCount",
  async () => {
    const res = await notificationApi.getUnreadNotificationCountApi();
    return res.data;
  },
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  "notification/markNotificationAsRead",
  async (id) => {
    const res = await notificationApi.markNotificationAsReadApi(id);
    return { id, ...res.data };
  },
);

// Mint single-use 30s WebSocket ticket
export const createNotificationTicket = createAsyncThunk(
  "notification/createNotificationTicket",
  async (values = {}) => {
    const res = await notificationApi.createNotificationTicketApi(values);
    return res.data;
  },
);

const notificationSlice = createSlice({
  name: "notification",

  initialState: {
    isListingNotifications: false,
    isFetchingUnreadCount: false,
    isMarkingNotificationAsRead: false,
    isCreatingNotificationTicket: false,

    unreadCount: 0,
    notificationsData: null,
    nextCursor: null,
    hasMore: false,
  },

  reducers: {
    // Add live notification frame received via WebSocket (deduped by id / notificationId)
    addNotification: (state, action) => {
      const frame = action.payload;
      if (!frame) return;

      const id = frame.notificationId || frame.id;
      if (!id) return;

      const normalized = {
        ...frame,
        id,
        readAt: frame.readAt ?? null,
      };

      const existing = Array.isArray(state.notificationsData)
        ? state.notificationsData
        : Array.isArray(state.notificationsData?.data)
          ? state.notificationsData.data
          : [];

      const exists = existing.some((item) => item.id === id);
      if (exists) return;

      state.notificationsData = [normalized, ...existing];
      if (!normalized.readAt && !normalized.read && !normalized.isRead) {
        state.unreadCount += 1;
      }
    },

    clearNotificationsData: (state) => {
      state.notificationsData = null;
      state.unreadCount = 0;
      state.nextCursor = null;
      state.hasMore = false;
    },
  },

  extraReducers: (builder) => {
    builder

      // Mint WS ticket
      .addCase(createNotificationTicket.pending, (state) => {
        state.isCreatingNotificationTicket = true;
      })
      .addCase(createNotificationTicket.fulfilled, (state) => {
        state.isCreatingNotificationTicket = false;
      })
      .addCase(createNotificationTicket.rejected, (state) => {
        state.isCreatingNotificationTicket = false;
      })

      // Unread count
      .addCase(getUnreadNotificationCount.pending, (state) => {
        state.isFetchingUnreadCount = true;
      })
      .addCase(getUnreadNotificationCount.fulfilled, (state, action) => {
        state.isFetchingUnreadCount = false;
        const payload = action.payload;
        const count =
          typeof payload === "number"
            ? payload
            : payload?.unreadCount ??
              payload?.count ??
              payload?.data?.unreadCount ??
              payload?.data?.count ??
              0;
        state.unreadCount = Number(count) || 0;
      })
      .addCase(getUnreadNotificationCount.rejected, (state) => {
        state.isFetchingUnreadCount = false;
      })

      // List notifications
      .addCase(listNotifications.pending, (state) => {
        state.isListingNotifications = true;
      })
      .addCase(listNotifications.fulfilled, (state, action) => {
        state.isListingNotifications = false;
        const payload = action.payload;
        const incoming = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.notifications)
            ? payload.notifications
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.items)
                ? payload.items
                : [];
        const isAppend = Boolean(action.meta?.arg?.cursor);

        if (isAppend) {
          const existing = Array.isArray(state.notificationsData)
            ? state.notificationsData
            : Array.isArray(state.notificationsData?.data)
              ? state.notificationsData.data
              : [];
          const seen = new Set(existing.map((n) => n.id));
          state.notificationsData = [
            ...existing,
            ...incoming.filter((n) => !seen.has(n.id)),
          ];
        } else {
          state.notificationsData = incoming;
        }

        state.nextCursor = payload?.nextCursor ?? payload?.cursor ?? null;
        state.hasMore = Boolean(state.nextCursor);
      })
      .addCase(listNotifications.rejected, (state, action) => {
        state.isListingNotifications = false;
        toast.error(
          action.error.message || "Failed to fetch notifications",
        );
      })

      // Mark notification as read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.isMarkingNotificationAsRead = true;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.isMarkingNotificationAsRead = false;

        const updatedNotification = action.payload;
        let decremented = false;

        const updateNotificationInList = (notifications) =>
          notifications?.map((notification) => {
            if (notification.id === updatedNotification.id) {
              if (
                !notification.read &&
                !notification.isRead &&
                !notification.readAt
              ) {
                decremented = true;
              }
              return {
                ...notification,
                ...updatedNotification,
                read: true,
                readAt: updatedNotification.readAt || new Date().toISOString(),
              };
            }
            return notification;
          });

        if (Array.isArray(state.notificationsData)) {
          state.notificationsData = updateNotificationInList(
            state.notificationsData,
          );
        } else if (Array.isArray(state.notificationsData?.data)) {
          state.notificationsData.data = updateNotificationInList(
            state.notificationsData.data,
          );
        }

        if (decremented && state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.isMarkingNotificationAsRead = false;
        toast.error(
          action.error.message || "Failed to mark notification as read",
        );
      });
  },
});

export const { addNotification, clearNotificationsData } =
  notificationSlice.actions;

export default notificationSlice.reducer;
