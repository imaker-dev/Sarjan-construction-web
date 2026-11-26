import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  IconArrowLeft,
  IconMapPin,
  IconUsers,
  IconFileText,
  IconHistory,
  IconBuilding,
  IconPlus,
  IconShieldCheck,
  IconDeviceMobile,
  IconClock,
} from "@tabler/icons-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import StatCard from "@components/ui/StatCard";
import StatusBadge, { getStatusTone } from "@components/ui/StatusBadge";
import DataTable from "@components/ui/DataTable";
import { formatText } from "@utils/text.utils";
import ScopedTeamTable from "@components/scoped/ScopedTeamTable";
import ScopedDocumentsPanel from "@components/scoped/ScopedDocumentsPanel";
import ScopedActivityFeed from "@components/scoped/ScopedActivityFeed";
import SiteTvtPanel from "@features/sites/components/SiteTvtPanel";
import SiteKioskPanel from "@features/sites/components/SiteKioskPanel";
import SiteAttendanceMonitorPanel from "@features/sites/components/SiteAttendanceMonitorPanel";
import { useQueryParams } from "@hooks/useQueryParams";
import { useAccess } from "@hooks/useAccess";
import { getSiteDetails } from "@store/slices/site.slice";
import { extractList } from "@utils/api.utils";
import { listDepartments } from "@store/slices/department.slice";
import { PERMISSIONS } from "@constants/permissions";
import { ROUTES } from "@constants/routes";

