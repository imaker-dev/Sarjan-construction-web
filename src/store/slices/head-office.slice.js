
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import headOfficeApi from "@store/api/head-office.api";
import { toast } from "sonner";

// --------------------------------------------------
// ASYNC THUNKS
// --------------------------------------------------

export const getAllHeadOffices = createAsyncThunk(
  "/head-offices/getAll",
  async (values = {}) => {
    const res = await headOfficeApi.getAllHeadOfficesApi(values);
    return res.data;
  },
);

export const createHeadOffice = createAsyncThunk(
  "/head-offices/create",
  async (values) => {
    const res = await headOfficeApi.createHeadOfficeApi(values);
    return res.data;
  },
);

export const updateHeadOffice = createAsyncThunk(
  "/head-offices/update",
  async ({ id, values }) => {
    const res = await headOfficeApi.updateHeadOfficeApi({ id, values });
    return res.data;
  },
);

export const updateHeadOfficeStatus = createAsyncThunk(
  "/head-offices/updateStatus",
  async ({ id, values }) => {
    const res = await headOfficeApi.updateHeadOfficeStatusApi({
      id,
      values,
    });
    return res.data;
  },
);

// --------------------------------------------------
// INITIAL STATE
// --------------------------------------------------

const initialState = {
  headOfficesData: null,
  isListingHeadOffices: false,

  isCreatingHeadOffice: false,

  isUpdatingHeadOffice: false,

  isUpdatingHeadOfficeStatus: false,
};

// --------------------------------------------------
// SLICE
// --------------------------------------------------

const headOfficeSlice = createSlice({
  name: "headOffice",
  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      // Get All Head Offices
      .addCase(getAllHeadOffices.pending, (state) => {
        state.isListingHeadOffices = true;
      })
      .addCase(getAllHeadOffices.fulfilled, (state, action) => {
        state.isListingHeadOffices = false;
        state.headOfficesData = action.payload;
      })
      .addCase(getAllHeadOffices.rejected, (state, action) => {
        state.isListingHeadOffices = false;
        toast.error(
          action.error.message || "Failed to fetch head offices",
        );
      })

      // Create Head Office
      .addCase(createHeadOffice.pending, (state) => {
        state.isCreatingHeadOffice = true;
      })
      .addCase(createHeadOffice.fulfilled, (state) => {
        state.isCreatingHeadOffice = false;
        toast.success("Head office created successfully!");
      })
      .addCase(createHeadOffice.rejected, (state, action) => {
        state.isCreatingHeadOffice = false;
        toast.error(
          action.error.message || "Failed to create head office",
        );
      })

      // Update Head Office
      .addCase(updateHeadOffice.pending, (state) => {
        state.isUpdatingHeadOffice = true;
      })
      .addCase(updateHeadOffice.fulfilled, (state) => {
        state.isUpdatingHeadOffice = false;
        toast.success("Head office updated successfully!");
      })
      .addCase(updateHeadOffice.rejected, (state, action) => {
        state.isUpdatingHeadOffice = false;
        toast.error(
          action.error.message || "Failed to update head office",
        );
      })

      // Update Head Office Status
      .addCase(updateHeadOfficeStatus.pending, (state) => {
        state.isUpdatingHeadOfficeStatus = true;
      })
      .addCase(updateHeadOfficeStatus.fulfilled, (state) => {
        state.isUpdatingHeadOfficeStatus = false;
        toast.success("Head office status updated successfully!");
      })
      .addCase(updateHeadOfficeStatus.rejected, (state, action) => {
        state.isUpdatingHeadOfficeStatus = false;
        toast.error(
          action.error.message || "Failed to update head office status",
        );
      });
  },
});

export default headOfficeSlice.reducer;
