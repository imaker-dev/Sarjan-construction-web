import Api from "../api-client";

const leaveApi = {
  // Leave Type Definitions
  listLeaveTypesApi: (params = {}) =>
    Api.get("/leave/types", { params }),

  createLeaveTypeApi: (values) =>
    Api.post("/leave/types", values),

  updateLeaveTypeApi: ({ id, values }) =>
    Api.patch(`/leave/types/${id}`, values),

  archiveLeaveTypeApi: (id) =>
    Api.post(`/leave/types/${id}/archive`),

  // Leave Policies & Immutable Versions
  listLeavePoliciesApi: (params = {}) =>
    Api.get("/leave/policies", { params }),

  getLeavePolicyApi: (id) =>
    Api.get(`/leave/policies/${id}`),

  createLeavePolicyApi: (values) =>
    Api.post("/leave/policies", values),

  updateLeavePolicyApi: ({ id, values }) =>
    Api.patch(`/leave/policies/${id}`, values),

  archiveLeavePolicyApi: ({ id, values = {} }) =>
    Api.post(`/leave/policies/${id}/archive`, values),

  listLeavePolicyVersionsApi: (id) =>
    Api.get(`/leave/policies/${id}/versions`),

  addLeavePolicyVersionApi: ({ id, values }) =>
    Api.post(`/leave/policies/${id}/versions`, values),

  cancelLeavePolicyVersionApi: ({ id, versionId, values = {} }) =>
    Api.post(`/leave/policies/${id}/versions/${versionId}/cancel`, values),

  getEffectiveLeavePolicyApi: (params = {}) =>
    Api.get("/leave/policies/effective", { params }),

  // Balances & Allocations
  listLeaveBalancesApi: (params = {}) =>
    Api.get("/leave/balances", { params }),

  getLeaveBalanceApi: (employeeId, params = {}) =>
    Api.get(`/leave/balances/${employeeId}`, { params }),

  allocateLeaveApi: (values) =>
    Api.post("/leave/allocations", values),

  // Leave Requests
  listLeaveRequestsApi: (params = {}) =>
    Api.get("/leave/requests", { params }),

  getLeaveRequestByIdApi: (id) =>
    Api.get(`/leave/requests/${id}`),

  applyLeaveApi: (values) =>
    Api.post("/leave/requests", values),

  resubmitLeaveRequestApi: ({ id, values }) =>
    Api.post(`/leave/requests/${id}/resubmit`, values),

  cancelLeaveRequestApi: ({ id, values = {} }) =>
    Api.post(`/leave/requests/${id}/cancel`, values),

  reviewLeaveRequestApi: ({ id, values }) =>
    Api.post(`/leave/requests/${id}/review`, values),
};

export default leaveApi;
