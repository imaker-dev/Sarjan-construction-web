import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import projectApi from "@store/api/project.api";
import { extractList } from "@utils/api.utils";
import { extractApiError } from "@utils/error.handlers";
import { toast } from "sonner";

export const fetchProjectTeam = createAsyncThunk(
  "project/fetchProjectTeam",
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const res = await projectApi.getProjectTeamApi(projectId, params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const executeProjectWorkforceAction = createAsyncThunk(
  "project/executeProjectWorkforceAction",
  async ({ projectId, employeeId, action, values = {} }, { rejectWithValue }) => {
    try {
      const res = await projectApi.workforceActionProjectApi({ id: projectId, employeeId, action, values });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchProjectDocuments = createAsyncThunk(
  "project/fetchProjectDocuments",
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const res = await projectApi.getProjectDocumentsApi(projectId, params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const linkProjectDocument = createAsyncThunk(
  "project/linkProjectDocument",
  async ({ projectId, values }, { rejectWithValue }) => {
    try {
      const res = await projectApi.linkProjectDocumentApi({ id: projectId, values });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

export const fetchProjectActivity = createAsyncThunk(
  "project/fetchProjectActivity",
  async ({ projectId, params = {} }, { rejectWithValue }) => {
    try {
      const res = await projectApi.getProjectActivityApi(projectId, params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  },
);

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
    projectTeam: [],
    isLoadingProjectTeam: false,
    projectDocuments: [],
    isLoadingProjectDocs: false,
    projectActivity: [],
    isLoadingProjectActivity: false,
    isMutatingProjectScope: false,
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
      })

      .addCase(fetchProjectTeam.pending, (state) => {
        state.isLoadingProjectTeam = true;
      })
      .addCase(fetchProjectTeam.fulfilled, (state, action) => {
        state.isLoadingProjectTeam = false;
        state.projectTeam = extractList(action.payload, "team");
      })
      .addCase(fetchProjectTeam.rejected, (state, action) => {
        state.isLoadingProjectTeam = false;
        toast.error(extractApiError(action.payload, "Failed to load project team"));
      })

      .addCase(fetchProjectDocuments.pending, (state) => {
        state.isLoadingProjectDocs = true;
      })
      .addCase(fetchProjectDocuments.fulfilled, (state, action) => {
        state.isLoadingProjectDocs = false;
        state.projectDocuments = extractList(action.payload, "documents");
      })
      .addCase(fetchProjectDocuments.rejected, (state, action) => {
        state.isLoadingProjectDocs = false;
        toast.error(extractApiError(action.payload, "Failed to load project documents"));
      })

      .addCase(fetchProjectActivity.pending, (state) => {
        state.isLoadingProjectActivity = true;
      })
      .addCase(fetchProjectActivity.fulfilled, (state, action) => {
        state.isLoadingProjectActivity = false;
        state.projectActivity = extractList(action.payload, "logs");
      })
      .addCase(fetchProjectActivity.rejected, (state, action) => {
        state.isLoadingProjectActivity = false;
        toast.error(extractApiError(action.payload, "Failed to load project activity"));
      })

      .addMatcher(
        isAnyOf(executeProjectWorkforceAction.pending, linkProjectDocument.pending),
        (state) => {
          state.isMutatingProjectScope = true;
        },
      )
      .addMatcher(
        isAnyOf(executeProjectWorkforceAction.fulfilled, linkProjectDocument.fulfilled),
        (state) => {
          state.isMutatingProjectScope = false;
          toast.success("Action completed successfully.");
        },
      )
      .addMatcher(
        isAnyOf(executeProjectWorkforceAction.rejected, linkProjectDocument.rejected),
        (state, action) => {
          state.isMutatingProjectScope = false;
          toast.error(extractApiError(action.payload, "Operation failed"));
        },
      );
  },
});

export default projectSlice.reducer;
