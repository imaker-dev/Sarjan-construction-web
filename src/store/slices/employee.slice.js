
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

    employeesData: null,
    employeeData: null,
    employeeInviteData: null,
    employeeClaimData: null,
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

      // Send Employee Invitation
      .addCase(sendEmployeeInvite.pending, (state) => {
        state.isSendingEmployeeInvite = true;
        state.employeeInviteData = null;
      })
      .addCase(sendEmployeeInvite.fulfilled, (state, action) => {
        state.isSendingEmployeeInvite = false;
        state.employeeInviteData = action.payload;
        toast.success(
          action.payload?.message || "Employee invitation created successfully!",
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
        toast.error(
          action.error.message || "Failed to claim employee account",
        );
      });
  },
});

export const { clearEmployeeInviteData } = employeeSlice.actions;

export default employeeSlice.reducer;
