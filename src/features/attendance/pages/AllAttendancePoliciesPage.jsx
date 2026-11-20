import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Pencil, Plus } from "lucide-react";
import { IconClock, IconMapPin } from "@tabler/icons-react";

import DataTable from "@components/ui/DataTable";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import { ROUTES } from "@constants/routes";
import { getAttendancePolicies } from "@store/slices/attendance.slice";
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

  const { isFetchingPolicies, attendancePolicies } = useSelector(
    (state) => state.attendance,
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
    </div>
  );
};

export default AllAttendancePoliciesPage;
