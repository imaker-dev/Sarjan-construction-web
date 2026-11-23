
import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      getProfileApi: () => {
        return Api.get("/profile");
      },
      uploadDocumentApi: (values) => {
        return Api.post(`/me/documents/upload`,values)
      },
      downloadDocumentApi: (fileId) => {
        return Api.get(`/me/documents/${fileId}/download`, {
          responseType: "blob",
        });
      },
    };
