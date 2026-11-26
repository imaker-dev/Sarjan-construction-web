import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, Pencil, Plus, ShieldCheck } from "lucide-react";
import { IconClock, IconMapPin } from "@tabler/icons-react";

import DataTable from "@components/ui/DataTable";
import ModalBasic from "@components/ui/ModalBasic";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import StatusBadge from "@components/ui/StatusBadge";
import { SelectField } from "@components/fields/SelectField";
import { ROUTES } from "@constants/routes";
import {
  getAttendancePolicies,
  getEffectiveAttendancePolicy,
} from "@store/slices/attendance.slice";
import { listSites } from "@store/slices/site.slice";
import { listEmployees } from "@store/slices/employee.slice";
import { extractList } from "@utils/api.utils";
import { formatDate } from "@utils/date.utils";
import { formatText } from "@utils/text.utils";
import { useNavigate } from "react-router-dom";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const Muted = ({ children }) => (
  <span className="text-slate-400 dark:text-slate-500">{children}</span>
);

const formatDuration = (minutes) => {
  if (minutes == null) return "—";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours && remainingMinutes) return `${hours}h ${remainingMinutes}m`;
  if (hours) return `${hours}h`;
  return `${remainingMinutes}m`;
};

const formatTime = (hour, minute) =>
  `${String(hour ?? 0).padStart(2, "0")}:${String(minute ?? 0).padStart(2, "0")}`;

// --------------------------------------------------
// All Attendance Policies Page
// --------------------------------------------------

const AllAttendancePoliciesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    isFetchingPolicies,
    attendancePolicies,
    effectivePolicy,
    isFetchingEffectivePolicy,
  } = useSelector((state) => state.attendance);
  const { sitesData } = useSelector((state) => state.site);
  const { employeesData } = useSelector((state) => state.employee);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const previewFormik = useFormik({
    initialValues: { siteId: "", employeeId: "" },
    validationSchema: Yup.object({
      siteId: Yup.string().nullable(),
      employeeId: Yup.string().nullable(),
    }),
    onSubmit: (values) => {
      const params = {};
      if (values.siteId) params.siteId = values.siteId;
      if (values.employeeId) params.employeeId = values.employeeId;
      dispatch(getEffectiveAttendancePolicy(params));
    },
  });

  useEffect(() => {
    if (!isPreviewOpen) return;
    if (!sitesData) dispatch(listSites());
    if (!employeesData) dispatch(listEmployees());
  }, [isPreviewOpen, sitesData, employeesData, dispatch]);

  const siteOptions = useMemo(
    () =>
      extractList(sitesData).map((s) => ({
        label: s.code ? `${s.name} (${s.code})` : s.name,
        value: s.id,
      })),
    [sitesData],
  );

  const employeeOptions = useMemo(
    () =>
      extractList(employeesData, "employees").map((e) => ({
        label: e.employeeCode ? `${e.displayName} (${e.employeeCode})` : e.displayName,
        value: e.id,
      })),
    [employeesData],
  );

  // --------------------------------------------------
  // Fetch Attendance Policies
  // --------------------------------------------------

  useEffect(() => {
    dispatch(getAttendancePolicies());
  }, [dispatch]);

  const rows = useMemo(() => {
    if (Array.isArray(attendancePolicies?.policies)) {
      return attendancePolicies.policies;
    }

    if (Array.isArray(attendancePolicies)) {
      return attendancePolicies;
    }

    return [];
  }, [attendancePolicies]);

  // --------------------------------------------------
  // Table Columns
  // --------------------------------------------------

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Attendance Policy",
        render: (policy) => (
          <div className="min-w-0 py-1">
            <p className="text-[13.5px] font-semibold text-slate-800 dark:text-slate-100">
              {policy.name}
            </p>
            <p className="mt-1 max-w-[240px] truncate text-xs text-slate-400 dark:text-slate-500">
              {policy.description || "No description provided"}
            </p>
          </div>
        ),
      },
      {
        key: "scope",
        header: "Scope",
        render: (policy) => (
          <div className="leading-tight">
            <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200">
              {formatText(policy.scope)}
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {policy.scope === "COMPANY"
                ? "Entire company"
                : policy.scope === "PROJECT"
                  ? "Project level"
                  : policy.scope === "SITE"
                    ? "Site level"
                    : "Employee level"}
            </p>
          </div>
        ),
      },
      {
        key: "workSchedule",
        header: "Work Schedule",
        render: (policy) => (
          <div className="leading-tight">
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
              {formatDuration(policy.shiftDurationMins)}
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Starts {formatTime(policy.dayStartHour, policy.dayStartMinute)}
            </p>
          </div>
        ),
      },
      {
        key: "attendanceRules",
        header: "Attendance Rules",
        render: (policy) => (
          <div className="space-y-1 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              <span className="text-slate-400 dark:text-slate-500">Break:</span>{" "}
              {policy.breakMode === "FIXED"
                ? `${formatDuration(policy.fixedBreakMins)} fixed`
                : `${formatDuration(policy.maxDynamicBreakMins)} dynamic`}
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              <span className="text-slate-400 dark:text-slate-500">
                Overtime:
              </span>{" "}
              {formatText(policy.overtimeMode)}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (policy) => (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              policy.status === "ACTIVE"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                policy.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            {formatText(policy.status)}
          </span>
        ),
      },
    ],
    [],
  );

  const actions = useMemo(
    () => [
      {
        label: "View",
        icon: Eye,
        onClick: (policy) =>
          navigate(ROUTES.ATTENDANCE.POLICY_DETAILS + "?policyId=" + policy.id),
      },
      {
        label: "Edit",
        icon: Pencil,
        onClick: (policy) =>
          navigate(ROUTES.ATTENDANCE.UPDATE_POLICY + "?policyId=" + policy.id),
      },
    ],
    [navigate],
  );

  return (
    <div className="space-y-5">
      <PageHeaderBanner title="Attendance Policies" />

      <DataTable
        title="Attendance Policies"
        columns={columns}
        actions={actions}
        data={rows}
        loading={isFetchingPolicies}
        headerActions={[
          {
            label: "Preview Effective",
            icon: ShieldCheck,
            variant: "outline",
            onClick: () => setIsPreviewOpen(true),
          },
          {
            label: "Add Policy",
            icon: Plus,
            variant: "primary",
            onClick: () => navigate(ROUTES.ATTENDANCE.CREATE_POLICY),
          },
        ]}
        empty={{
          icon: IconClock,
          title: "No attendance policies yet",
          description: "Attendance policies you create will appear here.",
        }}
      />

      <ModalBasic
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Preview Effective Attendance Policy"
        description="Resolve the effective attendance policy for a site and/or employee context."
        size="md"
      >
        <form onSubmit={previewFormik.handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              id="previewSiteId"
              name="siteId"
              label="Site (Optional)"
              placeholder="Company default"
              options={siteOptions}
              value={previewFormik.values.siteId}
              onChange={previewFormik.handleChange}
            />
            <SelectField
              id="previewEmployeeId"
              name="employeeId"
              label="Employee (Optional)"
              placeholder="Any employee"
              options={employeeOptions}
              value={previewFormik.values.employeeId}
              onChange={previewFormik.handleChange}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="btn btn-outline btn-sm"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isFetchingEffectivePolicy}
              className="btn btn-primary btn-sm"
            >
              {isFetchingEffectivePolicy ? "Resolving..." : "Resolve Policy"}
            </button>
          </div>

          {effectivePolicy && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-sm text-slate-800 dark:text-white">
                  {effectivePolicy.name || "Resolved Policy"}
                </strong>
                <StatusBadge
                  label={effectivePolicy.scopeType || "COMPANY"}
                  tone="indigo"
                  size="xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 tabular-nums">
                <div>
                  <span className="text-slate-400 block">Work Window</span>
                  <strong className="text-slate-700 dark:text-slate-200">
                    {formatTime(effectivePolicy.workStartHour, effectivePolicy.workStartMinute)} –{" "}
                    {formatTime(effectivePolicy.workEndHour, effectivePolicy.workEndMinute)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Full / Half Day</span>
                  <strong className="text-slate-700 dark:text-slate-200">
                    {formatDuration(effectivePolicy.fullDayMinutes)} /{" "}
                    {formatDuration(effectivePolicy.halfDayMinutes)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Grace Period</span>
                  <strong className="text-slate-700 dark:text-slate-200">
                    {formatDuration(effectivePolicy.lateGraceMinutes)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Overtime</span>
                  <strong className="text-slate-700 dark:text-slate-200">
                    {effectivePolicy.overtimeEnabled ? "Enabled" : "Disabled"}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </form>
      </ModalBasic>
    </div>
  );
};

export default AllAttendancePoliciesPage;
