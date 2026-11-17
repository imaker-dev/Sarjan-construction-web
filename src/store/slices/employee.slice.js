import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import employeeApi from "@store/api/employee.api";
import { toast } from "sonner";

// List Employees
export const listEmployees = createAsyncThunk(
  "employee/listEmployees",
  async (values = {}) => {
    const res = await employeeApi.listEmployeesApi(values);
    return res.data;
  },
);

// Get Employee Details
export const getEmployeeDetails = createAsyncThunk(
  "employee/getEmployeeDetails",
  async (id) => {
    const res = await employeeApi.getEmployeeDetailsApi(id);
    return res.data;
  },
);

// Create Employee
export const createEmployee = createAsyncThunk(
  "employee/createEmployee",
  async (values) => {
    const res = await employeeApi.createEmployeeApi(values);
    return res.data;
  },
);

// Update Employee
export const updateEmployee = createAsyncThunk(
  "employee/updateEmployee",
  async ({ id, values }) => {
    const res = await employeeApi.updateEmployeeApi({ id, values });
    return res.data;
  },
);

// Update Employee Status
export const updateEmployeeStatus = createAsyncThunk(
  "employee/updateEmployeeStatus",
  async ({ id, values }) => {
    const res = await employeeApi.updateEmployeeStatusApi({ id, values });
    return { id, ...res.data };
  },
);

// Send Employee Invitation
export const sendEmployeeInvite = createAsyncThunk(
  "employee/sendEmployeeInvite",
  async ({ id, values }) => {
    const res = await employeeApi.sendEmployeeInviteApi({ id, values });
    return res.data;
  },
);

// Resend Employee Invitation
export const resendEmployeeInvite = createAsyncThunk(
  "employee/resendEmployeeInvite",
  async ({ id, values = {} }) => {
    const res = await employeeApi.resendEmployeeInviteApi({ id, values });
    return res.data;
  },
);

// Claim Employee Account
export const employeeClaimAccount = createAsyncThunk(
  "employee/employeeClaimAccount",
  async (values) => {
    const res = await employeeApi.employeeClaimAccountApi(values);
    return res.data;
  },
);

/* =========================================================
   EMPLOYEE ROLE ASSIGNMENTS
========================================================= */

// Get Employee Assignments
export const getEmployeeAssignments = createAsyncThunk(
  "employee/getEmployeeAssignments",
  async (id) => {
    const res = await employeeApi.getEmployeeAssignmentsApi(id);
    return res.data;
  },
);

// Grant Employee Role
export const grantEmployeeRole = createAsyncThunk(
  "employee/grantEmployeeRole",
  async ({ id, values }) => {
    const res = await employeeApi.grantEmployeeRoleApi({ id, values });
    return res.data;
  },
);

// Revoke Employee Role
export const revokeEmployeeRole = createAsyncThunk(
  "employee/revokeEmployeeRole",
  async ({ id, assignmentId }) => {
    const res = await employeeApi.revokeEmployeeRoleApi({
      id,
      assignmentId,
    });

    return res.data;
  },
);

/* =========================================================
   EMPLOYEE OPERATIONS
========================================================= */

// Get Employee Operations
export const getEmployeeOperations = createAsyncThunk(
  "employee/getEmployeeOperations",
  async (id) => {
    const res = await employeeApi.getEmployeeOperationsApi(id);
    return res.data;
  },
);

// Assign Employee Operation
export const assignEmployeeOperation = createAsyncThunk(
  "employee/assignEmployeeOperation",
  async ({ id, values }) => {
    const res = await employeeApi.assignEmployeeOperationApi({
      id,
      values,
    });

    return res.data;
  },
);

//Toggle employee operation status
export const updateEmployeeOperationStatus = createAsyncThunk(
  "employee/updateEmployeeOperationStatus",
  async ({ id, operationKey, values }) => {
    const res = await employeeApi.updateEmployeeOperationStatusApi({
      id,
      operationKey,
      values,
    });

    return {
      operationKey,
      status: values.status,
      ...res.data,
    };
  },
);

// Revoke Employee Operation
export const revokeEmployeeOperation = createAsyncThunk(
  "employee/revokeEmployeeOperation",
  async ({ id, operationKey }) => {
    const res = await employeeApi.revokeEmployeeOperationApi({
      id,
      operationKey,
    });

    return res.data;
  },
);

