import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  IconLock,
  IconEye,
  IconRefresh,
  IconCalculator,
  IconUsers,
  IconClock,
  IconCheck,
  IconHourglassEmpty,
  IconFileSpreadsheet,
  IconClipboardList,
  IconSearch,
} from "@tabler/icons-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import DataTable from "@components/ui/DataTable";
import StatCard from "@components/ui/StatCard";
import DateRangePicker from "@components/fields/DateRangePicker";
import WeeklyWorkProgressBar from "@features/attendance/components/WeeklyWorkProgressBar";
import LockReportModal from "../components/LockReportModal";
import RecalculateReportModal from "../components/RecalculateReportModal";
import { listDailyReports } from "@store/slices/dailyReport.slice";
import { getMusterRoll } from "@store/slices/attendance.slice";
import { listProjects } from "@store/slices/project.slice";
import { listSites } from "@store/slices/site.slice";
import { getAllHeadOffices } from "@store/slices/head-office.slice";
import { listDepartments } from "@store/slices/department.slice";
import { ROUTES } from "@constants/routes";

const STATUS_BADGES = {
  DRAFT:
    "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
  SUBMITTED:
    "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40",
  APPROVED:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 font-semibold",
  REJECTED:
    "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40",
  LOCKED:
    "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 font-bold",
};

const STATUS_LABELS = {
  DRAFT: "Draft",
  SUBMITTED: "In Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  LOCKED: "Locked",
};

const PERIOD_PRESETS = [
  { value: "WEEKLY", label: "This Week (48h)" },
  { value: "DAILY", label: "Today" },
  { value: "MONTHLY", label: "This Month" },
];

