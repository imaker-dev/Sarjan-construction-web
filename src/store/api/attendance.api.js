
import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      // Get active attendance session
      getActiveSessionApi: (params = {}) => {
        return Api.get("/attendance/sessions/active", { params });
      },

      // Clock in
      punchInApi: (values) => {
        return Api.post("/attendance/punch-in", values);
      },

      // Start break
      startBreakApi: (values) => {
        return Api.post("/attendance/breaks/start", values);
      },

      // End break
      endBreakApi: (values) => {
        return Api.post("/attendance/breaks/end", values);
      },

      // Clock out
      punchOutApi: (values) => {
        return Api.post("/attendance/punch-out", values);
      },
    };
