import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
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

      sendEmployeeInviteApi: ({ id, values }) => {
        return Api.post(`/employees/${id}/invite`, values);
      },
      resendEmployeeInviteApi: ({ id, values }) => {
        return Api.post(`/employees/${id}/invite/resend`, values);
      },
      employeeClaimAccountApi: (values) => {
        return Api.post(`/auth/claim`, values);
      },
    };
