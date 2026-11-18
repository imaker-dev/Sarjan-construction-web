
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

const profileSlice = createSlice({
  name: "profile",

  initialState: {
    isGettingProfile: false,
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
      });
  },
});

export default profileSlice.reducer;
