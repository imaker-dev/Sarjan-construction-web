import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import operationApi from "@store/api/operation.api";
import { toast } from "sonner";

// List Operations
export const getAllOperations = createAsyncThunk(
  "operation/getAllOperations",
  async () => {
    const res = await operationApi.getAllOperationsApi();
    return res.data;
  },
);

// Create Operation
export const createOperation = createAsyncThunk(
  "operation/createOperation",
  async (values) => {
    const res = await operationApi.createOperationApi(values);
    return res.data;
  },
);

// Delete Operation
export const deleteOperation = createAsyncThunk(
  "operation/deleteOperation",
  async ({ id, key }) => {
    const res = await operationApi.deleteOperationApi({ id, key });
    return res.data;
  },
);

// Browse Operations Catalogue
export const getOperationsCatalogue = createAsyncThunk(
  "operation/getOperationsCatalogue",
  async () => {
    const res = await operationApi.getOperationsCatalogueApi();
    return res.data;
  },
);

const operationSlice = createSlice({
  name: "operation",

  initialState: {
    isListingOperations: false,
    isDeletingOperation: false,
    isCreatingOperation: false,

    operationsData: null,

    isListingOperationsCatalogue: false,
    operationsCatalogueData: [],
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // List Operations
      .addCase(getAllOperations.pending, (state) => {
        state.isListingOperations = true;
      })
      .addCase(getAllOperations.fulfilled, (state, action) => {
        state.isListingOperations = false;
        state.operationsData = action.payload;
      })
      .addCase(getAllOperations.rejected, (state, action) => {
        state.isListingOperations = false;
        toast.error(action.error.message || "Failed to fetch operations");
      })

      // Create Operation
      .addCase(createOperation.pending, (state) => {
        state.isCreatingOperation = true;
      })
      .addCase(createOperation.fulfilled, (state, action) => {
        state.isCreatingOperation = false;

        if (Array.isArray(state.operationsData)) {
          const createdOperation = action.payload?.operation || action.payload;
          state.operationsData.push(createdOperation);
        }

        toast.success(
          action.payload?.message || "Operation created successfully!",
        );
      })
      .addCase(createOperation.rejected, (state, action) => {
        state.isCreatingOperation = false;
        toast.error(action.error.message || "Failed to create operation");
      })

      // Delete Operation
      .addCase(deleteOperation.pending, (state) => {
        state.isDeletingOperation = true;
      })
      .addCase(deleteOperation.fulfilled, (state, action) => {
        state.isDeletingOperation = false;

        if (Array.isArray(state.operationsData?.operations)) {
          state.operationsData.operations =
            state.operationsData.operations.filter(
              (operation) => operation.key !== action.meta.arg.key,
            );
        }

        toast.success(
          action.payload?.message || "Operation deleted successfully!",
        );
      })
      .addCase(deleteOperation.rejected, (state, action) => {
        state.isDeletingOperation = false;
        toast.error(action.error.message || "Failed to delete operation");
      })

      // Browse Operations Catalogue
      .addCase(getOperationsCatalogue.pending, (state) => {
        state.isListingOperationsCatalogue = true;
      })
      .addCase(getOperationsCatalogue.fulfilled, (state, action) => {
        state.isListingOperationsCatalogue = false;
        state.operationsCatalogueData = action.payload;
      })
      .addCase(getOperationsCatalogue.rejected, (state, action) => {
        state.isListingOperationsCatalogue = false;
        toast.error(
          action.error.message || "Failed to fetch operations catalogue",
        );
      });
  },
});

export default operationSlice.reducer;