const employeeSlice = createSlice({
  name: "employee",

  initialState: {
    isListingEmployees: false,
    isGettingEmployeeDetails: false,
    isCreatingEmployee: false,
    isUpdatingEmployee: false,
    isSendingEmployeeInvite: false,
    isResendingEmployeeInvite: false,
    isClaimingEmployeeAccount: false,
    isUpdatingEmployeeStatus: false,

    employeesData: null,
    employeeData: null,
    employeeInviteData: null,
    employeeClaimData: null,

    // Employee Role Assignments
    isLoadingAssignments: false,
    isGrantingRole: false,
    isRevokingRole: false,
    employeeAssignments: [],

    // Employee Operations
    isLoadingOperations: false,
    isAssigningOperation: false,
    isRevokingOperation: false,
    isUpdatingOperationStatus: false,
    employeeOperations: [],
  },

  reducers: {
    clearEmployeeInviteData: (state) => {
      state.employeeInviteData = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // List Employees
      .addCase(listEmployees.pending, (state) => {
        state.isListingEmployees = true;
      })
      .addCase(listEmployees.fulfilled, (state, action) => {
        state.isListingEmployees = false;
        state.employeesData = action.payload;
      })
      .addCase(listEmployees.rejected, (state, action) => {
        state.isListingEmployees = false;
        toast.error(action.error.message || "Failed to fetch employees");
      })

      // Get Employee Details
      .addCase(getEmployeeDetails.pending, (state) => {
        state.isGettingEmployeeDetails = true;
      })
      .addCase(getEmployeeDetails.fulfilled, (state, action) => {
        state.isGettingEmployeeDetails = false;
        state.employeeData = action.payload;
      })
      .addCase(getEmployeeDetails.rejected, (state, action) => {
        state.isGettingEmployeeDetails = false;
        toast.error(action.error.message || "Failed to fetch employee details");
      })

      // Create Employee
      .addCase(createEmployee.pending, (state) => {
        state.isCreatingEmployee = true;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.isCreatingEmployee = false;
        state.employeeData = action.payload;
        toast.success(
          action.payload?.message || "Employee created successfully!",
        );
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.isCreatingEmployee = false;
        toast.error(action.error.message || "Failed to create employee");
      })

      // Update Employee
      .addCase(updateEmployee.pending, (state) => {
        state.isUpdatingEmployee = true;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.isUpdatingEmployee = false;
        state.employeeData = action.payload;
        toast.success(
          action.payload?.message || "Employee updated successfully!",
        );
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.isUpdatingEmployee = false;
        toast.error(action.error.message || "Failed to update employee");
      })

      // Update Employee Status
      .addCase(updateEmployeeStatus.pending, (state) => {
        state.isUpdatingEmployeeStatus = true;
      })
      .addCase(updateEmployeeStatus.fulfilled, (state, action) => {
        state.isUpdatingEmployeeStatus = false;

        const { id, status, version, response } = action.payload;

        const updateEmployeeRow = (employee) =>
          employee.id === id
            ? {
                ...employee,
                status,
                ...(version !== undefined && { version }),
              }
            : employee;

        if (Array.isArray(state.employeesData?.employees)) {
          state.employeesData.employees =
            state.employeesData.employees.map(updateEmployeeRow);
        } else if (Array.isArray(state.employeesData)) {
          state.employeesData = state.employeesData.map(updateEmployeeRow);
        }

        if (state.employeeData?.id === id) {
          state.employeeData = {
            ...state.employeeData,
            status,
            ...(version !== undefined && { version }),
          };
        }

        toast.success(
          response?.message || "Employee status updated successfully!",
        );
      })
      .addCase(updateEmployeeStatus.rejected, (state, action) => {
        state.isUpdatingEmployeeStatus = false;
        toast.error(action.error.message || "Failed to update employee status");
      })

      // Send Employee Invitation
      .addCase(sendEmployeeInvite.pending, (state) => {
        state.isSendingEmployeeInvite = true;
        state.employeeInviteData = null;
      })
      .addCase(sendEmployeeInvite.fulfilled, (state, action) => {
        state.isSendingEmployeeInvite = false;
        state.employeeInviteData = action.payload;
        toast.success(
          action.payload?.message ||
            "Employee invitation created successfully!",
        );
      })
      .addCase(sendEmployeeInvite.rejected, (state, action) => {
        state.isSendingEmployeeInvite = false;
        toast.error(
          action.error.message || "Failed to send employee invitation",
        );
      })

      // Resend Employee Invitation
      .addCase(resendEmployeeInvite.pending, (state) => {
        state.isResendingEmployeeInvite = true;
        state.employeeInviteData = null;
      })
      .addCase(resendEmployeeInvite.fulfilled, (state, action) => {
        state.isResendingEmployeeInvite = false;
        state.employeeInviteData = action.payload;
        toast.success(
          action.payload?.message || "Employee invitation resent successfully!",
        );
      })
      .addCase(resendEmployeeInvite.rejected, (state, action) => {
        state.isResendingEmployeeInvite = false;
        toast.error(
          action.error.message || "Failed to resend employee invitation",
        );
      })

      // Claim Employee Account
      .addCase(employeeClaimAccount.pending, (state) => {
        state.isClaimingEmployeeAccount = true;
      })
      .addCase(employeeClaimAccount.fulfilled, (state, action) => {
        state.isClaimingEmployeeAccount = false;
        state.employeeClaimData = action.payload;
        toast.success(
          action.payload?.message || "Account claimed successfully!",
        );
      })
      .addCase(employeeClaimAccount.rejected, (state, action) => {
        state.isClaimingEmployeeAccount = false;
        toast.error(action.error.message || "Failed to claim employee account");
      })

      // ==================================================
      // EMPLOYEE ROLE ASSIGNMENTS
      // ==================================================

      // Get Employee Assignments
      .addCase(getEmployeeAssignments.pending, (state) => {
        state.isLoadingAssignments = true;
      })
      .addCase(getEmployeeAssignments.fulfilled, (state, action) => {
        state.isLoadingAssignments = false;
        state.employeeAssignments = action.payload;
      })
      .addCase(getEmployeeAssignments.rejected, (state, action) => {
        state.isLoadingAssignments = false;
        toast.error(
          action.error.message || "Failed to fetch employee assignments",
        );
      })

      // Grant Employee Role
      .addCase(grantEmployeeRole.pending, (state) => {
        state.isGrantingRole = true;
      })
      .addCase(grantEmployeeRole.fulfilled, (state, action) => {
        state.isGrantingRole = false;
        toast.success(action.payload?.message || "Role assigned successfully!");
      })
      .addCase(grantEmployeeRole.rejected, (state, action) => {
        state.isGrantingRole = false;
        toast.error(action.error.message || "Failed to assign role");
      })

      // Revoke Employee Role
      .addCase(revokeEmployeeRole.pending, (state) => {
        state.isRevokingRole = true;
      })
      .addCase(revokeEmployeeRole.fulfilled, (state, action) => {
        state.isRevokingRole = false;
        toast.success(action.payload?.message || "Role revoked successfully!");
      })
      .addCase(revokeEmployeeRole.rejected, (state, action) => {
        state.isRevokingRole = false;
        toast.error(action.error.message || "Failed to revoke role");
      })

      // ==================================================
      // EMPLOYEE OPERATIONS
      // ==================================================

      // Get Employee Operations
      .addCase(getEmployeeOperations.pending, (state) => {
        state.isLoadingOperations = true;
      })
      .addCase(getEmployeeOperations.fulfilled, (state, action) => {
        state.isLoadingOperations = false;
        state.employeeOperations = action.payload;
      })
      .addCase(getEmployeeOperations.rejected, (state, action) => {
        state.isLoadingOperations = false;
        toast.error(
          action.error.message || "Failed to fetch employee operations",
        );
      })

      // Assign Employee Operation
      .addCase(assignEmployeeOperation.pending, (state) => {
        state.isAssigningOperation = true;
      })
      .addCase(assignEmployeeOperation.fulfilled, (state, action) => {
        state.isAssigningOperation = false;
        toast.success(
          action.payload?.message || "Operation assigned successfully!",
        );
      })
      .addCase(assignEmployeeOperation.rejected, (state, action) => {
        state.isAssigningOperation = false;
        toast.error(action.error.message || "Failed to assign operation");
      })

      // Update Employee Operation Status
      .addCase(updateEmployeeOperationStatus.pending, (state) => {
        state.isUpdatingOperationStatus = true;
      })
      .addCase(updateEmployeeOperationStatus.fulfilled, (state, action) => {
        state.isUpdatingOperationStatus = false;

        const { operationKey, status, message } = action.payload;

        const operation = state.employeeOperations.find(
          (item) =>
            (item.operationKey || item.operation?.key || item.key) ===
            operationKey,
        );

        if (operation) {
          operation.status = status;
        }

        toast.success(message || "Operation status updated successfully!");
      })
      .addCase(updateEmployeeOperationStatus.rejected, (state, action) => {
        state.isUpdatingOperationStatus = false;
        toast.error(
          action.error.message || "Failed to update operation status",
        );
      })

      // Revoke Employee Operation
      .addCase(revokeEmployeeOperation.pending, (state) => {
        state.isRevokingOperation = true;
      })
      .addCase(revokeEmployeeOperation.fulfilled, (state, action) => {
        state.isRevokingOperation = false;
        toast.success(
          action.payload?.message || "Operation revoked successfully!",
        );
      })
      .addCase(revokeEmployeeOperation.rejected, (state, action) => {
        state.isRevokingOperation = false;
        toast.error(action.error.message || "Failed to revoke operation");
      });
  },
});

export const { clearEmployeeInviteData } = employeeSlice.actions;

export default employeeSlice.reducer;
