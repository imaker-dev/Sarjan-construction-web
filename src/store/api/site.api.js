import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      listSitesApi: (values) => {
        return Api.get("/org/sites", values);
      },

      createSiteApi: (values) => {
        return Api.post("/org/sites", values);
      },

      updateSiteApi: ({ id, values }) => {
        return Api.patch(`/org/sites/${id}`, values);
      },

      updateSiteStatusApi: ({ id, values }) => {
        return Api.post(`/org/sites/${id}/status`, values);
      },
    };
