
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

const employeeSlice = createSlice({
  name: "employee",
  initialState: {
    isListingEmployees: false,
    isGettingEmployeeDetails: false,
    isCreatingEmployee: false,
    isUpdatingEmployee: false,

    employeesData: null,
    employeeData: null,
  },
  reducers: {},
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
      });
  },
});

export default employeeSlice.reducer;
