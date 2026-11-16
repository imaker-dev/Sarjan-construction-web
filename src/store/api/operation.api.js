import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      getAllOperationsApi: () => {
        return Api.get(`/platform/operations`);
      },
      createOperationApi: (values) => {
        return Api.post("/platform/operations", values);
      },
      deleteOperationApi: ({ id, key }) => {
        return Api.delete(`/departments/${id}/operations/${key}`);
      },
    };
