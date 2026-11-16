import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import DataTable from "@components/ui/DataTable";

import { listSites } from "@store/slices/site.slice";
import { ROUTES } from "@constants/routes";

import { IconMapPin } from "@tabler/icons-react";
import { formatDate } from "@utils/date.utils";
import { formatText } from "@utils/text.utils";
import { Plus } from "lucide-react";

const AllSitesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isListingSites, sitesData } = useSelector((state) => state.site);

  const { projectsData } = useSelector((state) => state.project);

  useEffect(() => {
    dispatch(listSites());
  }, [dispatch]);

  const sites = useMemo(() => {
    if (Array.isArray(sitesData)) return sitesData;
    if (Array.isArray(sitesData?.data)) return sitesData.data;
    return [];
  }, [sitesData]);

  const projects = useMemo(() => {
    if (Array.isArray(projectsData)) return projectsData;
    if (Array.isArray(projectsData?.data)) return projectsData.data;
    return [];
  }, [projectsData]);

  const getProject = (projectId) =>
    projects.find((project) => project.id === projectId);

  const columns = [
    {
      key: "name",
      header: "Site",
      render: (row) => (
        <div className="min-w-[190px]">
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            {row.name || "Untitled Site"}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {row.code || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "projectId",
      header: "Project",
      render: (row) => {
        const project = getProject(row.projectId);

        return (
          <div className="min-w-[170px]">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {project?.name || "—"}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {project?.code || "—"}
            </p>
          </div>
        );
      },
    },
    {
      key: "location",
      header: "Location",
      render: (row) => (
        <div className="min-w-[150px]">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {[row.city, row.state].filter(Boolean).join(", ") || "—"}
          </p>
          {row.pinCode && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {row.pinCode}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "coordinates",
      header: "Coordinates",
      render: (row) => (
        <div className="min-w-[130px]">
          <p className="text-sm text-slate-700 dark:text-slate-200">
            {row.geoLatitude ?? "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {row.geoLongitude ?? "—"}
          </p>
        </div>
      ),
    },
    {
      key: "geoFenceRadiusM",
      header: "Geofence",
      render: (row) => (
        <span className="text-sm text-slate-700 dark:text-slate-200">
          {row.geoFenceRadiusM != null ? `${row.geoFenceRadiusM} m` : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const isActive = row.status === "ACTIVE";

        return (
          <span
            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
              isActive
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            }`}
          >
            {formatText(row.status || "Unknown")}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Created On",
      render: (row) => (
        <span className="whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
          {row.createdAt ? formatDate(row.createdAt) : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeaderBanner
        title="All Sites"
        description="Manage and monitor all sites across your projects."
        action={{
          label: "Add Site",
          onClick: () => navigate(ROUTES.SITES.CREATE),
        }}
      />

      <DataTable
        title="Sites"
        headerActions={[
          {
            label: "Add Site",
            icon: Plus,
            variant: "primary",
            onClick: () => navigate(ROUTES.SITES.CREATE),
          },
        ]}
        columns={columns}
        data={sites}
        loading={isListingSites}
        empty={{
          icon: IconMapPin,
          title: "No sites yet",
          description: "sites you create will show up here.",
        }}
      />
    </div>
  );
};

export default AllSitesPage;
