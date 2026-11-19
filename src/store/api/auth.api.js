import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      logInApi: (values) => {
        return Api.post("/auth/login", values);
      },
      verifyMfaApi: (values) => {
        return Api.post("/auth/mfa/verify", values);
      },
      meApi: () => {
        return Api.get("/auth/me");
      },
      verifyCompanyClaimTokenApi: (token) => {
        return Api.get(`/auth/claim/verify?token=${encodeURIComponent(token)}`);
      },
      completeOnboardingApi: (values) => {
        return Api.post("/auth/claim/onboard", values);
      },
    };
