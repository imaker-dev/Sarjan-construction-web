import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import dailyReportApi from "@store/api/dailyReport.api";
import { downloadFile } from "@utils/download.utils";
import { toast } from "sonner";

const extractError = (err, fallback) => {
  if (typeof err === "string") return err;
  return err?.message || err?.error?.message || fallback;
};

const extractFilename = (headers, fallback) => {
  const disposition = headers?.["content-disposition"] || headers?.["Content-Disposition"];
  if (typeof disposition === "string") {
    const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }
  return fallback;
};

const triggerBlobDownload = (res, fallbackName) => {
  const fileName = extractFilename(res.headers, fallbackName);
  downloadFile({ data: res.data, fileName });
  return { fileName };
};

// 1. List daily reports
export const listDailyReports = createAsyncThunk(
  "dailyReport/listDailyReports",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await dailyReportApi.listDailyReportsApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 2. Get single report details
export const getDailyReportDetails = createAsyncThunk(
  "dailyReport/getDailyReportDetails",
  async (id, { rejectWithValue }) => {
    try {
      const res = await dailyReportApi.getDailyReportDetailsApi(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 3. Trigger recalculate (Site or Head Office)
export const recalculateDailyReport = createAsyncThunk(
  "dailyReport/recalculateDailyReport",
  async ({ siteId, headOfficeId, businessDate }, { rejectWithValue }) => {
    try {
      const res = await dailyReportApi.recalculateDailyReportApi({
        siteId,
        headOfficeId,
        businessDate,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 4. Lock report for payroll & billing
export const lockDailyReport = createAsyncThunk(
  "dailyReport/lockDailyReport",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const res = await dailyReportApi.lockDailyReportApi({ id, reason });
      return { id, data: res.data };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 5. Get audit trail
export const getDailyReportAuditTrail = createAsyncThunk(
  "dailyReport/getDailyReportAuditTrail",
  async (id, { rejectWithValue }) => {
    try {
      const res = await dailyReportApi.getDailyReportAuditTrailApi(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 6. Pre-lock labour adjustment
export const updateLabourSummary = createAsyncThunk(
  "dailyReport/updateLabourSummary",
  async ({ reportId, summaryId, values }, { rejectWithValue }) => {
    try {
      const res = await dailyReportApi.updateLabourSummaryApi({
        reportId,
        summaryId,
        values,
      });
      return { reportId, summaryId, data: res.data };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 7. Update Daily Report Header (weather, notes, safety)
export const updateDailyReportHeader = createAsyncThunk(
  "dailyReport/updateDailyReportHeader",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const res = await dailyReportApi.updateDailyReportHeaderApi({ id, values });
      return { id, data: res.data };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 8. Submit Daily Report
export const submitDailyReport = createAsyncThunk(
  "dailyReport/submitDailyReport",
  async (id, { rejectWithValue }) => {
    try {
      const res = await dailyReportApi.submitDailyReportApi(id);
      return { id, data: res.data };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 9. Approve Daily Report
export const approveDailyReport = createAsyncThunk(
  "dailyReport/approveDailyReport",
  async (id, { rejectWithValue }) => {
    try {
      const res = await dailyReportApi.approveDailyReportApi(id);
      return { id, data: res.data };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 10. Reject Daily Report
export const rejectDailyReport = createAsyncThunk(
  "dailyReport/rejectDailyReport",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const res = await dailyReportApi.rejectDailyReportApi({ id, reason });
      return { id, data: res.data };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 11. Export single Daily Site Report (pdf | xlsx)
export const exportDailySiteReport = createAsyncThunk(
  "dailyReport/exportDailySiteReport",
  async ({ id, format = "pdf", fileName }, { rejectWithValue }) => {
    try {
      const res = await dailyReportApi.exportDailyReportApi({ id, format });
      return triggerBlobDownload(res, fileName || `daily-site-report.${format}`);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 12. Export Muster Roll (Office / Site / Department) (pdf | xlsx)
export const exportMusterRollReport = createAsyncThunk(
  "dailyReport/exportMusterRollReport",
  async ({ format = "pdf", fileName, ...params }, { rejectWithValue }) => {
    try {
      const res = await dailyReportApi.exportMusterRollApi({ format, ...params });
      return triggerBlobDownload(res, fileName || `muster-roll.${format}`);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 13. Unified trigger & export (supports optional recalculate)
export const triggerReportExport = createAsyncThunk(
  "dailyReport/triggerReportExport",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await dailyReportApi.triggerReportExportApi(payload);
      const ext = payload?.format || "pdf";
      return triggerBlobDownload(res, `report-export.${ext}`);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  // Reports listing
  reports: [],
  totalReports: 0,
  isListingReports: false,

  // Selected report details
  currentReport: null,
  isLoadingDetails: false,

  // Audit logs
  auditLogs: [],
  isLoadingAuditTrail: false,

  // Action states
  isLockingReport: false,
  isRecalculating: false,
  isUpdatingLabour: false,
  isUpdatingHeader: false,
  isSubmittingReport: false,
  isApprovingReport: false,
  isRejectingReport: false,
  isExportingReport: false,
};

const dailyReportSlice = createSlice({
  name: "dailyReport",
  initialState,
  reducers: {
    clearCurrentReport: (state) => {
      state.currentReport = null;
    },
    clearAuditLogs: (state) => {
      state.auditLogs = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. List Daily Reports
      .addCase(listDailyReports.pending, (state) => {
        state.isListingReports = true;
      })
      .addCase(listDailyReports.fulfilled, (state, action) => {
        state.isListingReports = false;
        const payload = action.payload;
        if (Array.isArray(payload)) {
          state.reports = payload;
          state.totalReports = payload.length;
        } else if (payload?.items) {
          state.reports = payload.items;
          state.totalReports = payload.total ?? payload.items.length;
        } else if (payload?.data) {
          state.reports = Array.isArray(payload.data)
            ? payload.data
            : payload.data.items || [];
          state.totalReports = payload.data.total ?? state.reports.length;
        } else {
          state.reports = [];
          state.totalReports = 0;
        }
      })
      .addCase(listDailyReports.rejected, (state, action) => {
        state.isListingReports = false;
        toast.error(extractError(action.payload, "Failed to load daily reports"));
      })

      // 2. Get Report Details
      .addCase(getDailyReportDetails.pending, (state) => {
        state.isLoadingDetails = true;
      })
      .addCase(getDailyReportDetails.fulfilled, (state, action) => {
        state.isLoadingDetails = false;
        state.currentReport = action.payload?.data || action.payload;
      })
      .addCase(getDailyReportDetails.rejected, (state, action) => {
        state.isLoadingDetails = false;
        toast.error(extractError(action.payload, "Failed to load report details"));
      })

      // 3. Recalculate
      .addCase(recalculateDailyReport.pending, (state) => {
        state.isRecalculating = true;
      })
      .addCase(recalculateDailyReport.fulfilled, (state, action) => {
        state.isRecalculating = false;
        const fresh = action.payload?.data || action.payload;
        if (fresh?.id && state.currentReport?.id === fresh.id) {
          state.currentReport = fresh;
        }
        if (fresh?.id) {
          state.reports = state.reports.map((r) =>
            r.id === fresh.id ? { ...r, ...fresh } : r
          );
        }
        toast.success("Muster roll recalculated successfully!");
      })
      .addCase(recalculateDailyReport.rejected, (state, action) => {
        state.isRecalculating = false;
        toast.error(extractError(action.payload, "Failed to recalculate muster"));
      })

      // 4. Lock Report
      .addCase(lockDailyReport.pending, (state) => {
        state.isLockingReport = true;
      })
      .addCase(lockDailyReport.fulfilled, (state, action) => {
        state.isLockingReport = false;
        const updated = action.payload.data;
        if (state.currentReport && state.currentReport.id === action.payload.id) {
          state.currentReport = {
            ...state.currentReport,
            status: "LOCKED",
            lockedAt: updated?.lockedAt || new Date().toISOString(),
            lockedById: updated?.lockedById,
            version: updated?.version ?? (state.currentReport.version + 1),
          };
        }
        state.reports = state.reports.map((r) =>
          r.id === action.payload.id
            ? {
                ...r,
                status: "LOCKED",
                lockedAt: updated?.lockedAt || new Date().toISOString(),
                lockedById: updated?.lockedById,
              }
            : r
        );
        toast.success("Daily report locked permanently for payroll & billing!");
      })
      .addCase(lockDailyReport.rejected, (state, action) => {
        state.isLockingReport = false;
        toast.error(extractError(action.payload, "Failed to lock daily report"));
      })

      // 5. Get Audit Trail
      .addCase(getDailyReportAuditTrail.pending, (state) => {
        state.isLoadingAuditTrail = true;
      })
      .addCase(getDailyReportAuditTrail.fulfilled, (state, action) => {
        state.isLoadingAuditTrail = false;
        state.auditLogs = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(getDailyReportAuditTrail.rejected, (state, action) => {
        state.isLoadingAuditTrail = false;
        toast.error(extractError(action.payload, "Failed to load audit history"));
      })

      // 6. Update Labour Summary
      .addCase(updateLabourSummary.pending, (state) => {
        state.isUpdatingLabour = true;
      })
      .addCase(updateLabourSummary.fulfilled, (state, action) => {
        state.isUpdatingLabour = false;
        const fresh = action.payload.data;
        if (fresh && state.currentReport) {
          state.currentReport = {
            ...state.currentReport,
            ...(typeof fresh === "object" ? fresh : {}),
          };
        }
        toast.success("Labour muster entry adjusted successfully!");
      })
      .addCase(updateLabourSummary.rejected, (state, action) => {
        state.isUpdatingLabour = false;
        toast.error(extractError(action.payload, "Failed to update labour summary"));
      })

      // 7. Update Daily Report Header
      .addCase(updateDailyReportHeader.pending, (state) => {
        state.isUpdatingHeader = true;
      })
      .addCase(updateDailyReportHeader.fulfilled, (state, action) => {
        state.isUpdatingHeader = false;
        const fresh = action.payload.data;
        if (fresh && state.currentReport) {
          state.currentReport = {
            ...state.currentReport,
            ...(typeof fresh === "object" ? fresh : {}),
          };
        }
        state.reports = state.reports.map((r) =>
          r.id === action.payload.id ? { ...r, ...fresh } : r
        );
        toast.success("Site report details updated successfully!");
      })
      .addCase(updateDailyReportHeader.rejected, (state, action) => {
        state.isUpdatingHeader = false;
        toast.error(extractError(action.payload, "Failed to update report details"));
      })

      // 8. Submit Daily Report
      .addCase(submitDailyReport.pending, (state) => {
        state.isSubmittingReport = true;
      })
      .addCase(submitDailyReport.fulfilled, (state, action) => {
        state.isSubmittingReport = false;
        const fresh = action.payload.data;
        if (state.currentReport && state.currentReport.id === action.payload.id) {
          state.currentReport = {
            ...state.currentReport,
            status: "SUBMITTED",
            ...(typeof fresh === "object" ? fresh : {}),
          };
        }
        state.reports = state.reports.map((r) =>
          r.id === action.payload.id ? { ...r, status: "SUBMITTED" } : r
        );
        toast.success("Daily report submitted to Project Manager for review!");
      })
      .addCase(submitDailyReport.rejected, (state, action) => {
        state.isSubmittingReport = false;
        toast.error(extractError(action.payload, "Failed to submit daily report"));
      })

      // 9. Approve Daily Report
      .addCase(approveDailyReport.pending, (state) => {
        state.isApprovingReport = true;
      })
      .addCase(approveDailyReport.fulfilled, (state, action) => {
        state.isApprovingReport = false;
        const fresh = action.payload.data;
        if (state.currentReport && state.currentReport.id === action.payload.id) {
          state.currentReport = {
            ...state.currentReport,
            status: "APPROVED",
            ...(typeof fresh === "object" ? fresh : {}),
          };
        }
        state.reports = state.reports.map((r) =>
          r.id === action.payload.id ? { ...r, status: "APPROVED" } : r
        );
        toast.success("Daily report approved successfully!");
      })
      .addCase(approveDailyReport.rejected, (state, action) => {
        state.isApprovingReport = false;
        toast.error(extractError(action.payload, "Failed to approve daily report"));
      })

      // 10. Reject Daily Report
      .addCase(rejectDailyReport.pending, (state) => {
        state.isRejectingReport = true;
      })
      .addCase(rejectDailyReport.fulfilled, (state, action) => {
        state.isRejectingReport = false;
        const fresh = action.payload.data;
        if (state.currentReport && state.currentReport.id === action.payload.id) {
          state.currentReport = {
            ...state.currentReport,
            status: "REJECTED",
            ...(typeof fresh === "object" ? fresh : {}),
          };
        }
        state.reports = state.reports.map((r) =>
          r.id === action.payload.id ? { ...r, status: "REJECTED" } : r
        );
        toast.success("Daily report returned to Site In-Charge with comments.");
      })
      .addCase(rejectDailyReport.rejected, (state, action) => {
        state.isRejectingReport = false;
        toast.error(extractError(action.payload, "Failed to reject daily report"));
      })

      // 11-13. Report Exports (PDF / Excel)
      .addMatcher(
        isAnyOf(
          exportDailySiteReport.pending,
          exportMusterRollReport.pending,
          triggerReportExport.pending
        ),
        (state) => {
          state.isExportingReport = true;
        }
      )
      .addMatcher(
        isAnyOf(
          exportDailySiteReport.fulfilled,
          exportMusterRollReport.fulfilled,
          triggerReportExport.fulfilled
        ),
        (state, action) => {
          state.isExportingReport = false;
          toast.success(`Downloaded ${action.payload?.fileName || "report"}`);
        }
      )
      .addMatcher(
        isAnyOf(
          exportDailySiteReport.rejected,
          exportMusterRollReport.rejected,
          triggerReportExport.rejected
        ),
        (state, action) => {
          state.isExportingReport = false;
          toast.error(extractError(action.payload, "Failed to export report"));
        }
      );
  },
});

export const { clearCurrentReport, clearAuditLogs } = dailyReportSlice.actions;
export default dailyReportSlice.reducer;
