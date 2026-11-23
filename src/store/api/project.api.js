import Api from "../api-client";

export default false
  ? {
      message: "You are Offline. Please turn on the internet",
    }
  : {
      // List projects
      listProjectsApi: (values) => {
        return Api.get("/org/projects", values);
      },

      // Get project details
      getProjectDetailsApi: (id) => {
        return Api.get(`/org/projects/${id}`);
      },

      // Create project
      createProjectApi: (values) => {
        return Api.post("/org/projects", values);
      },

      // Update project
      updateProjectApi: ({ id, values }) => {
        return Api.patch(`/org/projects/${id}`, values);
      },

      // Update project status
      updateProjectStatusApi: ({ id, values }) => {
        return Api.post(`/org/projects/${id}/status`, values);
      },
    };
