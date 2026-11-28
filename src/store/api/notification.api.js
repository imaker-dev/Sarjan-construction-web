import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      // List own notifications (cursor-paged, optional unreadOnly)
      listNotificationsApi: (params = {}) => {
        return Api.get("/notifications", { params });
      },

      // Own unread badge count
      getUnreadNotificationCountApi: () => {
        return Api.get("/notifications/unread-count");
      },

      // Mark one notification as read
      markNotificationAsReadApi: (id) => {
        return Api.post(`/notifications/${id}/read`);
      },

      // Mint single-use 30s WebSocket ticket
      createNotificationTicketApi: (values = {}) => {
        return Api.post("/notifications/ticket", values);
      },
    };
