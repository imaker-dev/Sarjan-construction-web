import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import leaveApi from "@store/api/leave.api";
import { extractList } from "@utils/api.utils";
import { extractApiError } from "@utils/error.handlers";
import { toast } from "sonner";

// --------------------------------------------------
// Leave Types
// --------------------------------------------------

export const listLeaveTypes = createAsyncThunk(
  "leave/listLeaveTypes",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await leaveApi.listLeaveTypesApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createLeaveType = createAsyncThunk(
  "leave/createLeaveType",
  async (values, { rejectWithValue }) => {
    try {
      const res = await leaveApi.createLeaveTypeApi(values);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateLeaveType = createAsyncThunk(
  "leave/updateLeaveType",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const res = await leaveApi.updateLeaveTypeApi({ id, values });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const archiveLeaveType = createAsyncThunk(
  "leave/archiveLeaveType",
  async (id, { rejectWithValue }) => {
    try {
      const res = await leaveApi.archiveLeaveTypeApi(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// --------------------------------------------------
// Leave Policies & Versions
// --------------------------------------------------

export const listLeavePolicies = createAsyncThunk(
  "leave/listLeavePolicies",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await leaveApi.listLeavePoliciesApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getLeavePolicy = createAsyncThunk(
  "leave/getLeavePolicy",
  async (id, { rejectWithValue }) => {
    try {
      const res = await leaveApi.getLeavePolicyApi(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createLeavePolicy = createAsyncThunk(
  "leave/createLeavePolicy",
  async (values, { rejectWithValue }) => {
    try {
      const res = await leaveApi.createLeavePolicyApi(values);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateLeavePolicy = createAsyncThunk(
  "leave/updateLeavePolicy",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const res = await leaveApi.updateLeavePolicyApi({ id, values });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const archiveLeavePolicy = createAsyncThunk(
  "leave/archiveLeavePolicy",
  async ({ id, values = {} }, { rejectWithValue }) => {
    try {
      const res = await leaveApi.archiveLeavePolicyApi({ id, values });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const listLeavePolicyVersions = createAsyncThunk(
  "leave/listLeavePolicyVersions",
  async (id, { rejectWithValue }) => {
    try {
      const res = await leaveApi.listLeavePolicyVersionsApi(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const addLeavePolicyVersion = createAsyncThunk(
  "leave/addLeavePolicyVersion",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const res = await leaveApi.addLeavePolicyVersionApi({ id, values });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const cancelLeavePolicyVersion = createAsyncThunk(
  "leave/cancelLeavePolicyVersion",
  async ({ id, versionId, values = {} }, { rejectWithValue }) => {
    try {
      const res = await leaveApi.cancelLeavePolicyVersionApi({ id, versionId, values });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getEffectiveLeavePolicy = createAsyncThunk(
  "leave/getEffectiveLeavePolicy",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await leaveApi.getEffectiveLeavePolicyApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// --------------------------------------------------
// Balances & Allocations
// --------------------------------------------------

export const listLeaveBalances = createAsyncThunk(
  "leave/listLeaveBalances",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await leaveApi.listLeaveBalancesApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

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

// --------------------------------------------------
// Leave Requests
// --------------------------------------------------

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

export const getLeaveRequestById = createAsyncThunk(
  "leave/getLeaveRequestById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await leaveApi.getLeaveRequestByIdApi(id);
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

export const resubmitLeaveRequest = createAsyncThunk(
  "leave/resubmitLeaveRequest",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const res = await leaveApi.resubmitLeaveRequestApi({ id, values });
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
    leaveTypes: [],
    isLoadingLeaveTypes: false,
    leavePolicies: [],
    isLoadingLeavePolicies: false,
    currentLeavePolicy: null,
    policyVersions: [],
    isLoadingPolicyVersions: false,
    effectiveLeavePolicy: null,
    isLoadingEffectivePolicy: false,
    balances: [],
    isLoadingBalances: false,
    balance: null,
    isLoadingBalance: false,
    requests: [],
    isLoadingRequests: false,
    currentLeaveRequest: null,
    isLoadingRequestDetails: false,
    isMutatingLeave: false,
  },
  reducers: {
    clearEffectiveLeavePolicy: (state) => {
      state.effectiveLeavePolicy = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listLeaveTypes.pending, (state) => {
        state.isLoadingLeaveTypes = true;
      })
      .addCase(listLeaveTypes.fulfilled, (state, action) => {
        state.isLoadingLeaveTypes = false;
        state.leaveTypes = extractList(action.payload, "types");
      })
      .addCase(listLeaveTypes.rejected, (state, action) => {
        state.isLoadingLeaveTypes = false;
        toast.error(extractApiError(action.payload, "Failed to load leave types"));
      })

      .addCase(listLeavePolicies.pending, (state) => {
        state.isLoadingLeavePolicies = true;
      })
      .addCase(listLeavePolicies.fulfilled, (state, action) => {
        state.isLoadingLeavePolicies = false;
        state.leavePolicies = extractList(action.payload, "policies");
      })
      .addCase(listLeavePolicies.rejected, (state, action) => {
        state.isLoadingLeavePolicies = false;
        toast.error(extractApiError(action.payload, "Failed to load leave policies"));
      })

      .addCase(getLeavePolicy.fulfilled, (state, action) => {
        state.currentLeavePolicy = action.payload?.data || action.payload;
      })

      .addCase(listLeavePolicyVersions.pending, (state) => {
        state.isLoadingPolicyVersions = true;
      })
      .addCase(listLeavePolicyVersions.fulfilled, (state, action) => {
        state.isLoadingPolicyVersions = false;
        state.policyVersions = extractList(action.payload, "versions");
      })
      .addCase(listLeavePolicyVersions.rejected, (state, action) => {
        state.isLoadingPolicyVersions = false;
        toast.error(extractApiError(action.payload, "Failed to load policy versions"));
      })

      .addCase(getEffectiveLeavePolicy.pending, (state) => {
        state.isLoadingEffectivePolicy = true;
      })
      .addCase(getEffectiveLeavePolicy.fulfilled, (state, action) => {
        state.isLoadingEffectivePolicy = false;
        state.effectiveLeavePolicy = action.payload?.data || action.payload;
      })
      .addCase(getEffectiveLeavePolicy.rejected, (state, action) => {
        state.isLoadingEffectivePolicy = false;
        toast.error(extractApiError(action.payload, "No effective leave policy found"));
      })

      .addCase(listLeaveBalances.pending, (state) => {
        state.isLoadingBalances = true;
      })
      .addCase(listLeaveBalances.fulfilled, (state, action) => {
        state.isLoadingBalances = false;
        state.balances = extractList(action.payload, "balances");
      })
      .addCase(listLeaveBalances.rejected, (state) => {
        state.isLoadingBalances = false;
      })

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

      .addCase(getLeaveRequestById.pending, (state) => {
        state.isLoadingRequestDetails = true;
      })
      .addCase(getLeaveRequestById.fulfilled, (state, action) => {
        state.isLoadingRequestDetails = false;
        state.currentLeaveRequest = action.payload?.data || action.payload;
      })
      .addCase(getLeaveRequestById.rejected, (state, action) => {
        state.isLoadingRequestDetails = false;
        toast.error(extractApiError(action.payload, "Failed to load leave request details"));
      })

      .addMatcher(
        isAnyOf(
          createLeaveType.pending,
          updateLeaveType.pending,
          archiveLeaveType.pending,
          createLeavePolicy.pending,
          updateLeavePolicy.pending,
          archiveLeavePolicy.pending,
          addLeavePolicyVersion.pending,
          cancelLeavePolicyVersion.pending,
          allocateLeave.pending,
          applyLeave.pending,
          resubmitLeaveRequest.pending,
          cancelLeaveRequest.pending,
          reviewLeaveRequest.pending
        ),
        (state) => {
          state.isMutatingLeave = true;
        }
      )
      .addMatcher(
        isAnyOf(
          createLeaveType.fulfilled,
          updateLeaveType.fulfilled,
          archiveLeaveType.fulfilled,
          createLeavePolicy.fulfilled,
          updateLeavePolicy.fulfilled,
          archiveLeavePolicy.fulfilled,
          addLeavePolicyVersion.fulfilled,
          cancelLeavePolicyVersion.fulfilled,
          allocateLeave.fulfilled,
          applyLeave.fulfilled,
          resubmitLeaveRequest.fulfilled,
          cancelLeaveRequest.fulfilled,
          reviewLeaveRequest.fulfilled
        ),
        (state) => {
          state.isMutatingLeave = false;
          toast.success("Leave updated successfully.");
        }
      )
      .addMatcher(
        isAnyOf(
          createLeaveType.rejected,
          updateLeaveType.rejected,
          archiveLeaveType.rejected,
          createLeavePolicy.rejected,
          updateLeavePolicy.rejected,
          archiveLeavePolicy.rejected,
          addLeavePolicyVersion.rejected,
          cancelLeavePolicyVersion.rejected,
          allocateLeave.rejected,
          applyLeave.rejected,
          resubmitLeaveRequest.rejected,
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

export const { clearEffectiveLeavePolicy } = leaveSlice.actions;
export default leaveSlice.reducer;
