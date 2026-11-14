import Api from "../api-client";

const platformApi = {
  // 1.1 List all customer companies
  listCompaniesApi: () => {
    return Api.get("/platform/companies");
  },

  // 1.2 Get single company details
  getCompanyDetailsApi: (companyId) => {
    return Api.get(`/platform/companies/${companyId}`);
  },

  // 1.3 Create customer company + first admin
  createCompanyApi: (values) => {
    return Api.post("/platform/companies", values);
  },

  // 1.4 Update customer company profile
  updateCompanyApi: ({ companyId, values }) => {
    return Api.patch(`/platform/companies/${companyId}`, values);
  },

  // 1.5 Suspend / Reactivate / Archive company status
  updateCompanyStatusApi: ({ companyId, to, expectedVersion }) => {
    return Api.post(`/platform/companies/${companyId}/status`, {
      to,
      expectedVersion,
    });
  },

  // 1.6 Reissue admin claim token
  reissueAdminClaimTokenApi: ({ companyId, adminPrincipalId }) => {
    return Api.post(`/platform/companies/${companyId}/claim-token`, {
      adminPrincipalId,
    });
  },

  // 2.1 View global operations catalogue
  getGlobalOperationsApi: () => {
    return Api.get("/platform/operations");
  },

  // 2.2 Add operation to global catalogue
  createGlobalOperationApi: (values) => {
    return Api.post("/platform/operations", values);
  },

  // 2.3 Delete operation from catalogue
  deleteGlobalOperationApi: (key) => {
    return Api.delete(`/platform/operations/${key}`);
  },
};

export default platformApi;

