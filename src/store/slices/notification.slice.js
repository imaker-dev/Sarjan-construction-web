
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import notificationApi from "@store/api/notification.api";
import { toast } from "sonner";

// Create notification ticket
export const createNotificationTicket = createAsyncThunk(
  "notification/createNotificationTicket",
  async (values) => {
    const res = await notificationApi.createNotificationTicketApi(values);
    return res.data;
  },
);

// List notifications
export const listNotifications = createAsyncThunk(
  "notification/listNotifications",
  async (values = {}) => {
    const res = await notificationApi.listNotificationsApi(values);
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

const notificationSlice = createSlice({
  name: "notification",

  initialState: {
    isCreatingNotificationTicket: false,
    isListingNotifications: false,
    isMarkingNotificationAsRead: false,

    notificationTicket: null,
    notificationsData: null,
  },

  reducers: {
    // Add notification received through WebSocket
    addNotification: (state, action) => {
      const notification = action.payload;

      if (!notification) return;

      const notifications = Array.isArray(state.notificationsData)
        ? state.notificationsData
        : state.notificationsData?.data;

      if (Array.isArray(notifications)) {
        const exists = notifications.some(
          (item) => item.id === notification.id,
        );

        if (!exists) {
          if (Array.isArray(state.notificationsData)) {
            state.notificationsData.unshift(notification);
          } else {
            state.notificationsData.data.unshift(notification);
          }
        }
      } else {
        state.notificationsData = [notification];
      }
    },

    clearNotificationsData: (state) => {
      state.notificationsData = null;
      state.notificationTicket = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Create notification ticket
      .addCase(createNotificationTicket.pending, (state) => {
        state.isCreatingNotificationTicket = true;
      })
      .addCase(createNotificationTicket.fulfilled, (state, action) => {
        state.isCreatingNotificationTicket = false;
        state.notificationTicket = action.payload;
      })
      .addCase(createNotificationTicket.rejected, (state, action) => {
        state.isCreatingNotificationTicket = false;
        toast.error(
          action.error.message || "Failed to create notification ticket",
        );
      })

      // List notifications
      .addCase(listNotifications.pending, (state) => {
        state.isListingNotifications = true;
      })
      .addCase(listNotifications.fulfilled, (state, action) => {
        state.isListingNotifications = false;
        state.notificationsData = action.payload;
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

        const updateNotificationInList = (notifications) =>
          notifications?.map((notification) =>
            notification.id === updatedNotification.id
              ? { ...notification, ...updatedNotification }
              : notification,
          );

        if (Array.isArray(state.notificationsData)) {
          state.notificationsData = updateNotificationInList(
            state.notificationsData,
          );
        } else if (Array.isArray(state.notificationsData?.data)) {
          state.notificationsData.data = updateNotificationInList(
            state.notificationsData.data,
          );
        }

        toast.success(
          updatedNotification?.message ||
            "Notification marked as read!",
        );
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.isMarkingNotificationAsRead = false;
        toast.error(
          action.error.message || "Failed to mark notification as read",
        );
      });
  },
});

export const {
  addNotification,
  clearNotificationsData,
} = notificationSlice.actions;

export default notificationSlice.reducer;
