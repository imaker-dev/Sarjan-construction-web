
import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      createHeadOfficeApi: (values) => {
        return Api.post("/org/head-offices", values);
      },

      getAllHeadOfficesApi: (values = {}) => {
        return Api.get("/org/head-offices", values);
      },

      updateHeadOfficeApi: ({ id, values }) => {
        return Api.patch(`/org/head-offices/${id}`, values);
      },

      updateHeadOfficeStatusApi: ({ id, values }) => {
        return Api.post(`/org/head-offices/${id}/status`, values);
      },
    };
