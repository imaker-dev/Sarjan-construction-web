import Api from "../api-client";

const scheduleApi = {
  listSchedulesApi: (params = {}) => Api.get("/schedules", { params }),
  getScheduleByIdApi: (id) => Api.get(`/schedules/${id}`),
  createScheduleApi: (values) => Api.post("/schedules", values),
  updateScheduleApi: ({ id, values }) => Api.patch(`/schedules/${id}`, values),
  archiveScheduleApi: ({ id, expectedVersion }) =>
    Api.post(`/schedules/${id}/archive`, { expectedVersion }),

  getEffectiveScheduleApi: (params = {}) =>
    Api.get("/schedules/effective", { params }),

  listRevisionsApi: (id) => Api.get(`/schedules/${id}/revisions`),
  addRevisionApi: ({ id, values }) => Api.post(`/schedules/${id}/revisions`, values),
  cancelRevisionApi: ({ id, revisionId, values }) =>
    Api.post(`/schedules/${id}/revisions/${revisionId}/cancel`, values),

  listOverridesApi: (id) => Api.get(`/schedules/${id}/overrides`),
  addOverrideApi: ({ id, values }) => Api.post(`/schedules/${id}/overrides`, values),
  cancelOverrideApi: ({ id, overrideId, values }) =>
    Api.post(`/schedules/${id}/overrides/${overrideId}/cancel`, values),

  classifyDateApi: ({ id, date }) => Api.get(`/schedules/${id}/classify/${date}`),
};

export default scheduleApi;
