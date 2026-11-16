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

// Update department status
export const updateDepartmentStatus = createAsyncThunk(
  "department/updateDepartmentStatus",
  async ({ id, values }) => {
    const res = await departmentApi.updateDepartmentStatusApi({
      id,
      values,
    });
    return res.data;
  },
);

const departmentSlice = createSlice({
  name: "department",

  initialState: {
    isListingDepartments: false,
    isCreatingDepartment: false,
    isUpdatingDepartment: false,
    isUpdatingDepartmentStatus: false,

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
        toast.error(action.error.message || "Failed to fetch departments");
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
        toast.error(action.error.message || "Failed to create department");
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
        toast.error(action.error.message || "Failed to update department");
      })

      // Update department status
      .addCase(updateDepartmentStatus.pending, (state) => {
        state.isUpdatingDepartmentStatus = true;
      })
      .addCase(updateDepartmentStatus.fulfilled, (state, action) => {
        state.isUpdatingDepartmentStatus = false;

        const updatedDepartment = action.payload;

        const updateDepartmentInList = (departments) =>
          departments?.map((department) =>
            department.id === updatedDepartment.id
              ? { ...department, ...updatedDepartment }
              : department,
          );

        if (Array.isArray(state.departmentsData)) {
          state.departmentsData = updateDepartmentInList(state.departmentsData);
        } else if (Array.isArray(state.departmentsData?.data)) {
          state.departmentsData.data = updateDepartmentInList(
            state.departmentsData.data,
          );
        }

        state.departmentData = updatedDepartment;

        toast.success(
          updatedDepartment?.message ||
            "Department status updated successfully!",
        );
      })

      .addCase(updateDepartmentStatus.rejected, (state, action) => {
        state.isUpdatingDepartmentStatus = false;
        toast.error(
          action.error.message || "Failed to update department status",
        );
      });
  },
});

export default departmentSlice.reducer;
