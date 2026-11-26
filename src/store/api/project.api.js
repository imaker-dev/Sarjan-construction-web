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

      getProjectTeamApi: (id, params = {}) => {
        return Api.get(`/org/projects/${id}/team`, { params });
      },

      workforceActionProjectApi: ({ id, employeeId, action, values = {} }) => {
        return Api.post(`/org/projects/${id}/workforce/${employeeId}/${action}`, values);
      },

      getProjectDocumentsApi: (id, params = {}) => {
        return Api.get(`/org/projects/${id}/documents`, { params });
      },

      linkProjectDocumentApi: ({ id, values }) => {
        return Api.post(`/org/projects/${id}/documents`, values);
      },

      getProjectActivityApi: (id, params = {}) => {
        return Api.get(`/org/projects/${id}/activity`, { params });
      },
    };
