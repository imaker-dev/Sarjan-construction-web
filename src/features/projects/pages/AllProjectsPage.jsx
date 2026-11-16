
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Eye,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import DataTable from "@components/ui/DataTable";

import { listProjects } from "@store/slices/project.slice";
import { ROUTES } from "@constants/routes";
import { formatText } from "@utils/text.utils";
import { formatDate } from "@utils/date.utils";

const STATUS_STYLES = {
  PLANNED:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  ACTIVE:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  COMPLETED:
    "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  CANCELLED:
    "bg-rose-50 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400",
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

  const { isListingProjects, projectsData } = useSelector(
    (state) => state.project,
  );

  useEffect(() => {
    dispatch(listProjects());
  }, [dispatch]);

  const rows = useMemo(() => {
    if (Array.isArray(projectsData)) return projectsData;
    if (Array.isArray(projectsData?.data)) return projectsData.data;
    return [];
  }, [projectsData]);

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
          p.clientName ? (
            <span>{p.clientName}</span>
          ) : (
            <Muted>—</Muted>
          ),
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
      ...(onView
        ? [{ label: "View", icon: Eye, onClick: onView }]
        : []),
      ...(onEdit
        ? [{ label: "Edit", icon: Pencil, onClick: onEdit }]
        : []),
      ...(onDelete
        ? [{ label: "Delete", icon: Trash2, onClick: onDelete, danger: true }]
        : []),
    ],
    [onView, onEdit, onDelete],
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
    </div>
  );
};

export default AllProjectsPage;
