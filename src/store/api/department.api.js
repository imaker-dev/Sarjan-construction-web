import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      listDepartmentsApi: (values = {}) => {
        return Api.get("/departments", { params: values?.params ?? values });
      },
      getDepartmentByIdApi: (id) => {
        return Api.get(`/departments/${id}`);
      },
      createDepartmentApi: (values) => {
        return Api.post("/departments", values);
      },
      updateDepartmentApi: ({ id, values }) => {
        return Api.patch(`/departments/${id}`, values);
      },
      updateDepartmentStatusApi: ({ id, values }) => {
        return Api.post(`/departments/${id}/status`, values);
      },
      getDepartmentOperationsApi: (departmentId) => {
        return Api.get(`/departments/${departmentId}/operations`);
      },

      createDepartmentOperationApi: (departmentId, values) => {
        return Api.post(`/departments/${departmentId}/operations`, values);
      },
      updateDepartmentOperationApi: (departmentId, operationId, values) => {
        return Api.patch(
          `/departments/${departmentId}/operations/${operationId}`,
          values,
        );
      },
      deleteDepartmentOperationApi: (departmentId, operationKey) => {
        return Api.delete(
          `/departments/${departmentId}/operations/${operationKey}`,
        );
      },

      onboardDepartmentEmployeeApi: ({ departmentId, values }) => {
        return Api.post(`/departments/${departmentId}/onboard`, values);
      },

      getDepartmentMembersApi: (departmentId, params = {}) => {
        return Api.get(`/departments/${departmentId}/members`, { params });
      },

      addDepartmentMemberApi: ({ departmentId, values }) => {
        return Api.post(`/departments/${departmentId}/members`, values);
      },

      updateDepartmentMemberApi: ({ departmentId, membershipId, values }) => {
        return Api.patch(`/departments/${departmentId}/members/${membershipId}`, values);
      },

      transferDepartmentMemberApi: ({ departmentId, membershipId, values }) => {
        return Api.post(`/departments/${departmentId}/members/${membershipId}/transfer`, values);
      },

      endDepartmentMemberApi: ({ departmentId, membershipId, values = {} }) => {
        return Api.post(`/departments/${departmentId}/members/${membershipId}/end`, values);
      },
    };
