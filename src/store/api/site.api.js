import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      listSitesApi: (values = {}) => {
        return Api.get("/org/sites", { params: values?.params ?? values });
      },

      // Get site details
      getSiteDetailsApi: (id) => {
        return Api.get(`/org/sites/${id}`);
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

      getSiteTeamApi: (id, params = {}) => {
        return Api.get(`/org/sites/${id}/team`, { params });
      },

      workforceActionSiteApi: ({ id, employeeId, action, values = {} }) => {
        return Api.post(`/org/sites/${id}/workforce/${employeeId}/${action}`, values);
      },

      getSiteDocumentsApi: (id, params = {}) => {
        return Api.get(`/org/sites/${id}/documents`, { params });
      },

      linkSiteDocumentApi: ({ id, values }) => {
        return Api.post(`/org/sites/${id}/documents`, values);
      },

      getSiteActivityApi: (id, params = {}) => {
        return Api.get(`/org/sites/${id}/activity`, { params });
      },
    };
