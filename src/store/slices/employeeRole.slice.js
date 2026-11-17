
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import employeeRoleApi from "@store/api/employeeRole.api";
import { toast } from "sonner";

// --------------------------------------------------
// List Employee Roles
// --------------------------------------------------

export const listEmployeeRoles = createAsyncThunk(
  "employeeRole/list",
  async (employeeId) => {
    const res = await employeeRoleApi.getEmployeeRoles(employeeId);
    return res.data;
  },
);

// --------------------------------------------------
// Assign Employee Role
// --------------------------------------------------

export const assignEmployeeRole = createAsyncThunk(
  "employeeRole/assign",
  async ({ employeeId, values }) => {
    const res = await employeeRoleApi.assignEmployeeRole(
      employeeId,
      values,
    );
    return res.data;
  },
);

// --------------------------------------------------
// Revoke Employee Role
// --------------------------------------------------

export const revokeEmployeeRole = createAsyncThunk(
  "employeeRole/revoke",
  async ({ employeeId, assignmentId }) => {
    const res = await employeeRoleApi.revokeEmployeeRole(
      employeeId,
      assignmentId,
    );
    return res.data;
  },
);

// --------------------------------------------------
// Initial State
// --------------------------------------------------

const initialState = {
  employeeRolesData: [],

  isListingEmployeeRoles: false,
  isAssigningEmployeeRole: false,
  isRevokingEmployeeRole: false,
};

// --------------------------------------------------
// Employee Role Slice
// --------------------------------------------------

const employeeRoleSlice = createSlice({
  name: "employeeRole",
  initialState,

  reducers: {
    clearEmployeeRoleData: (state) => {
      state.employeeRolesData = [];
    },
  },

  extraReducers: (builder) => {
    builder

      // List Employee Roles
      .addCase(listEmployeeRoles.pending, (state) => {
        state.isListingEmployeeRoles = true;
      })
      .addCase(listEmployeeRoles.fulfilled, (state, action) => {
        state.isListingEmployeeRoles = false;
        state.employeeRolesData = action.payload;
      })
      .addCase(listEmployeeRoles.rejected, (state, action) => {
        state.isListingEmployeeRoles = false;
        toast.error(
          action.error.message || "Failed to fetch employee roles",
        );
      })

      // Assign Employee Role
      .addCase(assignEmployeeRole.pending, (state) => {
        state.isAssigningEmployeeRole = true;
      })
      .addCase(assignEmployeeRole.fulfilled, (state, action) => {
        state.isAssigningEmployeeRole = false;
        toast.success(
          action.payload?.message || "Role assigned successfully",
        );
      })
      .addCase(assignEmployeeRole.rejected, (state, action) => {
        state.isAssigningEmployeeRole = false;
        toast.error(
          action.error.message || "Failed to assign role",
        );
      })

      // Revoke Employee Role
      .addCase(revokeEmployeeRole.pending, (state) => {
        state.isRevokingEmployeeRole = true;
      })
      .addCase(revokeEmployeeRole.fulfilled, (state, action) => {
        state.isRevokingEmployeeRole = false;
        toast.success(
          action.payload?.message || "Role revoked successfully",
        );
      })
      .addCase(revokeEmployeeRole.rejected, (state, action) => {
        state.isRevokingEmployeeRole = false;
        toast.error(
          action.error.message || "Failed to revoke role",
        );
      });
  },
});

export const { clearEmployeeRoleData } = employeeRoleSlice.actions;

export default employeeRoleSlice.reducer;
