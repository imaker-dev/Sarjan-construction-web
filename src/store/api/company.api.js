import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      listCompaniesApi: (values = {}) => {
        return Api.get("/platform/companies", values);
      },

      createCompanyApi: (values) => {
        return Api.post("/platform/companies", values);
      },

      reissueCompanyClaimTokenApi: (companyId) => {
        return Api.post(`/platform/companies/${companyId}/claim-token`,{});
      },

      getCompanyDetailsApi: (companyId) => {
        return Api.get(`/platform/companies/${companyId}`);
      },

      updateCompanyApi: ({ companyId, values }) => {
        return Api.patch(`/platform/companies/${companyId}`, values);
      },

      updateCompanyStatusApi: ({ companyId, values }) => {
        return Api.post(`/platform/companies/${companyId}/status`, values);
      },

      getCompanyDelegationsApi: () => {
        return Api.get("/org/company/delegations");
      },

      updateCompanyDelegationsApi: (values) => {
        return Api.patch("/org/company/delegations", values);
      },
    };
