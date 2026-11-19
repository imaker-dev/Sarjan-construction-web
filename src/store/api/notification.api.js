
import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      // Create notification ticket
      createNotificationTicketApi: (values) => {
        return Api.post("/notifications/ticket", values);
      },

      // List notifications
      listNotificationsApi: (values = {}) => {
        return Api.get("/notifications", { params: values });
      },

      // Mark notification as read
      markNotificationAsReadApi: (id) => {
        return Api.post(`/notifications/${id}/read`);
      },
    };
