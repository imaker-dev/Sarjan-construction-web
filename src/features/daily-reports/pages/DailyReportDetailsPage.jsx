import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  IconArrowLeft,
  IconAlertTriangle,
  IconClock,
  IconUsers,
  IconFileText,
  IconHistory,
  IconCheck,
  IconCalendarStats,
} from "@tabler/icons-react";
import StatCard from "@components/ui/StatCard";
import LockReportModal from "../components/LockReportModal";
import RecalculateReportModal from "../components/RecalculateReportModal";
import EditLabourSummaryModal from "../components/EditLabourSummaryModal";
import RejectReportModal from "../components/RejectReportModal";
import EditDailyReportHeaderModal from "../components/EditDailyReportHeaderModal";
import RegularizeSessionModal from "../components/RegularizeSessionModal";
import PrintableDailyReport from "../components/PrintableDailyReport";
import DailyReportActionBar from "../components/details/DailyReportActionBar";
import DailyReportHeaderCard from "../components/details/DailyReportHeaderCard";
import DailyReportSignOffSteps from "../components/details/DailyReportSignOffSteps";
import DailyReportWorkforceTab from "../components/details/DailyReportWorkforceTab";
import DailyReportSessionsTab from "../components/details/DailyReportSessionsTab";
import DailyReportNotesTab from "../components/details/DailyReportNotesTab";
import DailyReportAuditTab from "../components/details/DailyReportAuditTab";
import {
  getDailyReportDetails,
  getDailyReportAuditTrail,
  clearCurrentReport,
  submitDailyReport,
  approveDailyReport,
  exportDailySiteReport,
} from "@store/slices/dailyReport.slice";
import { getMusterRoll } from "@store/slices/attendance.slice";
import { ROUTES } from "@constants/routes";

