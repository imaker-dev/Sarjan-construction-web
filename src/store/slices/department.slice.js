
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import departmentApi from "@store/api/department.api";
import { toast } from "sonner";

// List departments
export const listDepartments = createAsyncThunk(
  "department/listDepartments",
  async (values = {}) => {
    const res = await departmentApi.listDepartmentsApi(values);
    return res.data;
  },
);

// Create department
export const createDepartment = createAsyncThunk(
  "department/createDepartment",
  async (values) => {
    const res = await departmentApi.createDepartmentApi(values);
    return res.data;
  },
);

// Update department
export const updateDepartment = createAsyncThunk(
  "department/updateDepartment",
  async ({ id, values }) => {
    const res = await departmentApi.updateDepartmentApi({ id, values });
    return res.data;
  },
);

const departmentSlice = createSlice({
  name: "department",

  initialState: {
    isListingDepartments: false,
    isCreatingDepartment: false,
    isUpdatingDepartment: false,

    departmentsData: null,
    departmentData: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      // List departments
      .addCase(listDepartments.pending, (state) => {
        state.isListingDepartments = true;
      })
      .addCase(listDepartments.fulfilled, (state, action) => {
        state.isListingDepartments = false;
        state.departmentsData = action.payload;
      })
      .addCase(listDepartments.rejected, (state, action) => {
        state.isListingDepartments = false;
        toast.error(
          action.error.message || "Failed to fetch departments",
        );
      })

      // Create department
      .addCase(createDepartment.pending, (state) => {
        state.isCreatingDepartment = true;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.isCreatingDepartment = false;
        state.departmentData = action.payload;

        toast.success(
          action.payload?.message || "Department created successfully!",
        );
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.isCreatingDepartment = false;
        toast.error(
          action.error.message || "Failed to create department",
        );
      })

      // Update department
      .addCase(updateDepartment.pending, (state) => {
        state.isUpdatingDepartment = true;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.isUpdatingDepartment = false;
        state.departmentData = action.payload;

        toast.success(
          action.payload?.message || "Department updated successfully!",
        );
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.isUpdatingDepartment = false;
        toast.error(
          action.error.message || "Failed to update department",
        );
      });
  },
});

export default departmentSlice.reducer;
