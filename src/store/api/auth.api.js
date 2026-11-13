import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      logInApi: (values) => {
        return Api.post("/auth/login", values);
      },
      meApi: () => {
        return Api.get("/auth/me");
      },
    };