export default function SiteDetailsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { get } = useQueryParams();
  const siteId = get("siteId");

  const { can, user } = useAccess();
  const isCompanyAdmin = Boolean(user?.isCompanyScoped);
  const { isGettingSiteDetails, siteData } = useSelector((state) => state.site);
  const { departmentsData, isListingDepartments } = useSelector((state) => state.department);

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (siteId) {
      dispatch(getSiteDetails(siteId));
      dispatch(listDepartments({ siteId }));
    }
  }, [dispatch, siteId]);

  const site = siteData?.data || siteData;

  const siteDepartments = useMemo(() => {
    return extractList(departmentsData).filter(
      (d) => d.siteId === siteId || d.scopeId === siteId
    );
  }, [departmentsData, siteId]);

  const canSuspend = can({ permissions: [PERMISSIONS.EMPLOYEE.MEMBER_MANAGE] });
  const canExit = can({ permissions: [PERMISSIONS.EMPLOYEE.MEMBER_MANAGE] });
  const canLinkDocs = can({ permissions: [PERMISSIONS.DOCUMENT.LINK] });
  const canCreateDept = can({ permissions: [PERMISSIONS.DEPARTMENT.CONFIGURE] });
  const canRecordAttendance = can({ permissions: [PERMISSIONS.ATTENDANCE.RECORD] });
  const canReadAttendance = can({ permissions: [PERMISSIONS.ATTENDANCE.READ] });
  const canUseKiosk =
    isCompanyAdmin || can({ permissions: [PERMISSIONS.ATTENDANCE.MANAGE] });

  if (isGettingSiteDetails && !site) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "Overview", icon: IconMapPin },
    { key: "departments", label: `Departments (${siteDepartments.length})`, icon: IconBuilding },
    { key: "team", label: "Workers", icon: IconUsers },
    ...(canReadAttendance ? [{ key: "attendance", label: "Attendance", icon: IconClock }] : []),
    { key: "tvt", label: "Safety Talks", icon: IconShieldCheck },
    ...(canUseKiosk ? [{ key: "kiosk", label: "Bulk Check-In", icon: IconDeviceMobile }] : []),
    { key: "documents", label: "Documents", icon: IconFileText },
    { key: "activity", label: "History", icon: IconHistory },
  ];

  return (
    <div className="space-y-6 pb-12">
      <button
        type="button"
        onClick={() => navigate(ROUTES.SITES.ROOT)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft size={16} />
        <span>Back to Sites</span>
      </button>

      <PageHeaderBanner
        title={site?.name || "Site Details"}
        description={`${site?.code || "—"} • ${site?.city || ""} ${site?.state || ""}`}
        extra={
          site?.status && (
            <StatusBadge
              label={site.status}
              tone={site.status === "ACTIVE" ? "emerald" : "slate"}
              size="md"
            />
          )
        }
      />

      <div
        className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/60"
        role="tablist"
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(t.key)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                active
                  ? "bg-white text-slate-800 shadow-sm dark:bg-[#1C2536] dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Icon size={15} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              color="blue"
              icon={IconBuilding}
              label="Departments"
              value={siteDepartments.length}
            />
            <StatCard
              color="cyan"
              icon={IconMapPin}
              label="Geofence radius"
              value={site?.geoRadiusMeters ? `${site.geoRadiusMeters} m` : "—"}
            />
            <StatCard
              color="amber"
              icon={IconShieldCheck}
              label="Site code"
              value={site?.code || "—"}
            />
            <StatCard
              color="emerald"
              icon={IconUsers}
              label="Site status"
              value={formatText(site?.status || "ACTIVE")}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <IconBuilding size={18} className="text-primary-600 dark:text-primary-400" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Site details
                </h2>
              </div>
              <dl className="divide-y divide-gray-100 px-5 dark:divide-gray-800">
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Site code</dt>
                  <dd className="text-right font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                    {site?.code || "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Project</dt>
                  <dd className="text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                    {site?.project?.name || site?.projectName || "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">City & state</dt>
                  <dd className="text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                    {[site?.city, site?.state].filter(Boolean).join(", ") || "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Status</dt>
                  <dd>
                    <StatusBadge
                      label={formatText(site?.status || "ACTIVE")}
                      tone={getStatusTone(site?.status || "ACTIVE")}
                      size="xs"
                    />
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <IconMapPin size={18} className="text-primary-600 dark:text-primary-400" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Location & geofence
                </h2>
              </div>
              <dl className="divide-y divide-gray-100 px-5 dark:divide-gray-800">
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-gray-500 dark:text-gray-400 shrink-0">Address</dt>
                  <dd className="text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                    {[site?.addressLine1, site?.city, site?.state, site?.pinCode].filter(Boolean).join(", ") || "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Coordinates</dt>
                  <dd className="text-right font-mono tabular-nums text-sm font-medium text-gray-900 dark:text-gray-100">
                    {site?.geoLatitude && site?.geoLongitude ? `${site.geoLatitude}, ${site.geoLongitude}` : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Radius</dt>
                  <dd className="text-right tabular-nums text-sm font-medium text-gray-900 dark:text-gray-100">
                    {site?.geoRadiusMeters ? `${site.geoRadiusMeters} m` : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Geofence</dt>
                  <dd>
                    <StatusBadge
                      label={site?.geoLatitude && site?.geoLongitude ? "Configured" : "Not set"}
                      tone={site?.geoLatitude && site?.geoLongitude ? "emerald" : "slate"}
                      size="xs"
                    />
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      )}

      {activeTab === "departments" && (
        <div className="space-y-4">
          {canCreateDept && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate(ROUTES.DEPARTMENTS.CREATE)}
                className="btn btn-primary btn-sm h-9 inline-flex items-center gap-1.5"
              >
                <IconPlus size={15} />
                <span>Create Department</span>
              </button>
            </div>
          )}
          <DataTable
            columns={[
              {
                key: "name",
                header: "Department",
                render: (d) => (
                  <div>
                    <span className="font-semibold text-xs block">{d.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{d.code}</span>
                  </div>
                ),
              },
              {
                key: "category",
                header: "Category",
                render: (d) => <StatusBadge label={d.category || "—"} tone="blue" size="xs" />,
              },
              {
                key: "status",
                header: "Status",
                render: (d) => (
                  <StatusBadge label={d.status} tone={d.status === "ACTIVE" ? "emerald" : "slate"} size="sm" />
                ),
              },
            ]}
            data={siteDepartments}
            actions={[
              {
                label: "Open Department",
                icon: IconBuilding,
                onClick: (d) => navigate(`${ROUTES.DEPARTMENTS.DETAILS}?departmentId=${d.id}`),
              },
            ]}
            loading={isListingDepartments}
            empty={{
              icon: IconBuilding,
              title: "No Site Departments",
              description: "No departments are scoped to this site yet.",
            }}
          />
        </div>
      )}

      {activeTab === "team" && (
        <ScopedTeamTable scopeType="SITE" scopeId={siteId} canSuspend={canSuspend} canExit={canExit} />
      )}

      {activeTab === "attendance" && canReadAttendance && (
        <SiteAttendanceMonitorPanel siteId={siteId} canManage={canUseKiosk} />
      )}

      {activeTab === "tvt" && <SiteTvtPanel siteId={siteId} canRecord={canRecordAttendance} />}

      {activeTab === "kiosk" && canUseKiosk && <SiteKioskPanel site={site} />}

      {activeTab === "documents" && (
        <ScopedDocumentsPanel scopeType="SITE" scopeId={siteId} canLink={canLinkDocs} />
      )}

      {activeTab === "activity" && <ScopedActivityFeed scopeType="SITE" scopeId={siteId} />}
    </div>
  );
}
