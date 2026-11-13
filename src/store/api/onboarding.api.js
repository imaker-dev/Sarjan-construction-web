import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      generateOnboardingLinkApi: (values) => {
        return Api.post("/platform/companies", values);
      },
      verifyOnboardingTokenApi: (token) => {
        return Api.get(`/auth/claim/verify?token=${token}`);
      },
      completeOnboardingApi: (values) => {
        return Api.post("/auth/claim/onboard", values);
      },
    };
