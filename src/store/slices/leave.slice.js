import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import leaveApi from "@store/api/leave.api";
import { extractList } from "@utils/api.utils";
import { extractApiError } from "@utils/error.handlers";
import { toast } from "sonner";

export const getLeaveBalance = createAsyncThunk(
  "leave/getLeaveBalance",
  async ({ employeeId, params = {} }, { rejectWithValue }) => {
    try {
      const res = await leaveApi.getLeaveBalanceApi(employeeId, params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const allocateLeave = createAsyncThunk(
  "leave/allocateLeave",
  async (values, { rejectWithValue }) => {
    try {
      const res = await leaveApi.allocateLeaveApi(values);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const listLeaveRequests = createAsyncThunk(
  "leave/listLeaveRequests",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await leaveApi.listLeaveRequestsApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const applyLeave = createAsyncThunk(
  "leave/applyLeave",
  async (values, { rejectWithValue }) => {
    try {
      const res = await leaveApi.applyLeaveApi(values);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const cancelLeaveRequest = createAsyncThunk(
  "leave/cancelLeaveRequest",
  async ({ id, values = {} }, { rejectWithValue }) => {
    try {
      const res = await leaveApi.cancelLeaveRequestApi({ id, values });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const reviewLeaveRequest = createAsyncThunk(
  "leave/reviewLeaveRequest",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const res = await leaveApi.reviewLeaveRequestApi({ id, values });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const leaveSlice = createSlice({
  name: "leave",
  initialState: {
    balance: null,
    isLoadingBalance: false,
    requests: [],
    isLoadingRequests: false,
    isMutatingLeave: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getLeaveBalance.pending, (state) => {
        state.isLoadingBalance = true;
      })
      .addCase(getLeaveBalance.fulfilled, (state, action) => {
        state.isLoadingBalance = false;
        state.balance = action.payload?.data || action.payload;
      })
      .addCase(getLeaveBalance.rejected, (state) => {
        state.isLoadingBalance = false;
      })

      .addCase(listLeaveRequests.pending, (state) => {
        state.isLoadingRequests = true;
      })
      .addCase(listLeaveRequests.fulfilled, (state, action) => {
        state.isLoadingRequests = false;
        state.requests = extractList(action.payload, "requests");
      })
      .addCase(listLeaveRequests.rejected, (state, action) => {
        state.isLoadingRequests = false;
        toast.error(extractApiError(action.payload, "Failed to load leave requests"));
      })

      .addMatcher(
        isAnyOf(
          allocateLeave.pending,
          applyLeave.pending,
          cancelLeaveRequest.pending,
          reviewLeaveRequest.pending
        ),
        (state) => {
          state.isMutatingLeave = true;
        }
      )
      .addMatcher(
        isAnyOf(
          allocateLeave.fulfilled,
          applyLeave.fulfilled,
          cancelLeaveRequest.fulfilled,
          reviewLeaveRequest.fulfilled
        ),
        (state) => {
          state.isMutatingLeave = false;
          toast.success("Leave request updated.");
        }
      )
      .addMatcher(
        isAnyOf(
          allocateLeave.rejected,
          applyLeave.rejected,
          cancelLeaveRequest.rejected,
          reviewLeaveRequest.rejected
        ),
        (state, action) => {
          state.isMutatingLeave = false;
          toast.error(extractApiError(action.payload, "Leave action failed"));
        }
      );
  },
});

export default leaveSlice.reducer;
