
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import attendanceApi from "@store/api/attendance.api";
import { toast } from "sonner";

// --------------------------------------------------
// ASYNC THUNKS
// --------------------------------------------------

// Get active attendance session
export const getActiveSession = createAsyncThunk(
  "attendance/getActiveSession",
  async (params = {}) => {
    const res = await attendanceApi.getActiveSessionApi(params);
    return res.data;
  },
);

// Clock in
export const punchIn = createAsyncThunk(
  "attendance/punchIn",
  async (values) => {
    const res = await attendanceApi.punchInApi(values);
    return res.data;
  },
);

// Start break
export const startAttendanceBreak = createAsyncThunk(
  "attendance/startAttendanceBreak",
  async (values) => {
    const res = await attendanceApi.startBreakApi(values);
    return res.data;
  },
);

// End break
export const endAttendanceBreak = createAsyncThunk(
  "attendance/endAttendanceBreak",
  async (values) => {
    const res = await attendanceApi.endBreakApi(values);
    return res.data;
  },
);

// Clock out
export const punchOut = createAsyncThunk(
  "attendance/punchOut",
  async (values) => {
    const res = await attendanceApi.punchOutApi(values);
    return res.data;
  },
);

// --------------------------------------------------
// INITIAL STATE
// --------------------------------------------------

const initialState = {
  activeSession: null,
  attendanceData: null,

  isFetchingActiveSession: false,
  isPunchingIn: false,
  isStartingBreak: false,
  isEndingBreak: false,
  isPunchingOut: false,
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

    resetAttendance: () => initialState,
  },

  extraReducers: (builder) => {
    builder

      // ----------------------------------------------
      // Get active attendance session
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
        toast.error(
          action.error.message || "Failed to fetch attendance status",
        );
      })

      // ----------------------------------------------
      // Clock in
      // ----------------------------------------------

      .addCase(punchIn.pending, (state) => {
        state.isPunchingIn = true;
      })
      .addCase(punchIn.fulfilled, (state, action) => {
        state.isPunchingIn = false;
        state.activeSession = action.payload?.session ?? action.payload;

        toast.success(
          action.payload?.message || "Clocked in successfully!",
        );
      })
      .addCase(punchIn.rejected, (state, action) => {
        state.isPunchingIn = false;
        toast.error(action.error.message || "Failed to clock in");
      })

      // ----------------------------------------------
      // Start break
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

        toast.success(
          action.payload?.message || "Break started successfully!",
        );
      })
      .addCase(startAttendanceBreak.rejected, (state, action) => {
        state.isStartingBreak = false;
        toast.error(action.error.message || "Failed to start break");
      })

      // ----------------------------------------------
      // End break
      // ----------------------------------------------

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
            breakItem.id === updatedBreak.id
              ? updatedBreak
              : breakItem,
          );
        }

        toast.success(
          action.payload?.message || "Break ended successfully!",
        );
      })
      .addCase(endAttendanceBreak.rejected, (state, action) => {
        state.isEndingBreak = false;
        toast.error(action.error.message || "Failed to end break");
      })

      // ----------------------------------------------
      // Clock out
      // ----------------------------------------------

      .addCase(punchOut.pending, (state) => {
        state.isPunchingOut = true;
      })
      .addCase(punchOut.fulfilled, (state, action) => {
        state.isPunchingOut = false;
        state.attendanceData = action.payload;
        state.activeSession = null;

        toast.success(
          action.payload?.message || "Clocked out successfully!",
        );
      })
      .addCase(punchOut.rejected, (state, action) => {
        state.isPunchingOut = false;
        toast.error(action.error.message || "Failed to clock out");
      });
  },
});

export const { clearActiveSession, resetAttendance } =
  attendanceSlice.actions;

export default attendanceSlice.reducer;