export default function DailyReportsListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: "reports" (Site Reports) vs "muster-roll" (Office Attendance)
  const activeTab = searchParams.get("tab") === "muster-roll" ? "muster-roll" : "reports";

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  // Redux Store Selectors
  const { reports, isListingReports } = useSelector((state) => state.dailyReport);
  const { musterRoll, isFetchingMusterRoll } = useSelector((state) => state.attendance);
  const { projectsData } = useSelector((state) => state.project);
  const { sitesData } = useSelector((state) => state.site);
  const { headOfficesData } = useSelector((state) => state.headOffice);
  const { departmentsData } = useSelector((state) => state.department);

  // Common Scope / Modal States
  const [lockCandidate, setLockCandidate] = useState(null);
  const [isRecalcModalOpen, setIsRecalcModalOpen] = useState(false);

  // Site Reports Filters State
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dsrFromDate, setDsrFromDate] = useState("");
  const [dsrToDate, setDsrToDate] = useState("");

  // Office Attendance Filters State
  const [period, setPeriod] = useState("WEEKLY");
  const [refDate, setRefDate] = useState(new Date().toISOString().split("T")[0]);
  const [musterFromDate, setMusterFromDate] = useState("");
  const [musterToDate, setMusterToDate] = useState("");
  const [selectedHeadOfficeId, setSelectedHeadOfficeId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedMusterSiteId, setSelectedMusterSiteId] = useState("");
  const [workerSearchTerm, setWorkerSearchTerm] = useState("");
  const [attendanceViewMode, setAttendanceViewMode] = useState("date-wise"); // "date-wise" | "weekly-summary"

  // Initial Scope Data Fetch
  useEffect(() => {
    dispatch(listProjects());
    dispatch(listSites());
    dispatch(getAllHeadOffices());
    dispatch(listDepartments());
  }, [dispatch]);

  // Fetch Site Reports
  const fetchReports = () => {
    const params = { limit: 50, offset: 0 };
    if (selectedSiteId) params.siteId = selectedSiteId;
    if (statusFilter !== "ALL") params.status = statusFilter;
    if (dsrFromDate) params.fromDate = dsrFromDate;
    if (dsrToDate) params.toDate = dsrToDate;

    dispatch(listDailyReports(params));
  };

  // Fetch Office Attendance Data
  const fetchMusterRollData = () => {
    const params = {};
    if (musterFromDate || musterToDate) {
      params.period = "CUSTOM";
      params.from = musterFromDate;
      params.to = musterToDate || musterFromDate;
    } else {
      params.period = period;
      if (refDate) params.date = refDate;
    }

    if (selectedHeadOfficeId) params.headOfficeId = selectedHeadOfficeId;
    if (selectedDepartmentId) params.departmentId = selectedDepartmentId;
    if (selectedMusterSiteId) params.siteId = selectedMusterSiteId;

    dispatch(getMusterRoll(params));
  };

  // Re-fetch triggers
  useEffect(() => {
    fetchReports();
  }, [dispatch, selectedSiteId, statusFilter, dsrFromDate, dsrToDate]);

  useEffect(() => {
    fetchMusterRollData();
  }, [
    dispatch,
    period,
    refDate,
    musterFromDate,
    musterToDate,
    selectedHeadOfficeId,
    selectedDepartmentId,
    selectedMusterSiteId,
  ]);

  // Normalizing Project, Site, Head Office & Department lists
  const projectsList = Array.isArray(projectsData)
    ? projectsData
    : Array.isArray(projectsData?.data)
      ? projectsData.data
      : [];

  const sitesList = Array.isArray(sitesData)
    ? sitesData
    : Array.isArray(sitesData?.data)
      ? sitesData.data
      : [];

  const headOfficesList = Array.isArray(headOfficesData)
    ? headOfficesData
    : Array.isArray(headOfficesData?.data)
      ? headOfficesData.data
      : [];

  const departmentsList = Array.isArray(departmentsData)
    ? departmentsData
    : Array.isArray(departmentsData?.data)
      ? departmentsData.data
      : [];

  // Filter sites when project changes
  const filteredSites = useMemo(() => {
    if (!selectedProjectId) return sitesList;
    return sitesList.filter((s) => s.projectId === selectedProjectId);
  }, [sitesList, selectedProjectId]);

  // Client-side filter fallback for Site Reports
  const displayedReports = useMemo(() => {
    if (!Array.isArray(reports)) return [];
    if (!selectedProjectId) return reports;
    return reports.filter((r) => r.projectId === selectedProjectId);
  }, [reports, selectedProjectId]);

  // Attendance Data extraction
  const musterData = musterRoll?.data || musterRoll || {};
  const departmentSummaries = Array.isArray(musterData.departmentSummaries)
    ? musterData.departmentSummaries
    : [];
  const rawWorkerSummaries = Array.isArray(musterData.workerSummaries)
    ? musterData.workerSummaries
    : [];
  const rawSessions = Array.isArray(musterData.sessions)
    ? musterData.sessions
    : [];

  // Filter workers by search term
  const filteredWorkers = useMemo(() => {
    if (!workerSearchTerm) return rawWorkerSummaries;
    const term = workerSearchTerm.toLowerCase();
    return rawWorkerSummaries.filter(
      (w) =>
        w.displayName?.toLowerCase().includes(term) ||
        w.employeeCode?.toLowerCase().includes(term) ||
        w.department?.name?.toLowerCase().includes(term) ||
        w.department?.code?.toLowerCase().includes(term)
    );
  }, [rawWorkerSummaries, workerSearchTerm]);

  // Filter date-wise sessions by search term
  const filteredSessions = useMemo(() => {
    if (!workerSearchTerm) return rawSessions;
    const term = workerSearchTerm.toLowerCase();
    return rawSessions.filter((s) => {
      const name = s.employee?.displayName?.toLowerCase() || "";
      const code = s.employee?.employeeCode?.toLowerCase() || "";
      const dept =
        s.employee?.memberships?.find((m) => m.isPrimary)?.department?.name?.toLowerCase() ||
        "";
      return name.includes(term) || code.includes(term) || dept.includes(term);
    });
  }, [rawSessions, workerSearchTerm]);

  // Lookup map for locked reports by location + businessDate
  const lockedReportsMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(reports)) {
      for (const r of reports) {
        if (r.siteId && r.businessDate) {
          map.set(`${r.siteId}_${r.businessDate}`, r.status);
        }
      }
    }
    return map;
  }, [reports]);

  // Summary Metrics
  const kpis = useMemo(() => {
    const list = Array.isArray(reports) ? reports : [];
    const approvedCount = list.filter((r) => r.status === "APPROVED").length;
    const submittedCount = list.filter((r) => r.status === "SUBMITTED").length;
    const totalMandays = list.reduce(
      (sum, r) => sum + Number(r.totalPresentUnits || 0),
      0
    );
    const totalOT = list.reduce(
      (sum, r) => sum + Number(r.totalOvertimeHours || 0),
      0
    );

    return {
      approvedCount,
      submittedCount,
      totalMandays: totalMandays % 1 === 0 ? totalMandays : totalMandays.toFixed(1),
      totalOT: totalOT % 1 === 0 ? totalOT : totalOT.toFixed(1),
    };
  }, [reports]);

  // ==========================================
  // TABLE COLUMNS: Site Reports
  // Clean, high-signal, readable layout
  // ==========================================
  const dsrColumns = useMemo(
    () => [
      {
        key: "businessDate",
        header: "Date",
        render: (r) => {
          const d = r.businessDate ? new Date(r.businessDate) : null;
          return (
            <div className="leading-tight">
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs block">
                {d
                  ? d.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                  : "—"}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                {d ? d.toLocaleDateString("en-IN", { weekday: "short" }) : ""}
              </span>
            </div>
          );
        },
      },
      {
        key: "site",
        header: "Site",
        render: (r) => (
          <div className="leading-tight max-w-[220px]">
            <span className="font-semibold text-slate-800 dark:text-slate-100 truncate block text-xs">
              {r.site?.name || r.site?.code || "—"}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate block mt-0.5">
              {r.project?.name || r.project?.code || "—"}
            </span>
          </div>
        ),
      },
      {
        key: "workforceMix",
        header: "People on Site",
        render: (r) => (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
              <span>Staff:</span>
              <strong className="font-semibold">{r.catAStaffUnits ?? 0}</strong>
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <span>Workers:</span>
              <strong className="font-semibold">{r.catBDirectUnits ?? 0}</strong>
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              <span>Contractors:</span>
              <strong className="font-semibold">{r.catCSubconUnits ?? 0}</strong>
            </span>
          </div>
        ),
      },
      {
        key: "settlementUnits",
        header: "Days & Overtime",
        render: (r) => (
          <div className="leading-tight">
            <span className="font-bold text-slate-800 dark:text-slate-100 text-xs tabular-nums block">
              {r.totalPresentUnits ?? "0.0"} days
            </span>
            {Number(r.totalOvertimeHours || 0) > 0 ? (
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 tabular-nums block mt-0.5">
                +{r.totalOvertimeHours}h overtime
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">
                No overtime
              </span>
            )}
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        mobilePosition: "header",
        render: (r) => (
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] ${
              STATUS_BADGES[r.status] || "bg-slate-100 text-slate-700"
            }`}
          >
            {r.status === "LOCKED" && <IconLock size={12} />}
            {r.status === "APPROVED" && <IconCheck size={12} />}
            {STATUS_LABELS[r.status] || r.status}
          </span>
        ),
      },
    ],
    []
  );

  const dsrActions = useMemo(
    () => [
      {
        label: "View details",
        icon: IconEye,
        onClick: (r) =>
          navigate(ROUTES.DAILY_REPORTS.DETAILS.replace(":id", r.id)),
      },
      {
        label: "Lock report",
        icon: IconLock,
        hidden: (r) => r.status !== "APPROVED",
        onClick: (r) => setLockCandidate(r),
      },
    ],
    [navigate]
  );

  const formatTimeStr = (isoStr) => {
    if (!isoStr) return "";
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ==========================================
  // TABLE COLUMNS: Date-wise Attendance Logs
  // ==========================================
  const dateWiseColumns = useMemo(
    () => [
      {
        key: "businessDate",
        header: "Date",
        render: (s) => {
          const d = s.businessDate ? new Date(s.businessDate + "T00:00:00") : null;
          return (
            <div className="leading-tight">
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs block">
                {d
                  ? d.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
                {d ? d.toLocaleDateString("en-IN", { weekday: "short" }) : ""}
              </span>
            </div>
          );
        },
      },
      {
        key: "employee",
        header: "Employee",
        render: (s) => {
          const emp = s.employee;
          const primaryDept = emp?.memberships?.find((m) => m.isPrimary)?.department;
          return (
            <div className="leading-tight">
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs block">
                {emp?.displayName || "—"}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                <span className="font-mono">{emp?.employeeCode || "—"}</span>
                {primaryDept && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[140px]">{primaryDept.name}</span>
                  </>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: "punches",
        header: "Timing & Punches",
        render: (s) => {
          const inTime = s.punchInAt ? formatTimeStr(s.punchInAt) : null;
          const outTime = s.punchOutAt ? formatTimeStr(s.punchOutAt) : null;

          return (
            <div className="text-xs leading-tight">
              {inTime ? (
                <span className="font-medium text-slate-700 dark:text-slate-200 block tabular-nums">
                  {inTime} {outTime ? `– ${outTime}` : "– Working"}
                </span>
              ) : (
                <span className="text-slate-400 text-xs">No punch recorded</span>
              )}
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5 truncate max-w-[160px]">
                {s.site?.name || s.headOffice?.name || "Main Office"}
              </span>
            </div>
          );
        },
      },
      {
        key: "hoursWorked",
        header: "Work Hours",
        render: (s) => {
          const isActive = s.status === "IN_PROGRESS" || (!s.punchOutAt && s.punchInAt);
          let durationMins = s.netDurationMins || s.grossDurationMins || 0;

          if (isActive && s.punchInAt) {
            const elapsedMs = Math.max(
              0,
              Date.now() - new Date(s.punchInAt).getTime() - (s.breakDurationMins || 0) * 60000
            );
            durationMins = Math.floor(elapsedMs / 60000);
          }

          const h = Math.floor(durationMins / 60);
          const m = durationMins % 60;
          const otHours = Number(s.overtimeHours || 0);

          return (
            <div className="leading-tight">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-xs tabular-nums block">
                {h}h {m}m {isActive ? <span className="text-[10px] text-emerald-600 font-normal ml-0.5">(live)</span> : null}
              </span>
              {otHours > 0 ? (
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 tabular-nums block mt-0.5">
                  +{otHours}h overtime
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">
                  {s.presentUnits ? `${s.presentUnits} day unit` : "Full Day"}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        render: (s) => {
          const locKey = s.siteId
            ? `${s.siteId}_${s.businessDate}`
            : s.headOfficeId
              ? `${s.headOfficeId}_${s.businessDate}`
              : null;
          const reportStatus = locKey ? lockedReportsMap.get(locKey) : null;
          const isLocked = reportStatus === "LOCKED";
          const isApproved = reportStatus === "APPROVED";
          const isActive = s.status === "IN_PROGRESS" || (!s.punchOutAt && s.punchInAt);

          if (isLocked) {
            return (
              <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                <IconLock size={12} />
                Locked
              </span>
            );
          }

          if (isActive) {
            return (
              <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Clocked In
              </span>
            );
          }

          if (isApproved) {
            return (
              <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <IconCheck size={12} />
                Approved
              </span>
            );
          }

          return (
            <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300">
              <IconCheck size={12} />
              Completed
            </span>
          );
        },
      },
    ],
    [lockedReportsMap]
  );

  // ==========================================
  // TABLE COLUMNS: Weekly Rollup (48h)
  // ==========================================
  const musterColumns = useMemo(
    () => [
      {
        key: "displayName",
        header: "Employee",
        render: (w) => (
          <div className="leading-tight">
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-xs block">
              {w.displayName || "—"}
            </span>
            <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 block">
              {w.employeeCode || "—"}
            </span>
          </div>
        ),
      },
      {
        key: "department",
        header: "Department",
        render: (w) =>
          w.department ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>{w.department.name}</span>
            </span>
          ) : (
            <span className="text-slate-400 text-xs">—</span>
          ),
      },
      {
        key: "daysPresent",
        header: "Days Worked",
        render: (w) => (
          <div className="text-xs leading-tight">
            <span className="font-bold text-slate-800 dark:text-slate-100 tabular-nums block">
              {w.daysPresent ?? 0} {w.daysPresent === 1 ? "day" : "days"}
            </span>
            {w.totalPresentUnits !== undefined && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums block mt-0.5">
                {w.totalPresentUnits} units
              </span>
            )}
          </div>
        ),
      },
      {
        key: "weeklyProgress",
        header: "Weekly Goal (48h)",
        render: (w) =>
          w.weeklyProgress ? (
            <WeeklyWorkProgressBar mode="compact" data={w.weeklyProgress} />
          ) : (
            <span className="text-slate-400 text-xs italic">
              No weekly metrics
            </span>
          ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeaderBanner
        title="Daily Reports"
        description="View site work reports and office staff attendance."
      />

      {/* Summary StatCards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <StatCard
          icon={IconCheck}
          color="emerald"
          label="Approved reports"
          value={kpis.approvedCount}
        />
        <StatCard
          icon={IconHourglassEmpty}
          color="sky"
          label="In review"
          value={kpis.submittedCount}
        />
        <StatCard
          icon={IconUsers}
          color="primary"
          label="Days worked"
          value={kpis.totalMandays}
        />
        <StatCard
          icon={IconClock}
          color="amber"
          label="Overtime"
          value={`${kpis.totalOT}h`}
        />
      </div>

      {/* Tab Switcher: Site Reports vs Office Attendance */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700/60 pb-3">
        <div
          className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800/60"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "reports"}
            onClick={() => handleTabChange("reports")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "reports"
                ? "bg-white text-slate-800 shadow-sm dark:bg-[#1C2536] dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <IconFileSpreadsheet size={16} />
            <span>Site Reports</span>
            <span className="ml-1 rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold dark:bg-slate-700">
              {displayedReports?.length ?? 0}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "muster-roll"}
            onClick={() => handleTabChange("muster-roll")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "muster-roll"
                ? "bg-white text-slate-800 shadow-sm dark:bg-[#1C2536] dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <IconClipboardList size={16} />
            <span>Office Attendance</span>
            <span className="ml-1 rounded-full bg-primary-500/10 px-2 py-0.5 text-[10px] font-bold text-primary-600 dark:text-primary-400">
              Weekly 48h
            </span>
          </button>
        </div>

        {/* Recalculate Day Action */}
        <button
          type="button"
          onClick={() => setIsRecalcModalOpen(true)}
          className="btn btn-outline btn-sm inline-flex items-center gap-1.5 ml-auto"
        >
          <IconCalculator size={15} />
          <span>Recalculate Day</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: Site Reports                                       */}
      {/* ========================================================= */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {/* Streamlined Filter Toolbar */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] p-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                {/* Project Filter */}
                <select
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    setSelectedSiteId("");
                  }}
                  style={{ width: "auto" }}
                  className="form-select form-sm w-auto min-w-[140px] max-w-[170px] shrink-0"
                >
                  <option value="">All Projects</option>
                  {projectsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                {/* Site Filter */}
                <select
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  style={{ width: "auto" }}
                  className="form-select form-sm w-auto min-w-[150px] max-w-[190px] shrink-0"
                >
                  <option value="">All Sites</option>
                  {filteredSites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ width: "auto" }}
                  className="form-select form-sm w-auto min-w-[125px] max-w-[150px] shrink-0"
                >
                  <option value="ALL">All Status</option>
                  <option value="APPROVED">Approved</option>
                  <option value="SUBMITTED">In Review</option>
                  <option value="LOCKED">Locked</option>
                  <option value="DRAFT">Draft</option>
                </select>

                {/* Date Range Picker */}
                <DateRangePicker
                  key={`dsr_${dsrFromDate || ""}_${dsrToDate || ""}`}
                  value={
                    dsrFromDate && dsrToDate
                      ? { startDate: dsrFromDate, endDate: dsrToDate }
                      : null
                  }
                  onChange={(range) => {
                    setDsrFromDate(range?.startDate || "");
                    setDsrToDate(range?.endDate || "");
                  }}
                  placeholder="Date or range"
                  defaultRange={null}
                  className="shrink-0 [&>button]:!py-1.5 [&>button]:!px-2.5 [&>button]:!text-xs [&>button]:!w-auto [&>button]:!min-w-[160px] [&>button]:dark:!bg-[#1C2536] [&>button]:dark:!border-slate-700/80"
                />

                {/* Reset button if active filters */}
                {(selectedProjectId || selectedSiteId || statusFilter !== "ALL" || dsrFromDate || dsrToDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectId("");
                      setSelectedSiteId("");
                      setStatusFilter("ALL");
                      setDsrFromDate("");
                      setDsrToDate("");
                    }}
                    className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline underline-offset-2 ml-1"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Refresh button */}
              <button
                type="button"
                onClick={fetchReports}
                className="btn btn-outline btn-sm inline-flex items-center gap-1.5 shrink-0 ml-auto"
                title="Refresh reports"
                disabled={isListingReports}
              >
                <IconRefresh
                  size={14}
                  className={isListingReports ? "animate-spin" : ""}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Site Reports Table */}
          <DataTable
            columns={dsrColumns}
            data={displayedReports}
            actions={dsrActions}
            loading={isListingReports}
            empty={{
              icon: IconFileSpreadsheet,
              title: "No Daily Reports Found",
              description: "No site reports match the selected filters or date range.",
            }}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: Office Attendance                                  */}
      {/* ========================================================= */}
      {activeTab === "muster-roll" && (
        <div className="space-y-4">
          {/* Streamlined Filter Toolbar */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] p-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                {/* View Mode Switcher */}
                <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800/60 shrink-0">
                  <button
                    type="button"
                    onClick={() => setAttendanceViewMode("date-wise")}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                      attendanceViewMode === "date-wise"
                        ? "bg-white text-slate-800 shadow-xs dark:bg-[#1C2536] dark:text-white"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    Date-wise Logs
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceViewMode("weekly-summary")}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                      attendanceViewMode === "weekly-summary"
                        ? "bg-white text-slate-800 shadow-xs dark:bg-[#1C2536] dark:text-white"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                  >
                    Weekly Goal (48h)
                  </button>
                </div>

                {/* Date Range Picker */}
                <DateRangePicker
                  key={`muster_${musterFromDate || ""}_${musterToDate || ""}`}
                  value={
                    musterFromDate && musterToDate
                      ? { startDate: musterFromDate, endDate: musterToDate }
                      : null
                  }
                  onChange={(range) => {
                    setMusterFromDate(range?.startDate || "");
                    setMusterToDate(range?.endDate || "");
                  }}
                  placeholder="Date or range"
                  defaultRange={null}
                  className="shrink-0 [&>button]:!py-1.5 [&>button]:!px-2.5 [&>button]:!text-xs [&>button]:!w-auto [&>button]:!min-w-[160px] [&>button]:dark:!bg-[#1C2536] [&>button]:dark:!border-slate-700/80"
                />

                {/* Period Presets */}
                <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800/60 shrink-0">
                  {PERIOD_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => {
                        setMusterFromDate("");
                        setMusterToDate("");
                        setPeriod(p.value);
                      }}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                        !musterFromDate && !musterToDate && period === p.value
                          ? "bg-white text-slate-800 shadow-sm dark:bg-[#1C2536] dark:text-white"
                          : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Department scope */}
                <select
                  value={selectedDepartmentId}
                  onChange={(e) => setSelectedDepartmentId(e.target.value)}
                  style={{ width: "auto" }}
                  className="form-select form-sm w-auto min-w-[150px] max-w-[190px] shrink-0"
                >
                  <option value="">All Departments</option>
                  {departmentsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                {/* Head Office scope (if multiple) */}
                {headOfficesList.length > 1 && (
                  <select
                    value={selectedHeadOfficeId}
                    onChange={(e) => setSelectedHeadOfficeId(e.target.value)}
                    style={{ width: "auto" }}
                    className="form-select form-sm w-auto min-w-[140px] max-w-[180px] shrink-0"
                  >
                    <option value="">All Offices</option>
                    {headOfficesList.map((ho) => (
                      <option key={ho.id} value={ho.id}>
                        {ho.name}
                      </option>
                    ))}
                  </select>
                )}

                {/* Worker Search Bar */}
                <div className="relative w-44 sm:w-56 shrink-0">
                  <IconSearch
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    placeholder="Search employee..."
                    value={workerSearchTerm}
                    onChange={(e) => setWorkerSearchTerm(e.target.value)}
                    className="form-input form-sm pl-8 text-xs w-full"
                  />
                </div>

                {/* Reset button if active filters */}
                {(selectedDepartmentId || selectedHeadOfficeId || workerSearchTerm || musterFromDate || musterToDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDepartmentId("");
                      setSelectedHeadOfficeId("");
                      setWorkerSearchTerm("");
                      setMusterFromDate("");
                      setMusterToDate("");
                      setPeriod("WEEKLY");
                    }}
                    className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline underline-offset-2 ml-1"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Refresh button */}
              <button
                type="button"
                onClick={fetchMusterRollData}
                className="btn btn-outline btn-sm inline-flex items-center gap-1.5 shrink-0 ml-auto"
                title="Refresh attendance"
                disabled={isFetchingMusterRoll}
              >
                <IconRefresh
                  size={14}
                  className={isFetchingMusterRoll ? "animate-spin" : ""}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Compact Department Rollup Strip */}
          {departmentSummaries.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 px-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
                Present today:
              </span>
              {departmentSummaries.map((dept) => (
                <span
                  key={dept.departmentId}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] px-2.5 py-1 text-xs shadow-2xs"
                >
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {dept.departmentName}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {dept.presentCount}/{dept.totalEmployees}
                  </span>
                </span>
              ))}
            </div>
          )}

          {/* Office Attendance Table: Date-wise Logs vs Weekly Goal Rollup */}
          {attendanceViewMode === "date-wise" ? (
            <DataTable
              columns={dateWiseColumns}
              data={filteredSessions}
              loading={isFetchingMusterRoll}
              empty={{
                icon: IconUsers,
                title: "No Attendance Records",
                description:
                  "No clock-in/out records found for the selected date, department, or search query.",
              }}
            />
          ) : (
            <DataTable
              columns={musterColumns}
              data={filteredWorkers}
              loading={isFetchingMusterRoll}
              empty={{
                icon: IconUsers,
                title: "No Weekly Summary Data",
                description:
                  "No employee weekly goal summaries match the selected filters.",
              }}
            />
          )}
        </div>
      )}

      {/* Modals */}
      <LockReportModal
        isOpen={Boolean(lockCandidate)}
        onClose={() => setLockCandidate(null)}
        report={lockCandidate}
        onSuccess={fetchReports}
      />

      <RecalculateReportModal
        isOpen={isRecalcModalOpen}
        onClose={() => setIsRecalcModalOpen(false)}
        onSuccess={() => {
          fetchReports();
          fetchMusterRollData();
        }}
      />
    </div>
  );
}
