import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import platformApi from "@store/api/platform.api";
import { toast } from "sonner";

const extractErrorMessage = (err, fallback) => {
  if (typeof err === "string") return err;
  return err?.message || err?.error?.message || fallback;
};

// 1.1 List all customer companies
export const listCompanies = createAsyncThunk(
  "platform/listCompanies",
  async (_, { rejectWithValue }) => {
    try {
      const res = await platformApi.listCompaniesApi();
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 1.2 Get single company details
export const getCompanyDetails = createAsyncThunk(
  "platform/getCompanyDetails",
  async (companyId, { rejectWithValue }) => {
    try {
      const res = await platformApi.getCompanyDetailsApi(companyId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 1.3 Create customer company + first admin
export const createCompany = createAsyncThunk(
  "platform/createCompany",
  async (values, { rejectWithValue }) => {
    try {
      const res = await platformApi.createCompanyApi(values);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 1.4 Update customer company profile
export const updateCompany = createAsyncThunk(
  "platform/updateCompany",
  async ({ companyId, values }, { rejectWithValue }) => {
    try {
      const res = await platformApi.updateCompanyApi({ companyId, values });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 1.5 Update company status
export const updateCompanyStatus = createAsyncThunk(
  "platform/updateCompanyStatus",
  async ({ companyId, to, expectedVersion }, { rejectWithValue }) => {
    try {
      const res = await platformApi.updateCompanyStatusApi({
        companyId,
        to,
        expectedVersion,
      });
      return { companyId, to, data: res.data };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 1.6 Reissue admin claim token
export const reissueAdminClaimToken = createAsyncThunk(
  "platform/reissueAdminClaimToken",
  async ({ companyId, adminPrincipalId }, { rejectWithValue }) => {
    try {
      const res = await platformApi.reissueAdminClaimTokenApi({
        companyId,
        adminPrincipalId,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 2.1 View global operations catalogue
export const getGlobalOperations = createAsyncThunk(
  "platform/getGlobalOperations",
  async (_, { rejectWithValue }) => {
    try {
      const res = await platformApi.getGlobalOperationsApi();
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 2.2 Add operation to global catalogue
export const createGlobalOperation = createAsyncThunk(
  "platform/createGlobalOperation",
  async (values, { rejectWithValue }) => {
    try {
      const res = await platformApi.createGlobalOperationApi(values);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// 2.3 Delete operation from catalogue
export const deleteGlobalOperation = createAsyncThunk(
  "platform/deleteGlobalOperation",
  async (key, { rejectWithValue }) => {
    try {
      const res = await platformApi.deleteGlobalOperationApi(key);
      return { key, data: res.data };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  // Companies list
  companies: [],
  isListingCompanies: false,

  // Single company details
  companyDetails: null,
  isLoadingCompany: false,

  // Company mutations
  isCreatingCompany: false,
  isUpdatingCompany: false,
  isUpdatingStatus: false,
  isReissuingClaimToken: false,

  // Generated claim modal data
  lastClaimData: null,

  // Operations catalogue
  globalOperations: [],
  isLoadingOperations: false,
  isCreatingOperation: false,
  isDeletingOperation: false,
};

const platformSlice = createSlice({
  name: "platform",
  initialState,
  reducers: {
    clearCompanyDetails: (state) => {
      state.companyDetails = null;
    },
    clearLastClaimData: (state) => {
      state.lastClaimData = null;
    },
    setLastClaimData: (state, action) => {
      state.lastClaimData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1.1 List Companies
      .addCase(listCompanies.pending, (state) => {
        state.isListingCompanies = true;
      })
      .addCase(listCompanies.fulfilled, (state, action) => {
        state.isListingCompanies = false;
        state.companies = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(listCompanies.rejected, (state, action) => {
        state.isListingCompanies = false;
        toast.error(extractErrorMessage(action.payload, "Failed to load companies"));
      })

      // 1.2 Get Single Company Details
      .addCase(getCompanyDetails.pending, (state) => {
        state.isLoadingCompany = true;
      })
      .addCase(getCompanyDetails.fulfilled, (state, action) => {
        state.isLoadingCompany = false;
        state.companyDetails = action.payload?.data || action.payload;
      })
      .addCase(getCompanyDetails.rejected, (state, action) => {
        state.isLoadingCompany = false;
        toast.error(extractErrorMessage(action.payload, "Failed to load company details"));
      })

      // 1.3 Create Company
      .addCase(createCompany.pending, (state) => {
        state.isCreatingCompany = true;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.isCreatingCompany = false;
        state.lastClaimData = action.payload;
        toast.success("Customer company and admin provisioned successfully!");
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.isCreatingCompany = false;
        toast.error(extractErrorMessage(action.payload, "Failed to create company"));
      })

      // 1.4 Update Company
      .addCase(updateCompany.pending, (state) => {
        state.isUpdatingCompany = true;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.isUpdatingCompany = false;
        const updated = action.payload?.data || action.payload;
        if (state.companyDetails && updated) {
          state.companyDetails = { ...state.companyDetails, ...updated };
        }
        toast.success("Company profile updated successfully!");
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.isUpdatingCompany = false;
        toast.error(extractErrorMessage(action.payload, "Failed to update company"));
      })

      // 1.5 Update Status
      .addCase(updateCompanyStatus.pending, (state) => {
        state.isUpdatingStatus = true;
      })
      .addCase(updateCompanyStatus.fulfilled, (state, action) => {
        state.isUpdatingStatus = false;
        const { to } = action.payload;
        if (state.companyDetails) {
          state.companyDetails.status = to;
          if (state.companyDetails.version != null) {
            state.companyDetails.version += 1;
          }
        }
        state.companies = state.companies.map((c) =>
          c.id === action.payload.companyId
            ? { ...c, status: to, version: (c.version || 0) + 1 }
            : c
        );
        toast.success(`Company status updated to ${to}`);
      })
      .addCase(updateCompanyStatus.rejected, (state, action) => {
        state.isUpdatingStatus = false;
        toast.error(extractErrorMessage(action.payload, "Failed to update company status"));
      })

      // 1.6 Reissue Claim Token
      .addCase(reissueAdminClaimToken.pending, (state) => {
        state.isReissuingClaimToken = true;
      })
      .addCase(reissueAdminClaimToken.fulfilled, (state, action) => {
        state.isReissuingClaimToken = false;
        state.lastClaimData = action.payload;
        toast.success("New onboarding claim token issued!");
      })
      .addCase(reissueAdminClaimToken.rejected, (state, action) => {
        state.isReissuingClaimToken = false;
        toast.error(extractErrorMessage(action.payload, "Failed to reissue claim token"));
      })

      // 2.1 View Global Catalogue
      .addCase(getGlobalOperations.pending, (state) => {
        state.isLoadingOperations = true;
      })
      .addCase(getGlobalOperations.fulfilled, (state, action) => {
        state.isLoadingOperations = false;
        state.globalOperations = action.payload;
      })
      .addCase(getGlobalOperations.rejected, (state, action) => {
        state.isLoadingOperations = false;
        toast.error(extractErrorMessage(action.payload, "Failed to load operations catalogue"));
      })

      // 2.2 Create Global Operation
      .addCase(createGlobalOperation.pending, (state) => {
        state.isCreatingOperation = true;
      })
      .addCase(createGlobalOperation.fulfilled, (state, action) => {
        state.isCreatingOperation = false;
        const newOp = action.payload?.data || action.payload;
        if (Array.isArray(state.globalOperations)) {
          state.globalOperations.push(newOp);
        }
        toast.success(`Operation '${newOp?.key || "Catalogue"}' created successfully!`);
      })
      .addCase(createGlobalOperation.rejected, (state, action) => {
        state.isCreatingOperation = false;
        toast.error(extractErrorMessage(action.payload, "Failed to create operation"));
      })

      // 2.3 Delete Global Operation
      .addCase(deleteGlobalOperation.pending, (state) => {
        state.isDeletingOperation = true;
      })
      .addCase(deleteGlobalOperation.fulfilled, (state, action) => {
        state.isDeletingOperation = false;
        const deletedKey = action.payload?.key;
        if (Array.isArray(state.globalOperations)) {
          state.globalOperations = state.globalOperations.filter(
            (op) => op.key !== deletedKey
          );
        } else if (typeof state.globalOperations === "object" && state.globalOperations !== null) {
          // If grouped by domain { DOMAIN: [...] }
          const updated = {};
          for (const [dom, ops] of Object.entries(state.globalOperations)) {
            if (Array.isArray(ops)) {
              updated[dom] = ops.filter((op) => op.key !== deletedKey);
            }
          }
          state.globalOperations = updated;
        }
        toast.success(`Operation '${deletedKey}' deleted from catalogue`);
      })
      .addCase(deleteGlobalOperation.rejected, (state, action) => {
        state.isDeletingOperation = false;
        toast.error(
          extractErrorMessage(
            action.payload,
            "Cannot delete operation (it may currently be in use)"
          )
        );
      });
  },
});

export const { clearCompanyDetails, clearLastClaimData, setLastClaimData } =
  platformSlice.actions;

export default platformSlice.reducer;

