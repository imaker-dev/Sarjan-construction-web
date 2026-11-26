import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";
import scheduleApi from "@store/api/schedule.api";
import { extractList } from "@utils/api.utils";
import { extractApiError } from "@utils/error.handlers";
import { toast } from "sonner";

export const listSchedules = createAsyncThunk(
  "schedule/listSchedules",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await scheduleApi.listSchedulesApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getScheduleById = createAsyncThunk(
  "schedule/getScheduleById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await scheduleApi.getScheduleByIdApi(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createSchedule = createAsyncThunk(
  "schedule/createSchedule",
  async (values, { rejectWithValue }) => {
    try {
      const res = await scheduleApi.createScheduleApi(values);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateSchedule = createAsyncThunk(
  "schedule/updateSchedule",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const res = await scheduleApi.updateScheduleApi({ id, values });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const archiveSchedule = createAsyncThunk(
  "schedule/archiveSchedule",
  async ({ id, expectedVersion }, { rejectWithValue }) => {
    try {
      const res = await scheduleApi.archiveScheduleApi({ id, expectedVersion });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getEffectiveSchedule = createAsyncThunk(
  "schedule/getEffectiveSchedule",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await scheduleApi.getEffectiveScheduleApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const listScheduleRevisions = createAsyncThunk(
  "schedule/listScheduleRevisions",
  async (id, { rejectWithValue }) => {
    try {
      const res = await scheduleApi.listRevisionsApi(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const addScheduleRevision = createAsyncThunk(
  "schedule/addScheduleRevision",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const res = await scheduleApi.addRevisionApi({ id, values });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const cancelScheduleRevision = createAsyncThunk(
  "schedule/cancelScheduleRevision",
  async ({ id, revisionId, values = {} }, { rejectWithValue }) => {
    try {
      const res = await scheduleApi.cancelRevisionApi({ id, revisionId, values });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const listScheduleOverrides = createAsyncThunk(
  "schedule/listScheduleOverrides",
  async (id, { rejectWithValue }) => {
    try {
      const res = await scheduleApi.listOverridesApi(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const addScheduleOverride = createAsyncThunk(
  "schedule/addScheduleOverride",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const res = await scheduleApi.addOverrideApi({ id, values });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const cancelScheduleOverride = createAsyncThunk(
  "schedule/cancelScheduleOverride",
  async ({ id, overrideId, values = {} }, { rejectWithValue }) => {
    try {
      const res = await scheduleApi.cancelOverrideApi({ id, overrideId, values });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const classifyScheduleDate = createAsyncThunk(
  "schedule/classifyScheduleDate",
  async ({ id, date }, { rejectWithValue }) => {
    try {
      const res = await scheduleApi.classifyDateApi({ id, date });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const scheduleSlice = createSlice({
  name: "schedule",
  initialState: {
    schedules: [],
    isLoadingSchedules: false,
    currentSchedule: null,
    isLoadingSchedule: false,
    revisions: [],
    overrides: [],
    effectivePreview: null,
    classificationResult: null,
    isMutatingSchedule: false,
  },
  reducers: {
    clearEffectivePreview: (state) => {
      state.effectivePreview = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listSchedules.pending, (state) => {
        state.isLoadingSchedules = true;
      })
      .addCase(listSchedules.fulfilled, (state, action) => {
        state.isLoadingSchedules = false;
        state.schedules = extractList(action.payload);
      })
      .addCase(listSchedules.rejected, (state, action) => {
        state.isLoadingSchedules = false;
        toast.error(extractApiError(action.payload, "Failed to load work schedules"));
      })

      .addCase(getScheduleById.pending, (state) => {
        state.isLoadingSchedule = true;
      })
      .addCase(getScheduleById.fulfilled, (state, action) => {
        state.isLoadingSchedule = false;
        state.currentSchedule = action.payload?.data || action.payload;
      })
      .addCase(getScheduleById.rejected, (state, action) => {
        state.isLoadingSchedule = false;
        toast.error(extractApiError(action.payload, "Failed to load schedule details"));
      })

      .addCase(listScheduleRevisions.fulfilled, (state, action) => {
        state.revisions = extractList(action.payload);
      })
      .addCase(listScheduleOverrides.fulfilled, (state, action) => {
        state.overrides = extractList(action.payload);
      })
      .addCase(getEffectiveSchedule.fulfilled, (state, action) => {
        state.effectivePreview = action.payload?.data || action.payload;
      })
      .addCase(getEffectiveSchedule.rejected, (state, action) => {
        toast.error(extractApiError(action.payload, "Failed to preview effective schedule"));
      })
      .addCase(classifyScheduleDate.fulfilled, (state, action) => {
        state.classificationResult = action.payload?.data || action.payload;
      })

      .addMatcher(
        isAnyOf(
          createSchedule.pending,
          updateSchedule.pending,
          archiveSchedule.pending,
          addScheduleRevision.pending,
          cancelScheduleRevision.pending,
          addScheduleOverride.pending,
          cancelScheduleOverride.pending
        ),
        (state) => {
          state.isMutatingSchedule = true;
        }
      )
      .addMatcher(
        isAnyOf(
          createSchedule.fulfilled,
          updateSchedule.fulfilled,
          archiveSchedule.fulfilled,
          addScheduleRevision.fulfilled,
          cancelScheduleRevision.fulfilled,
          addScheduleOverride.fulfilled,
          cancelScheduleOverride.fulfilled
        ),
        (state) => {
          state.isMutatingSchedule = false;
          toast.success("Work schedule updated successfully.");
        }
      )
      .addMatcher(
        isAnyOf(
          createSchedule.rejected,
          updateSchedule.rejected,
          archiveSchedule.rejected,
          addScheduleRevision.rejected,
          cancelScheduleRevision.rejected,
          addScheduleOverride.rejected,
          cancelScheduleOverride.rejected
        ),
        (state, action) => {
          state.isMutatingSchedule = false;
          toast.error(extractApiError(action.payload, "Schedule update failed"));
        }
      );
  },
});

export const { clearEffectivePreview } = scheduleSlice.actions;
export default scheduleSlice.reducer;
