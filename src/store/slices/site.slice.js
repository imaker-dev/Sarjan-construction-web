import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import siteApi from "@store/api/site.api";
import { extractList } from "@utils/api.utils";
import { extractApiError } from "@utils/error.handlers";
import { toast } from "sonner";

export const fetchSiteTeam = createAsyncThunk(
  "site/fetchSiteTeam",
  async ({ siteId, params = {} }, { rejectWithValue }) => {
    try {
      const res = await siteApi.getSiteTeamApi(siteId, params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const executeSiteWorkforceAction = createAsyncThunk(
  "site/executeSiteWorkforceAction",
  async ({ siteId, employeeId, action, values = {} }, { rejectWithValue }) => {
    try {
      const res = await siteApi.workforceActionSiteApi({ id: siteId, employeeId, action, values });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchSiteDocuments = createAsyncThunk(
  "site/fetchSiteDocuments",
  async ({ siteId, params = {} }, { rejectWithValue }) => {
    try {
      const res = await siteApi.getSiteDocumentsApi(siteId, params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const linkSiteDocument = createAsyncThunk(
  "site/linkSiteDocument",
  async ({ siteId, values }, { rejectWithValue }) => {
    try {
      const res = await siteApi.linkSiteDocumentApi({ id: siteId, values });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchSiteActivity = createAsyncThunk(
  "site/fetchSiteActivity",
  async ({ siteId, params = {} }, { rejectWithValue }) => {
    try {
      const res = await siteApi.getSiteActivityApi(siteId, params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

// List sites
export const listSites = createAsyncThunk(
  "site/listSites",
  async (values = {}) => {
    const res = await siteApi.listSitesApi(values);
    return res.data;
  },
);

// Get site details
export const getSiteDetails = createAsyncThunk(
  "site/getSiteDetails",
  async (id) => {
    const res = await siteApi.getSiteDetailsApi(id);
    return res.data;
  },
);

// Create site
export const createSite = createAsyncThunk(
  "site/createSite",
  async (values) => {
    const res = await siteApi.createSiteApi(values);
    return res.data;
  },
);

// Update site
export const updateSite = createAsyncThunk(
  "site/updateSite",
  async ({ id, values }) => {
    const res = await siteApi.updateSiteApi({ id, values });
    return res.data;
  },
);

// Update site status
export const updateSiteStatus = createAsyncThunk(
  "site/updateSiteStatus",
  async ({ id, values }) => {
    const res = await siteApi.updateSiteStatusApi({
      id,
      values,
    });
    return res.data;
  },
);

const siteSlice = createSlice({
  name: "site",

  initialState: {
    isListingSites: false,
    isGettingSiteDetails: false,
    isCreatingSite: false,
    isUpdatingSite: false,
    isUpdatingSiteStatus: false,

    sitesData: null,
    siteData: null,
    siteTeam: [],
    isLoadingSiteTeam: false,
    siteDocuments: [],
    isLoadingSiteDocs: false,
    siteActivity: [],
    isLoadingSiteActivity: false,
    isMutatingSiteScope: false,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      // List sites
      .addCase(listSites.pending, (state) => {
        state.isListingSites = true;
      })
      .addCase(listSites.fulfilled, (state, action) => {
        state.isListingSites = false;
        state.sitesData = action.payload;
      })
      .addCase(listSites.rejected, (state, action) => {
        state.isListingSites = false;
        toast.error(action.error.message || "Failed to fetch sites");
      })

      // Get site details
      .addCase(getSiteDetails.pending, (state) => {
        state.isGettingSiteDetails = true;
        state.siteData = null;
      })
      .addCase(getSiteDetails.fulfilled, (state, action) => {
        state.isGettingSiteDetails = false;
        state.siteData = action.payload;
      })
      .addCase(getSiteDetails.rejected, (state, action) => {
        state.isGettingSiteDetails = false;
        state.siteData = null;

        toast.error(action.error.message || "Failed to fetch site details");
      })

      // Create site
      .addCase(createSite.pending, (state) => {
        state.isCreatingSite = true;
      })
      .addCase(createSite.fulfilled, (state, action) => {
        state.isCreatingSite = false;
        state.siteData = action.payload;

        toast.success(action.payload?.message || "Site created successfully!");
      })
      .addCase(createSite.rejected, (state, action) => {
        state.isCreatingSite = false;
        toast.error(action.error.message || "Failed to create site");
      })

      // Update site
      .addCase(updateSite.pending, (state) => {
        state.isUpdatingSite = true;
      })
      .addCase(updateSite.fulfilled, (state, action) => {
        state.isUpdatingSite = false;
        state.siteData = action.payload;

        toast.success(action.payload?.message || "Site updated successfully!");
      })
      .addCase(updateSite.rejected, (state, action) => {
        state.isUpdatingSite = false;
        toast.error(action.error.message || "Failed to update site");
      })

      // Update site status
      .addCase(updateSiteStatus.pending, (state) => {
        state.isUpdatingSiteStatus = true;
      })
      .addCase(updateSiteStatus.fulfilled, (state, action) => {
        state.isUpdatingSiteStatus = false;

        const updatedSite = action.payload;

        const updateSiteInList = (sites) =>
          sites?.map((site) =>
            site.id === updatedSite?.id ? { ...site, ...updatedSite } : site,
          );

        if (Array.isArray(state.sitesData)) {
          state.sitesData = updateSiteInList(state.sitesData);
        } else if (Array.isArray(state.sitesData?.data)) {
          state.sitesData.data = updateSiteInList(state.sitesData.data);
        }

        state.siteData = updatedSite;

        toast.success(
          updatedSite?.message || "Site status updated successfully!",
        );
      })
      .addCase(updateSiteStatus.rejected, (state, action) => {
        state.isUpdatingSiteStatus = false;
        toast.error(action.error.message || "Failed to update site status");
      })

      .addCase(fetchSiteTeam.pending, (state) => {
        state.isLoadingSiteTeam = true;
      })
      .addCase(fetchSiteTeam.fulfilled, (state, action) => {
        state.isLoadingSiteTeam = false;
        state.siteTeam = extractList(action.payload, "team");
      })
      .addCase(fetchSiteTeam.rejected, (state, action) => {
        state.isLoadingSiteTeam = false;
        toast.error(extractApiError(action.payload, "Failed to load site team"));
      })

      .addCase(fetchSiteDocuments.pending, (state) => {
        state.isLoadingSiteDocs = true;
      })
      .addCase(fetchSiteDocuments.fulfilled, (state, action) => {
        state.isLoadingSiteDocs = false;
        state.siteDocuments = extractList(action.payload, "documents");
      })
      .addCase(fetchSiteDocuments.rejected, (state, action) => {
        state.isLoadingSiteDocs = false;
        toast.error(extractApiError(action.payload, "Failed to load site documents"));
      })

      .addCase(fetchSiteActivity.pending, (state) => {
        state.isLoadingSiteActivity = true;
      })
      .addCase(fetchSiteActivity.fulfilled, (state, action) => {
        state.isLoadingSiteActivity = false;
        state.siteActivity = extractList(action.payload, "logs");
      })
      .addCase(fetchSiteActivity.rejected, (state, action) => {
        state.isLoadingSiteActivity = false;
        toast.error(extractApiError(action.payload, "Failed to load site activity"));
      })

      .addMatcher(
        isAnyOf(executeSiteWorkforceAction.pending, linkSiteDocument.pending),
        (state) => {
          state.isMutatingSiteScope = true;
        },
      )
      .addMatcher(
        isAnyOf(executeSiteWorkforceAction.fulfilled, linkSiteDocument.fulfilled),
        (state) => {
          state.isMutatingSiteScope = false;
          toast.success("Action completed successfully.");
        },
      )
      .addMatcher(
        isAnyOf(executeSiteWorkforceAction.rejected, linkSiteDocument.rejected),
        (state, action) => {
          state.isMutatingSiteScope = false;
          toast.error(extractApiError(action.payload, "Operation failed"));
        },
      );
  },
});

export default siteSlice.reducer;
