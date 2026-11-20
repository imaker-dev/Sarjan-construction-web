import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import departmentApi from "@store/api/department.api";
import { toast } from "sonner";

// --------------------------------------------------
// ASYNC THUNKS
// --------------------------------------------------

// List departments
export const listDepartments = createAsyncThunk(
  "department/listDepartments",
  async (values = {}) => {
    const res = await departmentApi.listDepartmentsApi(values);
    return res.data;
  },
);

// Get department details by ID
export const getDepartmentById = createAsyncThunk(
  "department/getDepartmentById",
  async (id) => {
    const res = await departmentApi.getDepartmentByIdApi(id);
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

// --------------------------------------------------
// DEPARTMENT OPERATIONS
// --------------------------------------------------

// List department operations
export const listDepartmentOperations = createAsyncThunk(
  "department/listDepartmentOperations",
  async (departmentId) => {
    const res = await departmentApi.getDepartmentOperationsApi(departmentId);
    return res.data;
  },
);

// Enable department operation
export const enableDepartmentOperation = createAsyncThunk(
  "department/enableDepartmentOperation",
  async ({ departmentId, values }) => {
    const res = await departmentApi.createDepartmentOperationApi(
      departmentId,
      values,
    );
    return res.data;
  },
);

// Update department operation
export const updateDepartmentOperation = createAsyncThunk(
  "department/updateDepartmentOperation",
  async ({ departmentId, operationId, values }) => {
    const res = await departmentApi.updateDepartmentOperationApi(
      departmentId,
      operationId,
      values,
    );
    return res.data;
  },
);

// Disable department operation
export const disableDepartmentOperation = createAsyncThunk(
  "department/disableDepartmentOperation",
  async ({ departmentId, operationKey }) => {
    const res = await departmentApi.deleteDepartmentOperationApi(
      departmentId,
      operationKey,
    );
    return res.data;
  },
);

// --------------------------------------------------
// INITIAL STATE
// --------------------------------------------------

const initialState = {
  isListingDepartments: false,
  isCreatingDepartment: false,
  isUpdatingDepartment: false,
  isUpdatingDepartmentStatus: false,

  departmentsData: null,
  departmentData: null,

  departmentDetailsData: null,
  isGettingDepartmentDetails: false,

  departmentOperationsData: [],
  isListingDepartmentOperations: false,
  isEnablingDepartmentOperation: false,
  isUpdatingDepartmentOperation: false,
  isDisablingDepartmentOperation: false,
};

// --------------------------------------------------
// SLICE
// --------------------------------------------------

const departmentSlice = createSlice({
  name: "department",
  initialState,

  reducers: {
    clearDepartmentOperations: (state) => {
      state.departmentOperationsData = [];
    },
  },

  extraReducers: (builder) => {
    builder

      // ----------------------------------------------
      // List departments
      // ----------------------------------------------

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

      // ----------------------------------------------
      // Get department details by ID
      // ----------------------------------------------

      .addCase(getDepartmentById.pending, (state) => {
        state.isGettingDepartmentDetails = true;
        state.departmentDetailsData = null;
      })
      .addCase(getDepartmentById.fulfilled, (state, action) => {
        state.isGettingDepartmentDetails = false;
        state.departmentDetailsData = action.payload;
      })
      .addCase(getDepartmentById.rejected, (state, action) => {
        state.isGettingDepartmentDetails = false;
        toast.error(
          action.error.message || "Failed to fetch department details",
        );
      })

      // ----------------------------------------------
      // Create department
      // ----------------------------------------------

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

      // ----------------------------------------------
      // Update department
      // ----------------------------------------------

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

      // ----------------------------------------------
      // Update department status
      // ----------------------------------------------

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
      })

      // ----------------------------------------------
      // List department operations
      // ----------------------------------------------

      .addCase(listDepartmentOperations.pending, (state) => {
        state.isListingDepartmentOperations = true;
      })
      .addCase(listDepartmentOperations.fulfilled, (state, action) => {
        state.isListingDepartmentOperations = false;
        state.departmentOperationsData = action.payload;
      })
      .addCase(listDepartmentOperations.rejected, (state, action) => {
        state.isListingDepartmentOperations = false;
        toast.error(
          action.error.message || "Failed to fetch department operations",
        );
      })

      // ----------------------------------------------
      // Enable department operation
      // ----------------------------------------------

      .addCase(enableDepartmentOperation.pending, (state) => {
        state.isEnablingDepartmentOperation = true;
      })
      .addCase(enableDepartmentOperation.fulfilled, (state, action) => {
        state.isEnablingDepartmentOperation = false;

        toast.success(
          action.payload?.message ||
            "Department operation enabled successfully",
        );
      })
      .addCase(enableDepartmentOperation.rejected, (state, action) => {
        state.isEnablingDepartmentOperation = false;
        toast.error(
          action.error.message || "Failed to enable department operation",
        );
      })

      // ----------------------------------------------
      // Update department operation
      // ----------------------------------------------

      .addCase(updateDepartmentOperation.pending, (state) => {
        state.isUpdatingDepartmentOperation = true;
      })
      .addCase(updateDepartmentOperation.fulfilled, (state, action) => {
        state.isUpdatingDepartmentOperation = false;

        toast.success(
          action.payload?.message ||
            "Department operation updated successfully",
        );
      })
      .addCase(updateDepartmentOperation.rejected, (state, action) => {
        state.isUpdatingDepartmentOperation = false;
        toast.error(
          action.error.message || "Failed to update department operation",
        );
      })

      // ----------------------------------------------
      // Disable department operation
      // ----------------------------------------------

      .addCase(disableDepartmentOperation.pending, (state) => {
        state.isDisablingDepartmentOperation = true;
      })
      .addCase(disableDepartmentOperation.fulfilled, (state) => {
        state.isDisablingDepartmentOperation = false;

        toast.success("Department operation disabled successfully");
      })
      .addCase(disableDepartmentOperation.rejected, (state, action) => {
        state.isDisablingDepartmentOperation = false;
        toast.error(
          action.error.message || "Failed to disable department operation",
        );
      });
  },
});

export const { clearDepartmentOperations } = departmentSlice.actions;

export default departmentSlice.reducer;
