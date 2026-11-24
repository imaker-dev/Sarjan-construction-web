import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import siteApi from "@store/api/site.api";
import { toast } from "sonner";

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
      });
  },
});

export default siteSlice.reducer;
