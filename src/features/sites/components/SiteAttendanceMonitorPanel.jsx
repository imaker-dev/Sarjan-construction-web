import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IconClock,
  IconUsers,
  IconCheck,
  IconAlertTriangle,
  IconEye,
  IconEdit,
} from "@tabler/icons-react";
import DataTable from "@components/ui/DataTable";
import StatCard from "@components/ui/StatCard";
import StatusBadge, { getStatusTone } from "@components/ui/StatusBadge";
import ModalBasic from "@components/ui/ModalBasic";
import RefreshButton from "@components/ui/RefreshButton";
import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import RegularizeSessionModal from "@features/daily-reports/components/RegularizeSessionModal";
import {
  getAttendanceDailySummary,
  getAttendanceSessions,
  getAttendanceSession,
} from "@store/slices/attendance.slice";
import { extractList } from "@utils/api.utils";
import { formatDate, getTodayIsoDate } from "@utils/date.utils";

const SESSION_STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Regularized", value: "REGULARIZED" },
  { label: "Flagged", value: "FLAGGED" },
];

export default function SiteAttendanceMonitorPanel({ siteId, canManage = false }) {
  const dispatch = useDispatch();
  const {
    dailySummary,
    attendanceSessions,
    attendanceSession,
    isFetchingDailySummary,
    isFetchingSessions,
    isFetchingSession,
  } = useSelector((state) => state.attendance);

  const [businessDate, setBusinessDate] = useState(getTodayIsoDate());
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [regularizeTarget, setRegularizeTarget] = useState(null);

  const loadData = useCallback(() => {
    if (!siteId) return;
    dispatch(getAttendanceDailySummary({ siteId, businessDate }));
    const params = { siteId, businessDate };
    if (statusFilter) params.status = statusFilter;
    dispatch(getAttendanceSessions(params));
  }, [dispatch, siteId, businessDate, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedSessionId) {
      dispatch(getAttendanceSession(selectedSessionId));
    }
  }, [dispatch, selectedSessionId]);

  const sessionsList = useMemo(
    () => extractList(attendanceSessions, "sessions"),
    [attendanceSessions]
  );

  const summary = dailySummary?.summary || dailySummary || {};

  const columns = useMemo(
    () => [
      {
        key: "employee",
        header: "Worker",
        render: (s) => (
          <div>
            <span className="font-semibold text-xs block text-slate-800 dark:text-slate-100">
              {s.employee?.displayName || s.displayName || "—"}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {s.employee?.employeeCode || s.employeeCode || "—"}
            </span>
          </div>
        ),
      },
      {
        key: "punchInAt",
        header: "Punch In",
        render: (s) => (
          <span className="text-xs tabular-nums">
            {s.punchInAt ? formatDate(s.punchInAt, "shortTime") : "—"}
          </span>
        ),
      },
      {
        key: "punchOutAt",
        header: "Punch Out",
        render: (s) => (
          <span className="text-xs tabular-nums">
            {s.punchOutAt ? formatDate(s.punchOutAt, "shortTime") : "—"}
          </span>
        ),
      },
      {
        key: "presentUnits",
        header: "Units",
        render: (s) => (
          <span className="text-xs font-semibold tabular-nums">
            {s.presentUnits != null ? Number(s.presentUnits).toFixed(1) : "—"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (s) => (
          <StatusBadge
            label={s.status || "ACTIVE"}
            tone={getStatusTone(s.status || "ACTIVE")}
            size="xs"
          />
        ),
      },
    ],
    []
  );

  const actions = useMemo(
    () => [
      {
        label: "View Session",
        icon: IconEye,
        onClick: (s) => setSelectedSessionId(s.id),
      },
      ...(canManage
        ? [
            {
              label: "Regularize",
              icon: IconEdit,
              onClick: (s) => setRegularizeTarget(s),
            },
          ]
        : []),
    ],
    [canManage]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] p-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-44">
            <InputField
              id="monitorBusinessDate"
              name="businessDate"
              type="date"
              label="Business Date"
              value={businessDate}
              onChange={(e) => setBusinessDate(e.target.value)}
            />
          </div>
          <div className="w-44">
            <SelectField
              id="monitorStatusFilter"
              name="statusFilter"
              label="Status"
              options={SESSION_STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
        </div>
        <RefreshButton
          onClick={loadData}
          loading={isFetchingDailySummary || isFetchingSessions}
          className="h-10 w-10 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700/60"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          color="blue"
          icon={IconUsers}
          label="Total sessions"
          value={summary.totalSessions ?? summary.total ?? sessionsList.length}
        />
        <StatCard
          color="cyan"
          icon={IconClock}
          label="Active now"
          value={summary.activeSessions ?? summary.active ?? 0}
        />
        <StatCard
          color="emerald"
          icon={IconCheck}
          label="Completed"
          value={summary.completedSessions ?? summary.completed ?? 0}
        />
        <StatCard
          color="amber"
          icon={IconAlertTriangle}
          label="Flagged"
          value={summary.flaggedSessions ?? summary.flagged ?? 0}
        />
      </div>

      <DataTable
        columns={columns}
        data={sessionsList}
        actions={actions}
        loading={isFetchingSessions}
        empty={{
          icon: IconClock,
          title: "No Attendance Sessions",
          description: "No punch sessions recorded for this site on the selected date.",
        }}
      />

      <ModalBasic
        isOpen={Boolean(selectedSessionId)}
        onClose={() => setSelectedSessionId(null)}
        title="Attendance Session Details"
        size="md"
      >
        <div className="space-y-4 p-6 text-xs">
          {isFetchingSession ? (
            <p className="text-center text-slate-400 py-6">Loading session...</p>
          ) : attendanceSession ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-sm text-slate-800 dark:text-white block">
                    {attendanceSession.employee?.displayName || "Worker"}
                  </strong>
                  <span className="font-mono text-slate-400">
                    {attendanceSession.employee?.employeeCode || "—"}
                  </span>
                </div>
                <StatusBadge
                  label={attendanceSession.status || "ACTIVE"}
                  tone={getStatusTone(attendanceSession.status || "ACTIVE")}
                  size="sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 p-3 tabular-nums">
                <div>
                  <span className="text-slate-400 block">Punch In</span>
                  <strong>
                    {attendanceSession.punchInAt
                      ? formatDate(attendanceSession.punchInAt, "shortTime")
                      : "—"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Punch Out</span>
                  <strong>
                    {attendanceSession.punchOutAt
                      ? formatDate(attendanceSession.punchOutAt, "shortTime")
                      : "—"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Hazri Units</span>
                  <strong>
                    {attendanceSession.presentUnits != null
                      ? Number(attendanceSession.presentUnits).toFixed(1)
                      : "—"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Overtime Hours</span>
                  <strong>{attendanceSession.overtimeHours ?? 0}h</strong>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Breaks ({attendanceSession.breaks?.length ?? 0})
                </h4>
                {(attendanceSession.breaks || []).length === 0 ? (
                  <p className="text-slate-400">No breaks recorded.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 dark:divide-slate-700/60 rounded-lg border border-slate-200 dark:border-slate-700/60">
                    {attendanceSession.breaks.map((b, idx) => (
                      <li key={b.id || idx} className="flex justify-between px-3 py-2 tabular-nums">
                        <span>{b.breakType || "BREAK"}</span>
                        <span>
                          {b.startedAt ? formatDate(b.startedAt, "time") : "—"} →{" "}
                          {b.endedAt ? formatDate(b.endedAt, "time") : "Ongoing"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : null}
        </div>
      </ModalBasic>

      {regularizeTarget && (
        <RegularizeSessionModal
          isOpen={Boolean(regularizeTarget)}
          onClose={() => setRegularizeTarget(null)}
          session={regularizeTarget}
          businessDate={businessDate}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
