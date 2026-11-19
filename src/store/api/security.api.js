
import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      // Change password
      changePasswordApi: (values) => {
        return Api.post("/auth/change-password", values);
      },

      // Request 2FA setup
      setupMfaApi: () => {
        return Api.post("/auth/mfa/setup");
      },

      // Enable 2FA
      enableMfaApi: (values) => {
        return Api.post("/auth/mfa/enable", values);
      },

      // Resend 2FA OTP
      resendMfaOtpApi: (values) => {
        return Api.post("/auth/mfa/send-otp", values);
      },

      // Disable 2FA
      disableMfaApi: () => {
        return Api.post("/auth/mfa/disable");
      },

      // Get 2FA status
      getMfaStatusApi: () => {
        return Api.get("/auth/mfa/status");
      },
    };
