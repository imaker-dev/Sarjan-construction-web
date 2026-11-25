import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  IconCalendarTime,
  IconPlus,
  IconEye,
  IconArchive,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import DataTable from "@components/ui/DataTable";
import StatusBadge from "@components/ui/StatusBadge";
import ModalBasic from "@components/ui/ModalBasic";
import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import {
  listSchedules,
  archiveSchedule,
  getEffectiveSchedule,
  clearEffectivePreview,
  extractList,
} from "@store/slices/schedule.slice";
import { listEmployees } from "@store/slices/employee.slice";
import { useAccess } from "@hooks/useAccess";
import { PERMISSIONS } from "@constants/permissions";
import { ROUTES } from "@constants/routes";

export default function AllSchedulesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = useAccess();
  const { schedules, isLoadingSchedules, effectivePreview } = useSelector(
    (state) => state.schedule
  );
  const { employeesData } = useSelector((state) => state.employee);

  const [scopeFilter, setScopeFilter] = useState("ALL");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewEmployeeId, setPreviewEmployeeId] = useState("");
  const [previewDate, setPreviewDate] = useState(new Date().toISOString().split("T")[0]);

  const canManage = can({ permissions: [PERMISSIONS.WORK_SCHEDULE.MANAGE] });

  const loadSchedules = useCallback(() => {
    const params = {};
    if (scopeFilter !== "ALL") params.scopeType = scopeFilter;
    dispatch(listSchedules(params));
  }, [dispatch, scopeFilter]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  useEffect(() => {
    if (isPreviewOpen && !employeesData) {
      dispatch(listEmployees());
    }
  }, [isPreviewOpen, employeesData, dispatch]);

  const employeeOptions = useMemo(
    () =>
      extractList(employeesData, "employees").map((e) => ({
        label: e.employeeCode ? `${e.displayName} (${e.employeeCode})` : e.displayName,
        value: e.id,
      })),
    [employeesData]
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
        description="Manage shift timings, intraday break windows, auto clock-out rules, and holiday overrides."
      />

      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] p-3">
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
            className="btn btn-outline btn-xs inline-flex items-center gap-1.5"
          >
            <IconSearch size={14} />
            <span>Preview Effective Schedule</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              type="button"
              onClick={() => navigate(ROUTES.SCHEDULES.CREATE)}
              className="btn btn-primary btn-xs inline-flex items-center gap-1"
            >
              <IconPlus size={14} />
              <span>Create Schedule</span>
            </button>
          )}
          <button
            type="button"
            onClick={loadSchedules}
            disabled={isLoadingSchedules}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60"
            title="Refresh schedules"
          >
            <IconRefresh size={16} className={isLoadingSchedules ? "animate-spin" : ""} />
          </button>
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
