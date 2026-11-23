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
import { formatText } from "@utils/text.utils";
import { formatDate } from "@utils/date.utils";
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

const AllProjectsPage = ({ onView, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [statusConfirmation, setStatusConfirmation] = useState(null);

  const { isListingProjects, projectsData, isUpdatingProjectStatus } =
    useSelector((state) => state.project);

  const fetchProjects = () => {
    dispatch(listProjects());
  };
  useEffect(() => {
    fetchProjects();
  }, [dispatch]);

  const rows = useMemo(() => {
    if (Array.isArray(projectsData)) return projectsData;
    if (Array.isArray(projectsData?.data)) return projectsData.data;
    return [];
  }, [projectsData]);

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
      ...(onEdit ? [{ label: "Edit", icon: Pencil, onClick: onEdit }] : []),
      ...(onDelete
        ? [{ label: "Delete", icon: Trash2, onClick: onDelete, danger: true }]
        : []),
      {
        label: "View",
        icon: Eye,
        onClick: (p) =>
          navigate(ROUTES.PROJECTS.DETAILS + "?projectId=" + p.id),
      },
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
        hidden: (project) => project.status !== "PLANNED",
      },
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
        hidden: (project) => project.status !== "ACTIVE",
      },
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
        hidden: (project) => project.status !== "ON_HOLD",
      },
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
        hidden: (project) => !["ACTIVE", "ON_HOLD"].includes(project.status),
      },
    ],
    [onView, onEdit, onDelete, handleOpenStatusConfirmation],
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
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {/* Project Details */}
          <div className="flex items-center gap-3.5 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <BriefcaseBusiness size={20} strokeWidth={1.7} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {statusConfirmation?.project?.name || "Untitled Project"}
              </p>

              <p className="mt-1 text-xs font-medium tracking-wide text-slate-400 dark:text-slate-500">
                {statusConfirmation?.project?.code || "—"}
              </p>
            </div>
          </div>

          {/* Status Transition */}
          <div className="mx-4 mb-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700/70 dark:bg-slate-800/50">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              {/* Current Status */}
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                    Current Status
                  </p>
                </div>

                <StatusBadge status={statusConfirmation?.project?.status} />
              </div>

              {/* Transition Arrow */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <ArrowRight size={16} strokeWidth={2} />
              </div>

              {/* New Status */}
              <div className="min-w-0 text-right">
                <div className="mb-2 flex items-center justify-end gap-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                    New Status
                  </p>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>

                <StatusBadge status={statusConfirmation?.status} />
              </div>
            </div>
          </div>
        </div>
      </ModalAction>
    </div>
  );
};

export default AllProjectsPage;
