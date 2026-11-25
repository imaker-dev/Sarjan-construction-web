import Api from "../api-client";

const dailyReportApi = {
  // 1. List company daily reports with query filters
  listDailyReportsApi: (params = {}) => {
    return Api.get("/attendance/daily-reports", { params });
  },

  // 2. Get single daily report full details with labour breakdown
  getDailyReportDetailsApi: (id) => {
    return Api.get(`/attendance/daily-reports/${id}`);
  },

  // 3. Trigger on-demand muster calculation (Site or Head Office)
  recalculateDailyReportApi: ({ siteId, headOfficeId, businessDate }) => {
    return Api.post("/attendance/daily-reports/calculate", {
      ...(siteId ? { siteId } : {}),
      ...(headOfficeId ? { headOfficeId } : {}),
      businessDate,
    });
  },

  // 4. Final lock for monthly payroll & contractor billing
  lockDailyReportApi: ({ id, reason }) => {
    return Api.post(`/attendance/daily-reports/${id}/lock`, { reason });
  },

  // 5. Get tamper-evident audit history
  getDailyReportAuditTrailApi: (id) => {
    return Api.get(`/attendance/daily-reports/${id}/audit-trail`);
  },

  // 6. Pre-lock emergency labour summary adjustment (HO Admin override)
  updateLabourSummaryApi: ({ reportId, summaryId, values }) => {
    return Api.patch(
      `/attendance/daily-reports/${reportId}/labour-summary/${summaryId}`,
      values
    );
  },

  // 7. Update Daily Report header (weather, stoppage hours, diary notes, safety)
  updateDailyReportHeaderApi: ({ id, values }) => {
    return Api.patch(`/attendance/daily-reports/${id}`, values);
  },

  // 8. Submit report for approval (Site Supervisor)
  submitDailyReportApi: (id) => {
    return Api.post(`/attendance/daily-reports/${id}/submit`);
  },

  // 9. Approve report (Project Manager)
  approveDailyReportApi: (id) => {
    return Api.post(`/attendance/daily-reports/${id}/approve`);
  },

  // 10. Reject report and request revisions (Project Manager)
  rejectDailyReportApi: ({ id, reason }) => {
    return Api.post(`/attendance/daily-reports/${id}/reject`, { reason });
  },

  // 11. Export single Daily Site Report as PDF or Excel (.xlsx)
  exportDailyReportApi: ({ id, format }) => {
    return Api.get(`/attendance/daily-reports/${id}/export`, {
      params: { format },
      responseType: "blob",
    });
  },

  // 12. Export Muster Roll (Office / Site / Department) as PDF or Excel (.xlsx)
  exportMusterRollApi: (params = {}) => {
    return Api.get("/attendance/muster-roll/export", {
      params,
      responseType: "blob",
    });
  },

  // 13. Unified trigger (optional recalculate) & export endpoint
  triggerReportExportApi: (payload) => {
    return Api.post("/attendance/reports/export", payload, {
      responseType: "blob",
    });
  },
};

export default dailyReportApi;
