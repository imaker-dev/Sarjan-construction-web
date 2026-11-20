
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import attendanceApi from "@store/api/attendance.api";
import { toast } from "sonner";

// --------------------------------------------------
// ASYNC THUNKS
// --------------------------------------------------

// Attendance Policies
export const getAttendancePolicies = createAsyncThunk(
  "attendance/getAttendancePolicies",
  async (params = {}) => {
    const res = await attendanceApi.getAttendancePoliciesApi(params);
    return res.data;
  },
);

export const getAttendancePolicy = createAsyncThunk(
  "attendance/getAttendancePolicy",
  async (id) => {
    const res = await attendanceApi.getAttendancePolicyApi(id);
    return res.data;
  },
);

export const getEffectiveAttendancePolicy = createAsyncThunk(
  "attendance/getEffectiveAttendancePolicy",
  async (params = {}) => {
    const res = await attendanceApi.getEffectiveAttendancePolicyApi(params);
    return res.data;
  },
);

export const createAttendancePolicy = createAsyncThunk(
  "attendance/createAttendancePolicy",
  async (values) => {
    const res = await attendanceApi.createAttendancePolicyApi(values);
    return res.data;
  },
);

export const updateAttendancePolicy = createAsyncThunk(
  "attendance/updateAttendancePolicy",
  async ({id,values}) => {
    const res = await attendanceApi.updateAttendancePolicyApi({id,values});
    return res.data;
  },
);

// Safety Toolbox Talk (TVT)
export const getTvtSessions = createAsyncThunk(
  "attendance/getTvtSessions",
  async (params = {}) => {
    const res = await attendanceApi.getTvtSessionsApi(params);
    return res.data;
  },
);

export const getTvtSession = createAsyncThunk(
  "attendance/getTvtSession",
  async (id) => {
    const res = await attendanceApi.getTvtSessionApi(id);
    return res.data;
  },
);

export const createTvtSession = createAsyncThunk(
  "attendance/createTvtSession",
  async (values) => {
    const res = await attendanceApi.createTvtSessionApi(values);
    return res.data;
  },
);

export const addTvtAttendees = createAsyncThunk(
  "attendance/addTvtAttendees",
  async (payload) => {
    const res = await attendanceApi.addTvtAttendeesApi(payload);
    return res.data;
  },
);

// Active Session
export const getActiveSession = createAsyncThunk(
  "attendance/getActiveSession",
  async (params = {}) => {
    const res = await attendanceApi.getActiveSessionApi(params);
    return res.data;
  },
);

// Punch Operations
export const punchIn = createAsyncThunk(
  "attendance/punchIn",
  async (values) => {
    const res = await attendanceApi.punchInApi(values);
    return res.data;
  },
);

export const punchOut = createAsyncThunk(
  "attendance/punchOut",
  async (values) => {
    const res = await attendanceApi.punchOutApi(values);
    return res.data;
  },
);

// Kiosk Operations
export const batchPunchIn = createAsyncThunk(
  "attendance/batchPunchIn",
  async (values) => {
    const res = await attendanceApi.batchPunchInApi(values);
    return res.data;
  },
);

export const batchPunchOut = createAsyncThunk(
  "attendance/batchPunchOut",
  async (values) => {
    const res = await attendanceApi.batchPunchOutApi(values);
    return res.data;
  },
);

export const syncAttendance = createAsyncThunk(
  "attendance/syncAttendance",
  async (values) => {
    const res = await attendanceApi.syncAttendanceApi(values);
    return res.data;
  },
);

// Breaks
export const startAttendanceBreak = createAsyncThunk(
  "attendance/startAttendanceBreak",
  async (values) => {
    const res = await attendanceApi.startBreakApi(values);
    return res.data;
  },
);

export const endAttendanceBreak = createAsyncThunk(
  "attendance/endAttendanceBreak",
  async (values) => {
    const res = await attendanceApi.endBreakApi(values);
    return res.data;
  },
);

