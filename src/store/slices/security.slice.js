import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import securityApi from "@store/api/security.api";
import { toast } from "sonner";

// Change password
export const changePassword = createAsyncThunk(
  "security/changePassword",
  async (values) => {
    const res = await securityApi.changePasswordApi(values);
    return res.data;
  },
);

// Request 2FA setup
export const setupMfa = createAsyncThunk("security/setupMfa", async () => {
  const res = await securityApi.setupMfaApi();
  return res.data;
});

// Enable 2FA
export const enableMfa = createAsyncThunk(
  "security/enableMfa",
  async (values) => {
    const res = await securityApi.enableMfaApi(values);
    return res.data;
  },
);

// Resend 2FA OTP
export const resendMfaOtp = createAsyncThunk(
  "security/resendMfaOtp",
  async (values) => {
    const res = await securityApi.resendMfaOtpApi(values);
    return res.data;
  },
);

// Disable 2FA
export const disableMfa = createAsyncThunk("security/disableMfa", async () => {
  const res = await securityApi.disableMfaApi();
  return res.data;
});

// Get 2FA status
export const getMfaStatus = createAsyncThunk(
  "security/getMfaStatus",
  async () => {
    const res = await securityApi.getMfaStatusApi();
    return res.data;
  },
);



const securitySlice = createSlice({
  name: "security",

  initialState: {
    isChangingPassword: false,
    isSettingUpMfa: false,
    isEnablingMfa: false,
    isResendingMfaOtp: false,
    isDisablingMfa: false,
    isGettingMfaStatus: false,

    passwordData: null,
    mfaSetupData: null,
    mfaData: null,
    mfaStatusData: null,
    mfaVerificationData: null,
  },

  reducers: {
    clearMfaSetupData: (state) => {
      state.mfaSetupData = null;
    },

    clearMfaVerificationData: (state) => {
      state.mfaVerificationData = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Change password
      .addCase(changePassword.pending, (state) => {
        state.isChangingPassword = true;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isChangingPassword = false;
        state.passwordData = action.payload;

        toast.success(
          action.payload?.message || "Password changed successfully!",
        );
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isChangingPassword = false;
        toast.error(action.error.message || "Failed to change password");
      })

      // Request 2FA setup
      .addCase(setupMfa.pending, (state) => {
        state.isSettingUpMfa = true;
      })
      .addCase(setupMfa.fulfilled, (state, action) => {
        state.isSettingUpMfa = false;
        state.mfaSetupData = action.payload;
      })
      .addCase(setupMfa.rejected, (state, action) => {
        state.isSettingUpMfa = false;
        toast.error(action.error.message || "Failed to start 2FA setup");
      })

      // Enable 2FA
      .addCase(enableMfa.pending, (state) => {
        state.isEnablingMfa = true;
      })
      .addCase(enableMfa.fulfilled, (state, action) => {
        state.isEnablingMfa = false;
        state.mfaData = action.payload;

        state.mfaStatusData = {
          ...state.mfaStatusData,
          mfaEnabled: action.payload?.mfaEnabled ?? true,
          mfaType: action.payload?.mfaType,
        };

        state.mfaSetupData = null;

        toast.success(
          action.payload?.message || "Two-factor authentication enabled!",
        );
      })
      .addCase(enableMfa.rejected, (state, action) => {
        state.isEnablingMfa = false;
        toast.error(action.error.message || "Failed to enable 2FA");
      })

      // Resend 2FA OTP
      .addCase(resendMfaOtp.pending, (state) => {
        state.isResendingMfaOtp = true;
      })
      .addCase(resendMfaOtp.fulfilled, (state, action) => {
        state.isResendingMfaOtp = false;
        state.mfaSetupData = {
          ...state.mfaSetupData,
          ...action.payload,
        };

        toast.success(action.payload?.message || "OTP sent successfully!");
      })
      .addCase(resendMfaOtp.rejected, (state, action) => {
        state.isResendingMfaOtp = false;
        toast.error(action.error.message || "Failed to resend OTP");
      })

      // Disable 2FA
      .addCase(disableMfa.pending, (state) => {
        state.isDisablingMfa = true;
      })
      .addCase(disableMfa.fulfilled, (state, action) => {
        state.isDisablingMfa = false;
        state.mfaData = action.payload;

        state.mfaStatusData = {
          ...state.mfaStatusData,
          mfaEnabled: false,
          mfaType: null,
        };

        toast.success(
          action.payload?.message || "Two-factor authentication disabled!",
        );
      })
      .addCase(disableMfa.rejected, (state, action) => {
        state.isDisablingMfa = false;
        toast.error(action.error.message || "Failed to disable 2FA");
      })

      // Get 2FA status
      .addCase(getMfaStatus.pending, (state) => {
        state.isGettingMfaStatus = true;
      })
      .addCase(getMfaStatus.fulfilled, (state, action) => {
        state.isGettingMfaStatus = false;
        state.mfaStatusData = action.payload;
      })
      .addCase(getMfaStatus.rejected, (state, action) => {
        state.isGettingMfaStatus = false;
        toast.error(action.error.message || "Failed to fetch 2FA status");
      })

  },
});

export const { clearMfaSetupData, clearMfaVerificationData } =
  securitySlice.actions;

export default securitySlice.reducer;
