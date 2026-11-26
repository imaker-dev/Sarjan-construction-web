import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import DataTable from "@components/ui/DataTable";

import { listProjects, updateProjectStatus } from "@store/slices/project.slice";
import { ROUTES } from "@constants/routes";
import { useAccess } from "@hooks/useAccess";
import { formatText } from "@utils/text.utils";
import { formatDate } from "@utils/date.utils";
import { extractList } from "@utils/api.utils";
import ModalAction from "@components/ui/ModalAction";
import { handleResponse } from "@utils/async.utils";

const STATUS_STYLES = {
  PLANNED:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  ON_HOLD:
    "bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
  ACTIVE:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  COMPLETED: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  CANCELLED: "bg-rose-50 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400",
  ARCHIVED:
    "bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400",
};

const DEFAULT_STATUS_STYLE =
  "bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400";

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex rounded px-2.5 py-1 text-[12px] font-medium ${
      STATUS_STYLES[status] || DEFAULT_STATUS_STYLE
    }`}
  >
    {formatText(status || "Unknown")}
  </span>
);

const Muted = ({ children }) => (
  <span className="text-slate-400 dark:text-slate-500">{children}</span>
);

const AllProjectsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAccess();
  const isCompanyAdmin = Boolean(user?.isCompanyScoped);
  const [statusConfirmation, setStatusConfirmation] = useState(null);

  const { isListingProjects, projectsData, isUpdatingProjectStatus } =
    useSelector((state) => state.project);

  const fetchProjects = () => {
    dispatch(listProjects());
  };
  useEffect(() => {
    fetchProjects();
  }, [dispatch]);

  const rows = useMemo(() => extractList(projectsData), [projectsData]);

  const handleOpenStatusConfirmation = useCallback(
    (project, status, title, description) => {
      setStatusConfirmation({
        project,
        status,
        title,
        description,
      });
    },
    [],
  );

  const handleCloseStatusConfirmation = () => {
    if (isUpdatingProjectStatus) return;
    setStatusConfirmation(null);
  };

  const handleUpdateProjectStatus = async () => {
    if (!statusConfirmation?.project?.id) return;
    await handleResponse(
      dispatch(
        updateProjectStatus({
          id: statusConfirmation.project.id,
          values: {
            to: statusConfirmation.status,
            expectedVersion: statusConfirmation.project.version ?? 0,
          },
        }),
      ),
      () => {
        fetchProjects();
        setStatusConfirmation(null);
      },
    );
  };

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Project",
        render: (p) => (
          <div className="min-w-[180px] leading-tight">
            <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">
              {p.name || "Untitled Project"}
            </div>
            <div className="mt-1 text-[12.5px] text-slate-400 dark:text-slate-500">
              {p.code || "—"}
            </div>
          </div>
        ),
      },
      {
        key: "projectType",
        header: "Project Type",
        render: (p) =>
          p.projectType ? formatText(p.projectType) : <Muted>—</Muted>,
      },
      {
        key: "clientName",
        header: "Client",
        render: (p) =>
          p.clientName ? <span>{p.clientName}</span> : <Muted>—</Muted>,
      },
      {
        key: "location",
        header: "Location",
        render: (p) => {
          const location = [p.locationCity, p.locationState]
            .filter(Boolean)
            .join(", ");

          return location ? (
            <div className="max-w-[180px] text-[13px]">
              {location}
              {p.locationPin && (
                <div className="mt-1 text-[12px] text-slate-400 dark:text-slate-500">
                  {p.locationPin}
                </div>
              )}
            </div>
          ) : (
            <Muted>—</Muted>
          );
        },
      },
      {
        key: "timeline",
        header: "Timeline",
        className: "whitespace-nowrap",
        render: (p) => (
          <div className="leading-tight">
            <div className="text-[13px] text-slate-700 dark:text-slate-300">
              {formatDate(p.startDate)}
            </div>
            <div className="mt-1 text-[12px] text-slate-400 dark:text-slate-500">
              To {formatDate(p.endDate)}
            </div>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        mobilePosition: "header",
        render: (p) => <StatusBadge status={p.status} />,
      },
      {
        key: "createdAt",
        header: "Created",
        className: "whitespace-nowrap text-slate-500 dark:text-slate-400",
        render: (p) => formatDate(p.createdAt),
      },
    ],
    [],
  );

  const actions = useMemo(
    () => [
      {
        label: "View",
        icon: Eye,
        onClick: (p) =>
          navigate(ROUTES.PROJECTS.DETAILS + "?projectId=" + p.id),
      },
      {
        label: "Edit",
        icon: Pencil,
        onClick: (p) => navigate(ROUTES.PROJECTS.EDIT + "?projectId=" + p.id),
        hidden: (p) => p.status === "ARCHIVED",
      },

      // PLANNED → ACTIVE
      {
        label: "Activate Project",
        icon: Play,
        onClick: (project) =>
          handleOpenStatusConfirmation(
            project,
            "ACTIVE",
            "Activate Project",
            "Are you sure you want to activate this project?",
          ),
        hidden: (p) => p.status !== "PLANNED",
      },

      // ACTIVE → ON_HOLD
      {
        label: "Put On Hold",
        icon: Pause,
        onClick: (project) =>
          handleOpenStatusConfirmation(
            project,
            "ON_HOLD",
            "Put Project On Hold",
            "Are you sure you want to put this project on hold?",
          ),
        hidden: (p) => p.status !== "ACTIVE",
      },

      // ON_HOLD → ACTIVE
      {
        label: "Resume Project",
        icon: RefreshCw,
        onClick: (project) =>
          handleOpenStatusConfirmation(
            project,
            "ACTIVE",
            "Resume Project",
            "Are you sure you want to resume this project?",
          ),
        hidden: (p) => p.status !== "ON_HOLD",
      },

      // ACTIVE / ON_HOLD → COMPLETED
      {
        label: "Complete Project",
        icon: CheckCircle2,
        onClick: (project) =>
          handleOpenStatusConfirmation(
            project,
            "COMPLETED",
            "Complete Project",
            "Are you sure you want to mark this project as completed?",
          ),
        hidden: (p) => !["ACTIVE", "ON_HOLD"].includes(p.status),
      },

      // PLANNED / ACTIVE / ON_HOLD / COMPLETED → ARCHIVED
      {
        label: "Archive Project",
        icon: Trash2,
        onClick: (project) =>
          handleOpenStatusConfirmation(
            project,
            "ARCHIVED",
            "Archive Project",
            "Are you sure you want to archive this project? This action will prevent further status changes.",
          ),
        hidden: (p) =>
          !["PLANNED", "ACTIVE", "ON_HOLD", "COMPLETED"].includes(p.status),
      },
    ],
    [navigate, handleOpenStatusConfirmation],
  );

  return (
    <div className="space-y-5">
      <PageHeaderBanner title="All Projects" />

      <DataTable
        title="Projects"
        columns={columns}
        data={rows}
        actions={actions}
        loading={isListingProjects}
        headerActions={[
          {
            label: "Add Project",
            icon: Plus,
            variant: "primary",
            onClick: () => navigate(ROUTES.PROJECTS.CREATE),
          },
        ]}
        empty={{
          icon: BriefcaseBusiness,
          title: "No projects yet",
          description: "Projects you create will show up here.",
        }}
      />

      <ModalAction
        id="project-status-confirmation"
        isOpen={!!statusConfirmation}
        onClose={handleCloseStatusConfirmation}
        onSubmit={handleUpdateProjectStatus}
        title={statusConfirmation?.title || "Update Project Status"}
        desc={statusConfirmation?.description}
        icon={CheckCircle2}
        theme="primary"
        submitText="Confirm"
        loadingText="Updating..."
        loading={isUpdatingProjectStatus}
        submitDisabled={!statusConfirmation?.project?.id}
        cancelText="Cancel"
      >
        {/* Project Status Confirmation Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] dark:border-white/[0.07] dark:bg-slate-900 dark:shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_12px_32px_-16px_rgba(0,0,0,0.6)]">
          {/* soft top glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary-500/[0.06] to-transparent dark:from-primary-400/[0.08]"
          />

          {/* Project */}
          <div className="relative flex items-center gap-3.5 px-5 pb-4 pt-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-[0_4px_12px_-4px] shadow-primary-600/50 ring-1 ring-inset ring-white/20">
              <BriefcaseBusiness size={20} strokeWidth={1.8} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                Project
              </p>
              <p className="mt-0.5 truncate text-[15px] font-semibold leading-tight text-slate-900 dark:text-white">
                {statusConfirmation?.project?.name || "Untitled Project"}
              </p>
            </div>

            <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] font-medium text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400">
              {statusConfirmation?.project?.code || "—"}
            </span>
          </div>

          {/* Divider */}
          <div className="mx-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-white/[0.08]" />

          {/* Transition */}
          <div className="relative px-5 py-5">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              {/* Current */}
              <div className="min-w-0">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                  Current
                </p>
                <div className="opacity-90">
                  <StatusBadge status={statusConfirmation?.project?.status} />
                </div>
              </div>

              {/* Connector */}
              <div className="flex items-center gap-1.5 pt-5 text-slate-300 dark:text-slate-600">
                <span className="h-px w-5 bg-current sm:w-8" />
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
                  <ArrowRight size={14} strokeWidth={2.2} />
                </span>
                <span className="h-px w-5 bg-current sm:w-8" />
              </div>

              {/* New */}
              <div className="min-w-0 text-right">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-600 dark:text-primary-300">
                  New
                </p>
                <div className="inline-flex ">
                  <StatusBadge status={statusConfirmation?.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This change takes effect immediately and can be updated later.
            </p>
          </div>
        </div>
      </ModalAction>
    </div>
  );
};

export default AllProjectsPage;
