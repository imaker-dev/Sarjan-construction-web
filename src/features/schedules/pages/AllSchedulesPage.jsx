import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  IconCalendarTime,
  IconPlus,
  IconEye,
  IconArchive,
  IconSearch,
} from "@tabler/icons-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import DataTable from "@components/ui/DataTable";
import StatusBadge from "@components/ui/StatusBadge";
import ModalBasic from "@components/ui/ModalBasic";
import RefreshButton from "@components/ui/RefreshButton";
import HolidayCalendarsPanel from "../components/HolidayCalendarsPanel";
import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import {
  listSchedules,
  archiveSchedule,
  getEffectiveSchedule,
  clearEffectivePreview,
} from "@store/slices/schedule.slice";
import { listEmployees } from "@store/slices/employee.slice";
import { extractList } from "@utils/api.utils";
import { getTodayIsoDate } from "@utils/date.utils";
import { fetchProjectTeam } from "@store/slices/project.slice";
import { useAccess } from "@hooks/useAccess";
import { PERMISSIONS } from "@constants/permissions";
import { ROUTES } from "@constants/routes";

export default function AllSchedulesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can, user, assignments } = useAccess();
  const isCompanyAdmin = Boolean(user?.isCompanyScoped);
  const firstProjectId = assignments.find((a) => a.projectId)?.projectId;
  const { schedules, isLoadingSchedules, effectivePreview } = useSelector(
    (state) => state.schedule
  );
  const { employeesData } = useSelector((state) => state.employee);
  const { projectTeam: teamItems } = useSelector((state) => state.project);

  const [activeTab, setActiveTab] = useState("schedules");
  const [scopeFilter, setScopeFilter] = useState("ALL");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewEmployeeId, setPreviewEmployeeId] = useState("");
  const [previewDate, setPreviewDate] = useState(getTodayIsoDate());

  const canManage = can({ permissions: [PERMISSIONS.WORK_SCHEDULE.MANAGE] });

  const loadSchedules = useCallback(() => {
    const params = {};
    if (scopeFilter !== "ALL") params.scopeType = scopeFilter;
    if (!isCompanyAdmin && firstProjectId) {
      params.projectId = firstProjectId;
    }
    dispatch(listSchedules(params));
  }, [dispatch, scopeFilter, isCompanyAdmin, firstProjectId]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  useEffect(() => {
    if (!isPreviewOpen) return;
    if (isCompanyAdmin && !employeesData) {
      dispatch(listEmployees());
    } else if (!isCompanyAdmin && firstProjectId && teamItems.length === 0) {
      dispatch(fetchProjectTeam({ projectId: firstProjectId }));
    }
  }, [isPreviewOpen, isCompanyAdmin, employeesData, teamItems.length, firstProjectId, dispatch]);

  const employeeOptions = useMemo(
    () =>
      (isCompanyAdmin ? extractList(employeesData, "employees") : teamItems).map((e) => ({
        label: e.employeeCode ? `${e.displayName} (${e.employeeCode})` : e.displayName,
        value: e.id,
      })),
    [isCompanyAdmin, employeesData, teamItems]
  );

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Schedule",
        render: (s) => (
          <div className="leading-tight">
            <span className="font-semibold text-xs block text-slate-800 dark:text-slate-100">
              {s.name}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">{s.id}</span>
          </div>
        ),
      },
      {
        key: "scopeType",
        header: "Scope",
        render: (s) => (
          <StatusBadge label={s.scopeType || "COMPANY"} tone="indigo" size="xs" />
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (s) => (
          <StatusBadge
            label={s.status || "ACTIVE"}
            tone={s.status === "ARCHIVED" ? "slate" : "emerald"}
            size="sm"
          />
        ),
      },
    ],
    []
  );

  const actions = useMemo(
    () => [
      {
        label: "View details",
        icon: IconEye,
        onClick: (s) => navigate(`${ROUTES.SCHEDULES.DETAILS}?scheduleId=${s.id}`),
      },
      {
        label: "Archive",
        icon: IconArchive,
        hidden: (s) => !canManage || s.status === "ARCHIVED",
        onClick: async (s) => {
          try {
            await dispatch(
              archiveSchedule({ id: s.id, expectedVersion: s.version ?? 0 })
            ).unwrap();
            loadSchedules();
          } catch {
            // handled in slice
          }
        },
      },
    ],
    [canManage]
  );

  const handlePreview = (e) => {
    e.preventDefault();
    if (!previewEmployeeId.trim()) return;
    dispatch(
      getEffectiveSchedule({
        employeeId: previewEmployeeId.trim(),
        asOf: previewDate,
      })
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeaderBanner
        title="Work Schedules"
        description="Manage shift timings, intraday break windows, auto clock-out rules, and holiday calendars."
      />

      <div
        className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/60"
        role="tablist"
      >
        {[
          { key: "schedules", label: "Work Schedules" },
          { key: "holidays", label: "Holiday Calendars" },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={activeTab === t.key}
            onClick={() => setActiveTab(t.key)}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap ${activeTab === t.key
                ? "bg-white text-slate-800 shadow-sm dark:bg-[#1C2536] dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "holidays" ? (
        <HolidayCalendarsPanel canManage={canManage} />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl bg-white dark:bg-[#1C2536]">
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-40">
                <SelectField
                  id="scopeFilter"
                  name="scopeFilter"
                  options={[
                    { label: "All Scopes", value: "ALL" },
                    { label: "Company", value: "COMPANY" },
                    { label: "Project", value: "PROJECT" },
                    { label: "Site", value: "SITE" },
                    { label: "Department", value: "DEPARTMENT" },
                    { label: "Employee", value: "EMPLOYEE" },
                  ]}
                  value={scopeFilter}
                  onChange={(e) => setScopeFilter(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="btn btn-outline btn-sm h-10 inline-flex items-center gap-1.5"
              >
                <IconSearch size={15} />
                <span>Preview Effective Schedule</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {canManage && (
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.SCHEDULES.CREATE)}
                  className="btn btn-primary btn-sm h-10 inline-flex items-center gap-1.5"
                >
                  <IconPlus size={15} />
                  <span>Create Schedule</span>
                </button>
              )}
              <RefreshButton
                onClick={loadSchedules}
                loading={isLoadingSchedules}
                title="Refresh schedules"
                className="h-10 w-10 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700/60"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={schedules}
            actions={actions}
            loading={isLoadingSchedules}
            empty={{
              icon: IconCalendarTime,
              title: "No Work Schedules",
              description: "No schedules match the selected scope.",
            }}
          />
        </>
      )}

      <ModalBasic
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          dispatch(clearEffectivePreview());
        }}
        title="Effective Schedule Preview"
        description="Check which schedule tier (EMPLOYEE → DEPARTMENT → SITE → PROJECT → COMPANY) governs an employee."
        size="md"
      >
        <div className="p-6 space-y-4">
          <form onSubmit={handlePreview} className="space-y-3">
            <SelectField
              id="previewEmployeeId"
              name="previewEmployeeId"
              label="Employee"
              required
              placeholder="Select employee..."
              options={employeeOptions}
              value={previewEmployeeId}
              onChange={(e) => setPreviewEmployeeId(e.target.value)}
            />
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <InputField
                  id="previewDate"
                  name="previewDate"
                  type="date"
                  value={previewDate}
                  onChange={(e) => setPreviewDate(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                Resolve
              </button>
            </div>
          </form>

          {effectivePreview && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-foreground">
                  {effectivePreview.schedule?.name || "Default"}
                </strong>
                <StatusBadge
                  label={`via ${effectivePreview.resolvedVia || "—"}`}
                  tone="blue"
                  size="xs"
                />
              </div>
              {effectivePreview.classification && (
                <p className="text-muted-foreground">
                  Day: <strong>{effectivePreview.classification.day}</strong> (
                  {effectivePreview.classification.reason})
                </p>
              )}
            </div>
          )}
        </div>
      </ModalBasic>
    </div>
  );
}
