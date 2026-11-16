
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import companyApi from "@store/api/company.api";
import { toast } from "sonner";

// ----------------------------------------------------------------------
// Async Thunks
// ----------------------------------------------------------------------

// List Companies
export const getAllCompanies = createAsyncThunk(
  "company/getAllCompanies",
  async (values = {}) => {
    const res = await companyApi.listCompaniesApi(values);
    return res.data;
  },
);

// Create Company
export const createCompany = createAsyncThunk(
  "company/createCompany",
  async (values) => {
    const res = await companyApi.createCompanyApi(values);
    return res.data;
  },
);

// Get Company Details
export const getCompanyDetails = createAsyncThunk(
  "company/getCompanyDetails",
  async (companyId) => {
    const res = await companyApi.getCompanyDetailsApi(companyId);
    return res.data;
  },
);

// Update Company
export const updateCompany = createAsyncThunk(
  "company/updateCompany",
  async (values) => {
    const res = await companyApi.updateCompanyApi(values);
    return res.data;
  },
);

// Reissue Company Admin Claim Token
export const reissueCompanyClaimToken = createAsyncThunk(
  "company/reissueCompanyClaimToken",
  async (companyId) => {
    const res = await companyApi.reissueCompanyClaimTokenApi(companyId);
    return res.data;
  },
);

// Update Company Status
export const updateCompanyStatus = createAsyncThunk(
  "company/updateCompanyStatus",
  async (values) => {
    const res = await companyApi.updateCompanyStatusApi(values);
    return res.data;
  },
);

// ----------------------------------------------------------------------
// Initial State
// ----------------------------------------------------------------------

const initialState = {
  companiesData: [],
  companyDetails: null,

  isListingCompanies: false,
  isCreatingCompany: false,
  isFetchingCompanyDetails: false,
  isUpdatingCompany: false,
  isReissuingClaimToken: false,
  isUpdatingCompanyStatus: false,
};

// ----------------------------------------------------------------------
// Slice
// ----------------------------------------------------------------------

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    clearCompanyDetails: (state) => {
      state.companyDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // List Companies
      .addCase(getAllCompanies.pending, (state) => {
        state.isListingCompanies = true;
      })
      .addCase(getAllCompanies.fulfilled, (state, action) => {
        state.isListingCompanies = false;
        state.companiesData = action.payload;
      })
      .addCase(getAllCompanies.rejected, (state) => {
        state.isListingCompanies = false;
        toast.error("Failed to fetch companies");
      })

      // Create Company
      .addCase(createCompany.pending, (state) => {
        state.isCreatingCompany = true;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.isCreatingCompany = false;

        if (action.payload) {
          state.companiesData.unshift(action.payload);
        }

        toast.success("Company created successfully");
      })
      .addCase(createCompany.rejected, (state) => {
        state.isCreatingCompany = false;
        toast.error("Failed to create company");
      })

      // Get Company Details
      .addCase(getCompanyDetails.pending, (state) => {
        state.isFetchingCompanyDetails = true;
      })
      .addCase(getCompanyDetails.fulfilled, (state, action) => {
        state.isFetchingCompanyDetails = false;
        state.companyDetails = action.payload;
      })
      .addCase(getCompanyDetails.rejected, (state) => {
        state.isFetchingCompanyDetails = false;
        toast.error("Failed to fetch company details");
      })

      // Update Company
      .addCase(updateCompany.pending, (state) => {
        state.isUpdatingCompany = true;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.isUpdatingCompany = false;

        const updatedCompany = action.payload;
        const index = state.companiesData.findIndex(
          (company) => company.id === updatedCompany?.id,
        );

        if (index !== -1) {
          state.companiesData[index] = updatedCompany;
        }

        if (
          state.companyDetails?.id === updatedCompany?.id
        ) {
          state.companyDetails = updatedCompany;
        }

        toast.success("Company updated successfully");
      })
      .addCase(updateCompany.rejected, (state) => {
        state.isUpdatingCompany = false;
        toast.error("Failed to update company");
      })

      // Reissue Claim Token
      .addCase(reissueCompanyClaimToken.pending, (state) => {
        state.isReissuingClaimToken = true;
      })
      .addCase(reissueCompanyClaimToken.fulfilled, (state) => {
        state.isReissuingClaimToken = false;
        toast.success("Claim code reissued successfully");
      })
      .addCase(reissueCompanyClaimToken.rejected, (state) => {
        state.isReissuingClaimToken = false;
        toast.error("Failed to reissue claim code");
      })

      // Update Company Status
      .addCase(updateCompanyStatus.pending, (state) => {
        state.isUpdatingCompanyStatus = true;
      })
      .addCase(updateCompanyStatus.fulfilled, (state, action) => {
        state.isUpdatingCompanyStatus = false;

        const updatedCompany = action.payload;
        const index = state.companiesData.findIndex(
          (company) => company.id === updatedCompany?.id,
        );

        if (index !== -1) {
          state.companiesData[index] = updatedCompany;
        }

        if (
          state.companyDetails?.id === updatedCompany?.id
        ) {
          state.companyDetails = updatedCompany;
        }

        toast.success("Company status updated successfully");
      })
      .addCase(updateCompanyStatus.rejected, (state) => {
        state.isUpdatingCompanyStatus = false;
        toast.error("Failed to update company status");
      });
  },
});

export const { clearCompanyDetails } = companySlice.actions;

export default companySlice.reducer;
