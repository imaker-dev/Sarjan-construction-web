import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import projectApi from "@store/api/project.api";
import { toast } from "sonner";

// List projects
export const listProjects = createAsyncThunk(
  "project/listProjects",
  async (values = {}) => {
    const res = await projectApi.listProjectsApi(values);
    return res.data;
  },
);

// Get project details
export const getProjectDetails = createAsyncThunk(
  "project/getProjectDetails",
  async (id) => {
    const res = await projectApi.getProjectDetailsApi(id);
    return res.data;
  },
);

// Create project
export const createProject = createAsyncThunk(
  "project/createProject",
  async (values) => {
    const res = await projectApi.createProjectApi(values);
    return res.data;
  },
);

// Update project
export const updateProject = createAsyncThunk(
  "project/updateProject",
  async ({ id, values }) => {
    const res = await projectApi.updateProjectApi({ id, values });
    return res.data;
  },
);

// Update project status
export const updateProjectStatus = createAsyncThunk(
  "project/updateProjectStatus",
  async ({ id, values }) => {
    const res = await projectApi.updateProjectStatusApi({
      id,
      values,
    });
    return res.data;
  },
);

const projectSlice = createSlice({
  name: "project",

  initialState: {
    isListingProjects: false,
    isCreatingProject: false,
    isUpdatingProject: false,
    isUpdatingProjectStatus: false,
    isGettingProjectDetails: false,
    projectsData: null,
    projectData: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      // List projects
      .addCase(listProjects.pending, (state) => {
        state.isListingProjects = true;
      })
      .addCase(listProjects.fulfilled, (state, action) => {
        state.isListingProjects = false;
        state.projectsData = action.payload;
      })
      .addCase(listProjects.rejected, (state, action) => {
        state.isListingProjects = false;
        toast.error(action.error.message || "Failed to fetch projects");
      })

      // Get project details
      .addCase(getProjectDetails.pending, (state) => {
        state.isGettingProjectDetails = true;
      })
      .addCase(getProjectDetails.fulfilled, (state, action) => {
        state.isGettingProjectDetails = false;
        state.projectData = action.payload;
      })
      .addCase(getProjectDetails.rejected, (state, action) => {
        state.isGettingProjectDetails = false;
        toast.error(action.error.message || "Failed to fetch project details");
      })

      // Create project
      .addCase(createProject.pending, (state) => {
        state.isCreatingProject = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isCreatingProject = false;
        state.projectData = action.payload;

        toast.success(
          action.payload?.message || "Project created successfully!",
        );
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isCreatingProject = false;
        toast.error(action.error.message || "Failed to create project");
      })

      // Update project
      .addCase(updateProject.pending, (state) => {
        state.isUpdatingProject = true;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isUpdatingProject = false;
        state.projectData = action.payload;

        toast.success(
          action.payload?.message || "Project updated successfully!",
        );
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isUpdatingProject = false;
        toast.error(action.error.message || "Failed to update project");
      })

      // Update project status
      .addCase(updateProjectStatus.pending, (state) => {
        state.isUpdatingProjectStatus = true;
      })
      .addCase(updateProjectStatus.fulfilled, (state, action) => {
        state.isUpdatingProjectStatus = false;

        const updatedProject = action.payload;

        const updateProjectInList = (projects) =>
          projects?.map((project) =>
            project.id === updatedProject?.id
              ? { ...project, ...updatedProject }
              : project,
          );

        if (Array.isArray(state.projectsData)) {
          state.projectsData = updateProjectInList(state.projectsData);
        } else if (Array.isArray(state.projectsData?.data)) {
          state.projectsData.data = updateProjectInList(
            state.projectsData.data,
          );
        }

        state.projectData = updatedProject;

        toast.success(
          updatedProject?.message || "Project status updated successfully!",
        );
      })
      .addCase(updateProjectStatus.rejected, (state, action) => {
        state.isUpdatingProjectStatus = false;
        toast.error(action.error.message || "Failed to update project status");
      });
  },
});

export default projectSlice.reducer;
