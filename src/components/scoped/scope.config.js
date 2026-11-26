import {
  fetchSiteTeam,
  executeSiteWorkforceAction,
  fetchSiteDocuments,
  linkSiteDocument,
  fetchSiteActivity,
} from "@store/slices/site.slice";
import {
  fetchProjectTeam,
  executeProjectWorkforceAction,
  fetchProjectDocuments,
  linkProjectDocument,
  fetchProjectActivity,
} from "@store/slices/project.slice";

export const SCOPE_HANDLERS = {
  SITE: {
    sliceKey: "site",
    idKey: "siteId",
    teamKey: "siteTeam",
    teamLoadingKey: "isLoadingSiteTeam",
    docsKey: "siteDocuments",
    docsLoadingKey: "isLoadingSiteDocs",
    activityKey: "siteActivity",
    activityLoadingKey: "isLoadingSiteActivity",
    mutatingKey: "isMutatingSiteScope",
    fetchTeam: fetchSiteTeam,
    workforceAction: executeSiteWorkforceAction,
    fetchDocs: fetchSiteDocuments,
    linkDoc: linkSiteDocument,
    fetchActivity: fetchSiteActivity,
  },
  PROJECT: {
    sliceKey: "project",
    idKey: "projectId",
    teamKey: "projectTeam",
    teamLoadingKey: "isLoadingProjectTeam",
    docsKey: "projectDocuments",
    docsLoadingKey: "isLoadingProjectDocs",
    activityKey: "projectActivity",
    activityLoadingKey: "isLoadingProjectActivity",
    mutatingKey: "isMutatingProjectScope",
    fetchTeam: fetchProjectTeam,
    workforceAction: executeProjectWorkforceAction,
    fetchDocs: fetchProjectDocuments,
    linkDoc: linkProjectDocument,
    fetchActivity: fetchProjectActivity,
  },
};

export const getScopeHandler = (scopeType) =>
  SCOPE_HANDLERS[scopeType] || SCOPE_HANDLERS.PROJECT;
