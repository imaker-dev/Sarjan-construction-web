import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import onboardingApi from "@store/api/onboarding.api";
import { toast } from "sonner";

// Generate onboarding link
export const generateOnboardingLink = createAsyncThunk(
  "onboarding/generateOnboardingLink",
  async (values) => {
    const res = await onboardingApi.generateOnboardingLinkApi(values);
    return res.data;
  },
);

// Verify onboarding token
export const verifyOnboardingToken = createAsyncThunk(
  "onboarding/verifyOnboardingToken",
  async (token) => {
    const res = await onboardingApi.verifyOnboardingTokenApi(token);
    return res.data;
  },
);

// Complete onboarding
export const completeOnboarding = createAsyncThunk(
  "onboarding/completeOnboarding",
  async (values) => {
    const res = await onboardingApi.completeOnboardingApi(values);
    return res.data;
  },
);

const onboardingSlice = createSlice({
  name: "onboarding",

  initialState: {
    isGeneratingLink: false,
    isVerifyingToken: false,
    isCompletingOnboarding: false,

    onboardingLinkData: null,
    verifiedTokenData: null,
    onboardingData: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      // Generate onboarding link
      .addCase(generateOnboardingLink.pending, (state) => {
        state.isGeneratingLink = true;
      })
      .addCase(generateOnboardingLink.fulfilled, (state, action) => {
        state.isGeneratingLink = false;
        state.onboardingLinkData = action.payload;

        toast.success(
          action.payload?.message || "Onboarding link generated successfully!",
        );
      })
      .addCase(generateOnboardingLink.rejected, (state, action) => {
        state.isGeneratingLink = false;
        toast.error(
          action.error.message || "Failed to generate onboarding link",
        );
      })

      // Verify onboarding token
      .addCase(verifyOnboardingToken.pending, (state) => {
        state.isVerifyingToken = true;
      })
      .addCase(verifyOnboardingToken.fulfilled, (state, action) => {
        state.isVerifyingToken = false;
        state.verifiedTokenData = action.payload;
      })
      .addCase(verifyOnboardingToken.rejected, (state, action) => {
        state.isVerifyingToken = false;
        state.verifiedTokenData = null;

        toast.error(
          action.error.message || "Invalid or expired onboarding link",
        );
      })

      // Complete onboarding
      .addCase(completeOnboarding.pending, (state) => {
        state.isCompletingOnboarding = true;
      })
      .addCase(completeOnboarding.fulfilled, (state, action) => {
        state.isCompletingOnboarding = false;
        state.onboardingData = action.payload;

        toast.success(
          action.payload?.message || "Onboarding completed successfully!",
        );
      })
      .addCase(completeOnboarding.rejected, (state, action) => {
        state.isCompletingOnboarding = false;

        toast.error(action.error.message || "Failed to complete onboarding");
      });
  },
});

export default onboardingSlice.reducer;
