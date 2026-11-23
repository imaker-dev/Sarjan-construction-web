
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import profileApi from "@store/api/profile.api";
import { toast } from "sonner";

// Get profile
export const getProfile = createAsyncThunk(
  "profile/getProfile",
  async () => {
    const res = await profileApi.getProfileApi();
    return res.data;
  },
);

// Upload document
export const uploadDocument = createAsyncThunk(
  "profile/uploadDocument",
  async (values) => {
    const res = await profileApi.uploadDocumentApi(values);
    return res.data;
  },
);

const profileSlice = createSlice({
  name: "profile",

  initialState: {
    isGettingProfile: false,
    isUploadingDocument: false,
    profileData: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      // Get profile
      .addCase(getProfile.pending, (state) => {
        state.isGettingProfile = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isGettingProfile = false;
        state.profileData = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isGettingProfile = false;
        toast.error(action.error.message || "Failed to fetch profile");
      })

      // Upload document
      .addCase(uploadDocument.pending, (state) => {
        state.isUploadingDocument = true;
      })
      .addCase(uploadDocument.fulfilled, (state) => {
        state.isUploadingDocument = false;
        toast.success("Document uploaded successfully");
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isUploadingDocument = false;
        toast.error(action.error.message || "Failed to upload document");
      });
  },
});

export default profileSlice.reducer;
