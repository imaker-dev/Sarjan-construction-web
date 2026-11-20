
import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      // ----------------------------------------------
      // ATTENDANCE POLICIES
      // ----------------------------------------------

      getAttendancePoliciesApi: (params = {}) => {
        return Api.get("/attendance/policies", { params });
      },

      getAttendancePolicyApi: (id) => {
        return Api.get(`/attendance/policies/${id}`);
      },

      getEffectiveAttendancePolicyApi: (params = {}) => {
        return Api.get("/attendance/policies/effective", { params });
      },

      createAttendancePolicyApi: (values) => {
        return Api.post("/attendance/policies", values);
      },

      updateAttendancePolicyApi: ({ id, values }) => {
        return Api.patch(`/attendance/policies/${id}`, values);
      },

      // ----------------------------------------------
      // SAFETY TOOLBOX TALK (TVT)
      // ----------------------------------------------

      getTvtSessionsApi: (params = {}) => {
        return Api.get("/attendance/tvt", { params });
      },

      getTvtSessionApi: (id) => {
        return Api.get(`/attendance/tvt/${id}`);
      },

      createTvtSessionApi: (values) => {
        return Api.post("/attendance/tvt", values);
      },

      addTvtAttendeesApi: ({ id, employeeIds }) => {
        return Api.post(`/attendance/tvt/${id}/attendees`, {
          employeeIds,
        });
      },

      // ----------------------------------------------
      // ACTIVE SESSION
      // ----------------------------------------------

      getActiveSessionApi: (params = {}) => {
        return Api.get("/attendance/sessions/active", { params });
      },

      // ----------------------------------------------
      // PUNCH OPERATIONS
      // ----------------------------------------------

      punchInApi: (values) => {
        return Api.post("/attendance/punch-in", values);
      },

      punchOutApi: (values) => {
        return Api.post("/attendance/punch-out", values);
      },

      // ----------------------------------------------
      // KIOSK OPERATIONS
      // ----------------------------------------------

      batchPunchInApi: (values) => {
        return Api.post("/attendance/kiosk/batch-punch-in", values);
      },

      batchPunchOutApi: (values) => {
        return Api.post("/attendance/kiosk/batch-punch-out", values);
      },

      syncAttendanceApi: (values) => {
        return Api.post("/attendance/kiosk/sync", values);
      },

      // ----------------------------------------------
      // BREAKS
      // ----------------------------------------------

      startBreakApi: (values) => {
        return Api.post("/attendance/breaks/start", values);
      },

      endBreakApi: (values) => {
        return Api.post("/attendance/breaks/end", values);
      },

      // ----------------------------------------------
      // ATTENDANCE SESSIONS
      // ----------------------------------------------

      getAttendanceSessionsApi: (params = {}) => {
        return Api.get("/attendance/sessions", { params });
      },

      getAttendanceSessionApi: (id) => {
        return Api.get(`/attendance/sessions/${id}`);
      },

      regularizeAttendanceSessionApi: ({ id, values }) => {
        return Api.post(`/attendance/sessions/${id}/regularize`, values);
      },

      // ----------------------------------------------
      // DAILY SUMMARY
      // ----------------------------------------------

      getAttendanceDailySummaryApi: (params = {}) => {
        return Api.get("/attendance/daily-summary", { params });
      },

      // ----------------------------------------------
      // MUSTER ROLL
      // ----------------------------------------------

      getMusterRollApi: (params = {}) => {
        return Api.get("/attendance/muster-roll", { params });
      },
    };
