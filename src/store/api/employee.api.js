import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      // Employee APIs
      listEmployeesApi: (values) => {
        return Api.get("/employees", values);
      },
      getEmployeeDetailsApi: (id) => {
        return Api.get(`/employees/${id}`);
      },
      createEmployeeApi: (values) => {
        return Api.post("/employees", values);
      },
      updateEmployeeApi: ({ id, values }) => {
        return Api.patch(`/employees/${id}`, values);
      },
      updateEmployeeStatusApi: ({ id, values }) => {
        return Api.post(`/employees/${id}/status`, values);
      },
      sendEmployeeInviteApi: ({ id, values }) => {
        return Api.post(`/employees/${id}/invite`, values);
      },
      resendEmployeeInviteApi: ({ id, values }) => {
        return Api.post(`/employees/${id}/invite/resend`, values);
      },
      employeeClaimAccountApi: (values) => {
        return Api.post(`/auth/claim`, values);
      },

      // ------------------------------------
      // Employee Role Assignment APIs
      // ------------------------------------

      getEmployeeAssignmentsApi: (id) => {
        return Api.get(`/employees/${id}/assignments`);
      },

      grantEmployeeRoleApi: ({ id, values }) => {
        return Api.post(`/employees/${id}/assignments`, values);
      },

      revokeEmployeeRoleApi: ({ id, assignmentId }) => {
        return Api.delete(`/employees/${id}/assignments/${assignmentId}`);
      },

      // ------------------------------------
      // Employee Operations APIs
      // ------------------------------------

      getEmployeeOperationsApi: (id) => {
        return Api.get(`/employees/${id}/operations`);
      },

      assignEmployeeOperationApi: ({ id, values }) => {
        return Api.post(`/employees/${id}/operations`, values);
      },
      updateEmployeeOperationStatusApi: ({ id, operationKey, values }) =>
        Api.patch(
          `/employees/${id}/operations/${encodeURIComponent(operationKey)}`,
          values,
        ),

      revokeEmployeeOperationApi: ({ id, operationKey }) => {
        return Api.delete(
          `/employees/${id}/operations/${encodeURIComponent(operationKey)}`,
        );
      },
    };