export default function DailyReportDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    currentReport,
    isLoadingDetails,
    auditLogs,
    isLoadingAuditTrail,
    isSubmittingReport,
    isApprovingReport,
    isExportingReport,
  } = useSelector((state) => state.dailyReport);

  const { musterRoll, isFetchingMusterRoll } = useSelector((state) => state.attendance);

  const [activeTab, setActiveTab] = useState("workforce");
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [isRecalcModalOpen, setIsRecalcModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isEditHeaderModalOpen, setIsEditHeaderModalOpen] = useState(false);
  const [editLabourItem, setEditLabourItem] = useState(null);
  const [selectedSessionForRegularize, setSelectedSessionForRegularize] = useState(null);

  const loadData = () => {
    if (id) {
      dispatch(getDailyReportDetails(id));
      dispatch(getDailyReportAuditTrail(id));
    }
  };

  const loadSessions = () => {
    if (currentReport?.siteId && currentReport?.businessDate) {
      dispatch(
        getMusterRoll({
          siteId: currentReport.siteId,
          period: "DAILY",
          date: currentReport.businessDate,
        })
      );
    }
  };

  useEffect(() => {
    loadData();
    return () => {
      dispatch(clearCurrentReport());
    };
  }, [dispatch, id]);

  useEffect(() => {
    loadSessions();
  }, [dispatch, currentReport?.siteId, currentReport?.businessDate]);

  const dailySessions = Array.isArray(musterRoll?.sessions)
    ? musterRoll.sessions
    : Array.isArray(musterRoll?.data?.sessions)
      ? musterRoll.data.sessions
      : [];

  const handleSubmitReport = async () => {
    if (!id) return;
    try {
      await dispatch(submitDailyReport(id)).unwrap();
      loadData();
    } catch {
      // toast handled in slice
    }
  };

  const handleApproveReport = async () => {
    if (!id) return;
    try {
      await dispatch(approveDailyReport(id)).unwrap();
      loadData();
    } catch {
      // toast handled in slice
    }
  };

  if (isLoadingDetails && !currentReport) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!currentReport) {
    return (
      <div className="p-8 text-center space-y-4">
        <IconAlertTriangle size={42} className="mx-auto text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">Daily Report Not Found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          The requested daily site report could not be found or you do not have permission to access it.
        </p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.DAILY_REPORTS.ROOT)}
          className="btn btn-outline btn-sm"
        >
          <IconArrowLeft size={16} />
          Back to Daily Reports
        </button>
      </div>
    );
  }

  const isLocked = currentReport.status === "LOCKED";
  const isApproved = currentReport.status === "APPROVED";
  const labourSummaries = Array.isArray(currentReport.labourSummaries)
    ? currentReport.labourSummaries
    : [];

  const statusColor = isLocked ? "violet" : isApproved ? "primary" : "gray";

  const tabs = [
    { key: "workforce", label: `Workforce Breakdown (${labourSummaries.length})`, icon: IconUsers },
    { key: "sessions", label: `Worker Attendance Logs (${dailySessions.length})`, icon: IconClock },
    { key: "notes", label: "Site Notes & Safety", icon: IconFileText },
    { key: "audit", label: `Audit History (${auditLogs.length})`, icon: IconHistory },
  ];

  return (
    <>
      <div className="space-y-6 pb-12 print:hidden">
        <DailyReportActionBar
          status={currentReport.status}
          isLocked={isLocked}
          isApproved={isApproved}
          isLoadingDetails={isLoadingDetails}
          isSubmittingReport={isSubmittingReport}
          isApprovingReport={isApprovingReport}
          isExportingReport={isExportingReport}
          onBack={() => navigate(ROUTES.DAILY_REPORTS.ROOT)}
          onRefresh={loadData}
          onPrint={() => window.print()}
          onExportPdf={() =>
            dispatch(
              exportDailySiteReport({
                id,
                format: "pdf",
                fileName: `DSR_${currentReport.site?.code || "site"}_${currentReport.businessDate}.pdf`,
              })
            )
          }
          onExportExcel={() =>
            dispatch(
              exportDailySiteReport({
                id,
                format: "xlsx",
                fileName: `DSR_${currentReport.site?.code || "site"}_${currentReport.businessDate}.xlsx`,
              })
            )
          }
          onEditHeader={() => setIsEditHeaderModalOpen(true)}
          onRecalculate={() => setIsRecalcModalOpen(true)}
          onSubmit={handleSubmitReport}
          onReject={() => setIsRejectModalOpen(true)}
          onApprove={handleApproveReport}
          onLock={() => setIsLockModalOpen(true)}
        />

        <DailyReportHeaderCard report={currentReport} isLocked={isLocked} />

        <DailyReportSignOffSteps report={currentReport} isLocked={isLocked} />

        {/* Aggregate Metrics Bar using shared StatCard */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            variant="card"
            color="blue"
            icon={IconUsers}
            label="Total Headcount"
            value={currentReport.totalWorkersHeadcount ?? 0}
          />
          <StatCard
            variant="card"
            color="primary"
            icon={IconCalendarStats}
            label="Days Worked"
            value={currentReport.totalPresentUnits ?? "0.0"}
          />
          <StatCard
            variant="card"
            color="amber"
            icon={IconClock}
            label="Total Overtime"
            value={`${currentReport.totalOvertimeHours ?? "0.0"}h`}
          />
          <StatCard
            variant="card"
            color={statusColor}
            icon={IconCheck}
            label="Report Status"
            value={currentReport.status}
          />
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-border flex items-center gap-4 text-sm font-semibold overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  active
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={17} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === "workforce" && (
          <DailyReportWorkforceTab
            labourSummaries={labourSummaries}
            isLocked={isLocked}
            onAdjustItem={(item) => setEditLabourItem(item)}
          />
        )}

        {activeTab === "sessions" && (
          <DailyReportSessionsTab
            dailySessions={dailySessions}
            businessDate={currentReport.businessDate}
            isFetchingMusterRoll={isFetchingMusterRoll}
            isLocked={isLocked}
            onRefresh={loadSessions}
            onRegularize={(s) => setSelectedSessionForRegularize(s)}
          />
        )}

        {activeTab === "notes" && <DailyReportNotesTab report={currentReport} />}

        {activeTab === "audit" && (
          <DailyReportAuditTab
            auditLogs={auditLogs}
            isLoadingAuditTrail={isLoadingAuditTrail}
            onRefresh={() => dispatch(getDailyReportAuditTrail(id))}
          />
        )}

        {/* Modals */}
        {isLockModalOpen && (
          <LockReportModal
            isOpen={isLockModalOpen}
            onClose={() => setIsLockModalOpen(false)}
            report={currentReport}
            onSuccess={loadData}
          />
        )}

        {isRecalcModalOpen && (
          <RecalculateReportModal
            isOpen={isRecalcModalOpen}
            onClose={() => setIsRecalcModalOpen(false)}
            defaultSiteId={currentReport.siteId}
            defaultDate={currentReport.businessDate}
            onSuccess={loadData}
          />
        )}

        {editLabourItem && (
          <EditLabourSummaryModal
            isOpen={!!editLabourItem}
            onClose={() => setEditLabourItem(null)}
            reportId={currentReport.id}
            labourSummary={editLabourItem}
            onSuccess={loadData}
          />
        )}

        {isRejectModalOpen && (
          <RejectReportModal
            isOpen={isRejectModalOpen}
            onClose={() => setIsRejectModalOpen(false)}
            report={currentReport}
            onSuccess={loadData}
          />
        )}

        {isEditHeaderModalOpen && (
          <EditDailyReportHeaderModal
            isOpen={isEditHeaderModalOpen}
            onClose={() => setIsEditHeaderModalOpen(false)}
            report={currentReport}
            onSuccess={loadData}
          />
        )}

        {selectedSessionForRegularize && (
          <RegularizeSessionModal
            isOpen={Boolean(selectedSessionForRegularize)}
            onClose={() => setSelectedSessionForRegularize(null)}
            session={selectedSessionForRegularize}
            businessDate={currentReport.businessDate}
            onSuccess={() => {
              loadData();
              loadSessions();
            }}
          />
        )}
      </div>

      <PrintableDailyReport report={currentReport} />
    </>
  );
}
