
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import employeeMembershipApi from "@store/api/employeeMembership.api";
import { toast } from "sonner";

// Get employee memberships
export const listEmployeeMemberships = createAsyncThunk(
  "employeeMembership/list",
  async (employeeId) => {
    const res =
      await employeeMembershipApi.getEmployeeMemberships(employeeId);
    return res.data;
  },
);

// Add department membership
export const addEmployeeMembership = createAsyncThunk(
  "employeeMembership/add",
  async ({ employeeId, values }) => {
    const res = await employeeMembershipApi.addEmployeeMembership(
      employeeId,
      values,
    );
    return res.data;
  },
);

// Update department membership
export const updateEmployeeMembership = createAsyncThunk(
  "employeeMembership/update",
  async ({ employeeId, membershipId, values }) => {
    const res = await employeeMembershipApi.updateEmployeeMembership(
      employeeId,
      membershipId,
      values,
    );
    return res.data;
  },
);

// End department membership
export const endEmployeeMembership = createAsyncThunk(
  "employeeMembership/end",
  async ({ employeeId, membershipId, values }) => {
    const res = await employeeMembershipApi.endEmployeeMembership(
      employeeId,
      membershipId,
      values,
    );
    return res.data;
  },
);

const initialState = {
  membershipsData: [],
  isListingMemberships: false,
  isAddingMembership: false,
  isUpdatingMembership: false,
  isEndingMembership: false,
};

const employeeMembershipSlice = createSlice({
  name: "employeeMembership",
  initialState,
  reducers: {
    clearEmployeeMembershipData: (state) => {
      state.membershipsData = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // List memberships
      .addCase(listEmployeeMemberships.pending, (state) => {
        state.isListingMemberships = true;
      })
      .addCase(listEmployeeMemberships.fulfilled, (state, action) => {
        state.isListingMemberships = false;
        state.membershipsData = action.payload;
      })
      .addCase(listEmployeeMemberships.rejected, (state, action) => {
        state.isListingMemberships = false;
        toast.error(
          action.error.message || "Failed to load department memberships",
        );
      })

      // Add membership
      .addCase(addEmployeeMembership.pending, (state) => {
        state.isAddingMembership = true;
      })
      .addCase(addEmployeeMembership.fulfilled, (state, action) => {
        state.isAddingMembership = false;
        toast.success(
          action.payload?.message || "Department membership added successfully",
        );
      })
      .addCase(addEmployeeMembership.rejected, (state, action) => {
        state.isAddingMembership = false;
        toast.error(
          action.error.message || "Failed to add department membership",
        );
      })

      // Update membership
      .addCase(updateEmployeeMembership.pending, (state) => {
        state.isUpdatingMembership = false;
        toast.success(
          action.payload?.message || "Department membership updated successfully",
        );
      })
      .addCase(updateEmployeeMembership.rejected, (state, action) => {
        state.isUpdatingMembership = false;
        toast.error(
          action.error.message || "Failed to update department membership",
        );
      })

      // End membership
      .addCase(endEmployeeMembership.pending, (state) => {
        state.isEndingMembership = true;
      })
      .addCase(endEmployeeMembership.fulfilled, (state, action) => {
        state.isEndingMembership = false;
        toast.success(
          action.payload?.message || "Department membership ended successfully",
        );
      })
      .addCase(endEmployeeMembership.rejected, (state, action) => {
        state.isEndingMembership = false;
        toast.error(
          action.error.message || "Failed to end department membership",
        );
      });
  },
});

export const { clearEmployeeMembershipData } =
  employeeMembershipSlice.actions;

export default employeeMembershipSlice.reducer;