// Attendance Sessions
export const getAttendanceSessions = createAsyncThunk(
  "attendance/getAttendanceSessions",
  async (params = {}) => {
    const res = await attendanceApi.getAttendanceSessionsApi(params);
    return res.data;
  },
);

export const getAttendanceSession = createAsyncThunk(
  "attendance/getAttendanceSession",
  async (id) => {
    const res = await attendanceApi.getAttendanceSessionApi(id);
    return res.data;
  },
);

export const regularizeAttendanceSession = createAsyncThunk(
  "attendance/regularizeAttendanceSession",
  async (payload) => {
    const res = await attendanceApi.regularizeAttendanceSessionApi(payload);
    return res.data;
  },
);

// Daily Summary
export const getAttendanceDailySummary = createAsyncThunk(
  "attendance/getAttendanceDailySummary",
  async (params = {}) => {
    const res = await attendanceApi.getAttendanceDailySummaryApi(params);
    return res.data;
  },
);

// Muster Roll
export const getMusterRoll = createAsyncThunk(
  "attendance/getMusterRoll",
  async (params = {}) => {
    const res = await attendanceApi.getMusterRollApi(params);
    return res.data;
  },
);

// --------------------------------------------------
// INITIAL STATE
// --------------------------------------------------

const initialState = {
  // Active attendance
  activeSession: null,
  attendanceData: null,

  // Policies
  attendancePolicies: [],
  attendancePolicy: null,
  effectivePolicy: null,

  // TVT
  tvtSessions: [],
  tvtSession: null,

  // Sessions
  attendanceSessions: [],
  attendanceSession: null,

  // Dashboard
  dailySummary: null,

  // Muster roll
  musterRoll: null,

  // Loading states
  isFetchingActiveSession: false,
  isPunchingIn: false,
  isPunchingOut: false,

  isStartingBreak: false,
  isEndingBreak: false,

  isFetchingPolicies: false,
  isFetchingPolicy: false,
  isFetchingEffectivePolicy: false,
  isCreatingPolicy: false,
  isUpdatingPolicy: false,

  isFetchingTvtSessions: false,
  isFetchingTvtSession: false,
  isCreatingTvtSession: false,
  isAddingTvtAttendees: false,

  isBatchPunchingIn: false,
  isBatchPunchingOut: false,
  isSyncingAttendance: false,

  isFetchingSessions: false,
  isFetchingSession: false,
  isRegularizingSession: false,

  isFetchingDailySummary: false,
  isFetchingMusterRoll: false,
};

