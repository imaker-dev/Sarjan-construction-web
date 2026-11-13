import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      listDepartmentsApi: (values) => {
        return Api.get("/departments", values);
      },
      createDepartmentApi: (values) => {
        return Api.post("/departments", values);
      },
      updateDepartmentApi: ({ id, values }) => {
        return Api.patch(`/departments/${id}`, values);
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
      deleteDepartmentOperationApi: (departmentId, operationId) => {
        return Api.delete(
          `/departments/${departmentId}/operations/${operationId}`,
        );
      }
    };
