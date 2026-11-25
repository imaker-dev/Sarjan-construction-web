import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  IconCalculator,
  IconFileSpreadsheet,
  IconClipboardList,
} from "@tabler/icons-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import LockReportModal from "../components/LockReportModal";
import RecalculateReportModal from "../components/RecalculateReportModal";
import SiteReportsTab from "../components/SiteReportsTab";
import OfficeAttendanceTab from "../components/OfficeAttendanceTab";
import {
  listDailyReports,
  exportDailySiteReport,
  exportMusterRollReport,
} from "@store/slices/dailyReport.slice";
import { getMusterRoll } from "@store/slices/attendance.slice";
import { listProjects } from "@store/slices/project.slice";
import { listSites } from "@store/slices/site.slice";
import { getAllHeadOffices } from "@store/slices/head-office.slice";
import { listDepartments } from "@store/slices/department.slice";
import { ROUTES } from "@constants/routes";

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
  const { reports, isListingReports, isExportingReport } = useSelector(
    (state) => state.dailyReport
  );
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

  // Office Attendance Filters State: Strictly "today" or "custom"
  const [attendanceDateFilter, setAttendanceDateFilter] = useState("today"); // "today" | "custom"
  const [musterFromDate, setMusterFromDate] = useState("");
  const [musterToDate, setMusterToDate] = useState("");
  const [selectedHeadOfficeId, setSelectedHeadOfficeId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedMusterSiteId, setSelectedMusterSiteId] = useState("");

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

  // Fetch Office Attendance Data (Today vs Custom Date)
  const fetchMusterRollData = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const params = {};

    if (attendanceDateFilter === "today") {
      params.period = "DAILY";
      params.date = todayStr;
    } else {
      params.period = "CUSTOM";
      if (musterFromDate) params.from = musterFromDate;
      if (musterToDate) params.to = musterToDate;
      if (!musterFromDate && !musterToDate) {
        params.from = todayStr;
        params.to = todayStr;
      }
    }

    if (selectedHeadOfficeId) params.headOfficeId = selectedHeadOfficeId;
    if (selectedDepartmentId) params.departmentId = selectedDepartmentId;
    if (selectedMusterSiteId) params.siteId = selectedMusterSiteId;

    dispatch(getMusterRoll(params));
  };

  const handleExportOfficeMuster = (format, dateOverride) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const params = { format };

    if (dateOverride) {
      params.period = "DAILY";
      params.date = dateOverride;
      params.fileName = `Office_Attendance_${dateOverride}.${format}`;
    } else if (attendanceDateFilter === "today") {
      params.period = "DAILY";
      params.date = todayStr;
      params.fileName = `Office_Attendance_${todayStr}.${format}`;
    } else {
      params.period = "CUSTOM";
      const from = musterFromDate || todayStr;
      const to = musterToDate || from;
      params.from = from;
      params.to = to;
      params.fileName = `Office_Attendance_${from}_to_${to}.${format}`;
    }

    if (selectedHeadOfficeId) params.headOfficeId = selectedHeadOfficeId;
    if (selectedDepartmentId) params.departmentId = selectedDepartmentId;
    if (selectedMusterSiteId) params.siteId = selectedMusterSiteId;

    dispatch(exportMusterRollReport(params));
  };

  // Re-fetch triggers
  useEffect(() => {
    fetchReports();
  }, [dispatch, selectedSiteId, statusFilter, dsrFromDate, dsrToDate]);

  useEffect(() => {
    fetchMusterRollData();
  }, [
    dispatch,
    attendanceDateFilter,
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

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeaderBanner
        title="Daily Reports"
        description="View site work reports and office staff attendance."
      />

      {/* Tab Switcher: Site Reports vs Office Attendance */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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

      {/* TAB 1: Site Reports */}
      {activeTab === "reports" && (
        <SiteReportsTab
          reports={reports}
          isListingReports={isListingReports}
          fetchReports={fetchReports}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          selectedSiteId={selectedSiteId}
          setSelectedSiteId={setSelectedSiteId}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          fromDate={dsrFromDate}
          setFromDate={setDsrFromDate}
          toDate={dsrToDate}
          setToDate={setDsrToDate}
          projectsList={projectsList}
          filteredSites={filteredSites}
          onViewDetails={(report) =>
            navigate(ROUTES.DAILY_REPORTS.DETAILS.replace(":id", report.id))
          }
          onLockReport={(report) => setLockCandidate(report)}
          onExportReport={(report, format) =>
            dispatch(
              exportDailySiteReport({
                id: report.id,
                format,
                fileName: `DSR_${report.site?.code || "site"}_${report.businessDate}.${format}`,
              })
            )
          }
        />
      )}

      {/* TAB 2: Office Attendance */}
      {activeTab === "muster-roll" && (
        <OfficeAttendanceTab
          musterRoll={musterRoll}
          isFetchingMusterRoll={isFetchingMusterRoll}
          fetchMusterRollData={fetchMusterRollData}
          dateFilter={attendanceDateFilter}
          setDateFilter={setAttendanceDateFilter}
          fromDate={musterFromDate}
          setFromDate={setMusterFromDate}
          toDate={musterToDate}
          setToDate={setMusterToDate}
          selectedDepartmentId={selectedDepartmentId}
          setSelectedDepartmentId={setSelectedDepartmentId}
          selectedHeadOfficeId={selectedHeadOfficeId}
          setSelectedHeadOfficeId={setSelectedHeadOfficeId}
          departmentsList={departmentsList}
          headOfficesList={headOfficesList}
          lockedReportsMap={lockedReportsMap}
          onExportMuster={handleExportOfficeMuster}
          isExportingReport={isExportingReport}
        />
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
        defaultScope={activeTab === "muster-roll" ? "OFFICE" : "SITE"}
        defaultSiteId={selectedSiteId}
        defaultHeadOfficeId={selectedHeadOfficeId}
        onSuccess={() => {
          fetchReports();
          fetchMusterRollData();
        }}
      />
    </div>
  );
}
