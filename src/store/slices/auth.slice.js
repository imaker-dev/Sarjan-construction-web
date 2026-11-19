import { AUTH_CONFIG } from "@config/auth.config";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "@store/api/auth.api";
import { clearAuthStorage, isLoggedIn } from "@utils/auth.utils";
import { toast } from "sonner";

const logIn = isLoggedIn();

export const login = createAsyncThunk("/auth/login", async (values) => {
  const res = await authApi.logInApi(values);
  return res.data;
});

export const verifyMfa = createAsyncThunk(
  "/auth/mfa/verify",
  async (values) => {
    const res = await authApi.verifyMfaApi(values);
    return res.data;
  },
);

export const fetchMe = createAsyncThunk("/auth/me", async () => {
  const res = await authApi.meApi();
  return res.data;
});

export const verifyCompanyClaimToken = createAsyncThunk(
  "/auth/verifyCompanyClaimToken",
  async (token) => {
    const res = await authApi.verifyCompanyClaimTokenApi(token);
    return res.data;
  },
);

export const completeOnboarding = createAsyncThunk(
  "/auth/completeOnboarding",
  async (values) => {
    const res = await authApi.completeOnboardingApi(values);
    return res.data;
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    logIn,
    isLoggingIn: false,
    ifFetchingMeData: false,
    mfaChallenge: null,
    isVerifyingMfa: false,
    meData: null,
    isVerifyingCompanyClaimToken: false,
    isCompletingOnboarding: false,
  },
  reducers: {
    logout: (state) => {
      state.logIn = false;
      state.meData = null;
      state.mfaChallenge = null;
      clearAuthStorage();
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.logIn = true;
        const response = action.payload;

        if (response.mfaRequired) {
          state.logIn = false;
          state.mfaChallenge = {
            mfaToken: response.mfaToken,
            mfaType: response.mfaType,
            maskedEmail: response.maskedEmail,
            expiresInSeconds: response.expiresInSeconds,
          };
          return;
        }

        const { accessToken, refreshToken, user, message } = action.payload;
        const { remember } = action.meta.arg;
        const storage = remember ? localStorage : sessionStorage;

        storage.setItem(AUTH_CONFIG.ACCESS_TOKEN, accessToken);
        storage.setItem(AUTH_CONFIG.REFRESH_TOKEN, refreshToken);

        if (user?.companyId) {
          storage.setItem(AUTH_CONFIG.COMPANY_ID, user.companyId);
        }

        toast.success(message || "Login successful!");
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoggingIn = false;
        state.logIn = false;
        toast.error(action.error.message);
      })

      .addCase(verifyMfa.pending, (state) => {
        state.isVerifyingMfa = true;
      })
      .addCase(verifyMfa.fulfilled, (state, action) => {
        state.isVerifyingMfa = false;

        const { accessToken, refreshToken, user, message } = action.payload;
        const { remember } = action.meta.arg;
        const storage = remember ? localStorage : sessionStorage;

        storage.setItem(AUTH_CONFIG.ACCESS_TOKEN, accessToken);
        storage.setItem(AUTH_CONFIG.REFRESH_TOKEN, refreshToken);

        if (user?.companyId) {
          storage.setItem(AUTH_CONFIG.COMPANY_ID, user.companyId);
        }

        state.logIn = true;
        state.mfaChallenge = null;

        toast.success(message || "Login successful!");
      })
      .addCase(verifyMfa.rejected, (state, action) => {
        state.isVerifyingMfa = false;
        toast.error(
          action.error.message || "Invalid or expired verification code",
        );
      })

      .addCase(fetchMe.pending, (state) => {
        state.ifFetchingMeData = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.ifFetchingMeData = false;
        state.meData = action.payload;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.ifFetchingMeData = false;
        toast.error(action.error.message);
      })

      // Verify Company Claim Token
      .addCase(verifyCompanyClaimToken.pending, (state) => {
        state.isVerifyingCompanyClaimToken = true;
      })
      .addCase(verifyCompanyClaimToken.fulfilled, (state, action) => {
        state.isVerifyingCompanyClaimToken = false;
        // state.companyClaimVerificationData = action.payload;

        toast.success("Company invitation verified successfully!");
      })
      .addCase(verifyCompanyClaimToken.rejected, (state, action) => {
        state.isVerifyingCompanyClaimToken = false;

        toast.error(
          action.error.message || "Invalid or expired company invitation",
        );
      })

      // Complete Onboarding
      .addCase(completeOnboarding.pending, (state) => {
        state.isCompletingOnboarding = true;
      })
      .addCase(completeOnboarding.fulfilled, (state, action) => {
        state.isCompletingOnboarding = false;
        toast.success("Onboarding completed successfully!");
      })
      .addCase(completeOnboarding.rejected, (state, action) => {
        state.isCompletingOnboarding = false;

        toast.error(action.error.message || "Failed to complete onboarding");
      });
  },
});

export const { logout } = authSlice.actions;
const { reducer } = authSlice;
export default reducer;
