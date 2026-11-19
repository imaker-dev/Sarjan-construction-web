
import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      getProfileApi: () => {
        return Api.get("/profile");
      },
    };
