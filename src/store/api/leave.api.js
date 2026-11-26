import Api from "../api-client";

const leaveApi = {
  getLeaveBalanceApi: (employeeId, params = {}) =>
    Api.get(`/leave/balances/${employeeId}`, { params }),

  allocateLeaveApi: (values) =>
    Api.post("/leave/allocations", values),

  listLeaveRequestsApi: (params = {}) =>
    Api.get("/leave/requests", { params }),

  getLeaveRequestByIdApi: (id) =>
    Api.get(`/leave/requests/${id}`),

  applyLeaveApi: (values) =>
    Api.post("/leave/requests", values),

  cancelLeaveRequestApi: ({ id, values = {} }) =>
    Api.post(`/leave/requests/${id}/cancel`, values),

  reviewLeaveRequestApi: ({ id, values }) =>
    Api.post(`/leave/requests/${id}/review`, values),
};

export default leaveApi;