// --------------------------------------------------
// SLICE
// --------------------------------------------------

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,

  reducers: {
    clearActiveSession: (state) => {
      state.activeSession = null;
    },

    clearAttendanceSession: (state) => {
      state.attendanceSession = null;
    },

    clearAttendanceData: (state) => {
      state.attendanceData = null;
    },

    resetAttendance: () => initialState,
  },

  extraReducers: (builder) => {
    builder

      // ----------------------------------------------
      // ACTIVE SESSION
      // ----------------------------------------------

      .addCase(getActiveSession.pending, (state) => {
        state.isFetchingActiveSession = true;
      })
      .addCase(getActiveSession.fulfilled, (state, action) => {
        state.isFetchingActiveSession = false;
        state.activeSession = action.payload?.session ?? null;
      })
      .addCase(getActiveSession.rejected, (state, action) => {
        state.isFetchingActiveSession = false;
        toast.error(action.error.message || "Failed to fetch attendance status");
      })

      // ----------------------------------------------
      // PUNCH IN
      // ----------------------------------------------

      .addCase(punchIn.pending, (state) => {
        state.isPunchingIn = true;
      })
      .addCase(punchIn.fulfilled, (state, action) => {
        state.isPunchingIn = false;
        state.activeSession = action.payload?.session ?? action.payload;

        toast.success(action.payload?.message || "Clocked in successfully!");
      })
      .addCase(punchIn.rejected, (state, action) => {
        state.isPunchingIn = false;
        toast.error(action.error.message || "Failed to clock in");
      })

      // ----------------------------------------------
      // PUNCH OUT
      // ----------------------------------------------

      .addCase(punchOut.pending, (state) => {
        state.isPunchingOut = true;
      })
      .addCase(punchOut.fulfilled, (state, action) => {
        state.isPunchingOut = false;
        state.attendanceData = action.payload;
        state.activeSession = null;

        toast.success(action.payload?.message || "Clocked out successfully!");
      })
      .addCase(punchOut.rejected, (state, action) => {
        state.isPunchingOut = false;
        toast.error(action.error.message || "Failed to clock out");
      })

      // ----------------------------------------------
      // BREAKS
      // ----------------------------------------------

      .addCase(startAttendanceBreak.pending, (state) => {
        state.isStartingBreak = true;
      })
      .addCase(startAttendanceBreak.fulfilled, (state, action) => {
        state.isStartingBreak = false;

        if (state.activeSession) {
          const newBreak = action.payload?.break ?? action.payload;

          state.activeSession.breaks = [
            ...(state.activeSession.breaks || []),
            newBreak,
          ];
        }

        toast.success(action.payload?.message || "Break started successfully!");
      })
      .addCase(startAttendanceBreak.rejected, (state, action) => {
        state.isStartingBreak = false;
        toast.error(action.error.message || "Failed to start break");
      })

      .addCase(endAttendanceBreak.pending, (state) => {
        state.isEndingBreak = true;
      })
      .addCase(endAttendanceBreak.fulfilled, (state, action) => {
        state.isEndingBreak = false;

        if (state.activeSession) {
          const updatedBreak = action.payload?.break ?? action.payload;

          state.activeSession.breaks = (
            state.activeSession.breaks || []
          ).map((breakItem) =>
            breakItem.id === updatedBreak.id ? updatedBreak : breakItem,
          );
        }

        toast.success(action.payload?.message || "Break ended successfully!");
      })
      .addCase(endAttendanceBreak.rejected, (state, action) => {
        state.isEndingBreak = false;
        toast.error(action.error.message || "Failed to end break");
      })

      // ----------------------------------------------
      // POLICIES
      // ----------------------------------------------

      .addCase(getAttendancePolicies.pending, (state) => {
        state.isFetchingPolicies = true;
      })
      .addCase(getAttendancePolicies.fulfilled, (state, action) => {
        state.isFetchingPolicies = false;
        state.attendancePolicies = action.payload;
      })
      .addCase(getAttendancePolicies.rejected, (state, action) => {
        state.isFetchingPolicies = false;
        toast.error(action.error.message || "Failed to fetch attendance policies");
      })

      .addCase(getAttendancePolicy.pending, (state) => {
        state.isFetchingPolicy = true;
      })
      .addCase(getAttendancePolicy.fulfilled, (state, action) => {
        state.isFetchingPolicy = false;
        state.attendancePolicy = action.payload?.policy ?? action.payload;
      })
      .addCase(getAttendancePolicy.rejected, (state, action) => {
        state.isFetchingPolicy = false;
        toast.error(action.error.message || "Failed to fetch attendance policy");
      })

      .addCase(getEffectiveAttendancePolicy.pending, (state) => {
        state.isFetchingEffectivePolicy = true;
      })
      .addCase(getEffectiveAttendancePolicy.fulfilled, (state, action) => {
        state.isFetchingEffectivePolicy = false;
        state.effectivePolicy = action.payload?.policy ?? action.payload;
      })
      .addCase(getEffectiveAttendancePolicy.rejected, (state, action) => {
        state.isFetchingEffectivePolicy = false;
        toast.error(action.error.message || "Failed to fetch effective policy");
      })

      .addCase(createAttendancePolicy.pending, (state) => {
        state.isCreatingPolicy = true;
      })
      .addCase(createAttendancePolicy.fulfilled, (state, action) => {
        state.isCreatingPolicy = false;

        const policy = action.payload?.policy ?? action.payload;
        if (policy?.id) {
          state.attendancePolicies.unshift(policy);
        }

        toast.success(action.payload?.message || "Attendance policy created successfully!");
      })
      .addCase(createAttendancePolicy.rejected, (state, action) => {
        state.isCreatingPolicy = false;
        toast.error(action.error.message || "Failed to create attendance policy");
      })

      .addCase(updateAttendancePolicy.pending, (state) => {
        state.isUpdatingPolicy = true;
      })
      .addCase(updateAttendancePolicy.fulfilled, (state, action) => {
        state.isUpdatingPolicy = false;

        const policy = action.payload?.policy ?? action.payload;
        if (policy?.id) {
          state.attendancePolicies = state.attendancePolicies.map((item) =>
            item.id === policy.id ? policy : item,
          );
          if (state.attendancePolicy?.id === policy.id) {
            state.attendancePolicy = policy;
          }
        }

        toast.success(action.payload?.message || "Attendance policy updated successfully!");
      })
      .addCase(updateAttendancePolicy.rejected, (state, action) => {
        state.isUpdatingPolicy = false;
        toast.error(action.error.message || "Failed to update attendance policy");
      })

      // ----------------------------------------------
      // TVT
      // ----------------------------------------------

      .addCase(getTvtSessions.pending, (state) => {
        state.isFetchingTvtSessions = true;
      })
      .addCase(getTvtSessions.fulfilled, (state, action) => {
        state.isFetchingTvtSessions = false;
        state.tvtSessions = action.payload?.sessions ?? action.payload ?? [];
      })
      .addCase(getTvtSessions.rejected, (state, action) => {
        state.isFetchingTvtSessions = false;
        toast.error(action.error.message || "Failed to fetch TVT sessions");
      })

      .addCase(getTvtSession.pending, (state) => {
        state.isFetchingTvtSession = true;
      })
      .addCase(getTvtSession.fulfilled, (state, action) => {
        state.isFetchingTvtSession = false;
        state.tvtSession = action.payload?.session ?? action.payload;
      })
      .addCase(getTvtSession.rejected, (state, action) => {
        state.isFetchingTvtSession = false;
        toast.error(action.error.message || "Failed to fetch TVT session");
      })

      .addCase(createTvtSession.pending, (state) => {
        state.isCreatingTvtSession = true;
      })
      .addCase(createTvtSession.fulfilled, (state, action) => {
        state.isCreatingTvtSession = false;

        const session = action.payload?.session ?? action.payload;
        if (session?.id) {
          state.tvtSessions.unshift(session);
        }

        toast.success(action.payload?.message || "TVT recorded successfully!");
      })
      .addCase(createTvtSession.rejected, (state, action) => {
        state.isCreatingTvtSession = false;
        toast.error(action.error.message || "Failed to record TVT");
      })

      .addCase(addTvtAttendees.pending, (state) => {
        state.isAddingTvtAttendees = true;
      })
      .addCase(addTvtAttendees.fulfilled, (state, action) => {
        state.isAddingTvtAttendees = false;
        toast.success(action.payload?.message || "TVT attendees added successfully!");
      })
      .addCase(addTvtAttendees.rejected, (state, action) => {
        state.isAddingTvtAttendees = false;
        toast.error(action.error.message || "Failed to add TVT attendees");
      })

      // ----------------------------------------------
      // KIOSK & OFFLINE SYNC
      // ----------------------------------------------

      .addCase(batchPunchIn.pending, (state) => {
        state.isBatchPunchingIn = true;
      })
      .addCase(batchPunchIn.fulfilled, (state) => {
        state.isBatchPunchingIn = false;
        toast.success("Batch punch-in processed successfully!");
      })
      .addCase(batchPunchIn.rejected, (state, action) => {
        state.isBatchPunchingIn = false;
        toast.error(action.error.message || "Batch punch-in failed");
      })

      .addCase(batchPunchOut.pending, (state) => {
        state.isBatchPunchingOut = true;
      })
      .addCase(batchPunchOut.fulfilled, (state) => {
        state.isBatchPunchingOut = false;
        toast.success("Batch punch-out processed successfully!");
      })
      .addCase(batchPunchOut.rejected, (state, action) => {
        state.isBatchPunchingOut = false;
        toast.error(action.error.message || "Batch punch-out failed");
      })

      .addCase(syncAttendance.pending, (state) => {
        state.isSyncingAttendance = true;
      })
      .addCase(syncAttendance.fulfilled, (state) => {
        state.isSyncingAttendance = false;
        toast.success("Offline attendance synced successfully!");
      })
      .addCase(syncAttendance.rejected, (state, action) => {
        state.isSyncingAttendance = false;
        toast.error(action.error.message || "Attendance sync failed");
      })

      // ----------------------------------------------
      // SESSIONS
      // ----------------------------------------------

      .addCase(getAttendanceSessions.pending, (state) => {
        state.isFetchingSessions = true;
      })
      .addCase(getAttendanceSessions.fulfilled, (state, action) => {
        state.isFetchingSessions = false;
        state.attendanceSessions = action.payload?.sessions ?? action.payload ?? [];
      })
      .addCase(getAttendanceSessions.rejected, (state, action) => {
        state.isFetchingSessions = false;
        toast.error(action.error.message || "Failed to fetch attendance sessions");
      })

      .addCase(getAttendanceSession.pending, (state) => {
        state.isFetchingSession = true;
      })
      .addCase(getAttendanceSession.fulfilled, (state, action) => {
        state.isFetchingSession = false;
        state.attendanceSession = action.payload?.session ?? action.payload;
      })
      .addCase(getAttendanceSession.rejected, (state, action) => {
        state.isFetchingSession = false;
        toast.error(action.error.message || "Failed to fetch attendance session");
      })

      .addCase(regularizeAttendanceSession.pending, (state) => {
        state.isRegularizingSession = true;
      })
      .addCase(regularizeAttendanceSession.fulfilled, (state, action) => {
        state.isRegularizingSession = false;

        const session = action.payload?.session ?? action.payload;
        state.attendanceSession = session;

        if (session?.id) {
          state.attendanceSessions = state.attendanceSessions.map((item) =>
            item.id === session.id ? session : item,
          );
        }

        toast.success(action.payload?.message || "Attendance session regularized successfully!");
      })
      .addCase(regularizeAttendanceSession.rejected, (state, action) => {
        state.isRegularizingSession = false;
        toast.error(action.error.message || "Failed to regularize attendance session");
      })

      // ----------------------------------------------
      // DAILY SUMMARY
      // ----------------------------------------------

      .addCase(getAttendanceDailySummary.pending, (state) => {
        state.isFetchingDailySummary = true;
      })
      .addCase(getAttendanceDailySummary.fulfilled, (state, action) => {
        state.isFetchingDailySummary = false;
        state.dailySummary = action.payload;
      })
      .addCase(getAttendanceDailySummary.rejected, (state, action) => {
        state.isFetchingDailySummary = false;
        toast.error(action.error.message || "Failed to fetch daily attendance summary");
      })

      // ----------------------------------------------
      // MUSTER ROLL
      // ----------------------------------------------

      .addCase(getMusterRoll.pending, (state) => {
        state.isFetchingMusterRoll = true;
      })
      .addCase(getMusterRoll.fulfilled, (state, action) => {
        state.isFetchingMusterRoll = false;
        state.musterRoll = action.payload;
      })
      .addCase(getMusterRoll.rejected, (state, action) => {
        state.isFetchingMusterRoll = false;
        toast.error(action.error.message || "Failed to fetch muster roll");
      });
  },
});

export const {
  clearActiveSession,
  clearAttendanceSession,
  clearAttendanceData,
  resetAttendance,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
