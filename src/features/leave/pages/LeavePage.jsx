import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IconCalendarEvent,
  IconPlus,
  IconCheck,
  IconX,
  IconRotateClockwise,
  IconSend,
  IconShieldCheck,
  IconTag,
  IconCoins,
  IconEye,
} from "@tabler/icons-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import StatCard from "@components/ui/StatCard";
import DataTable from "@components/ui/DataTable";
import ModalBasic from "@components/ui/ModalBasic";
import StatusBadge, { getStatusTone } from "@components/ui/StatusBadge";
import RefreshButton from "@components/ui/RefreshButton";
import { SelectField } from "@components/fields/SelectField";
import ApplyLeaveModal, { LEAVE_TYPE_OPTIONS } from "../components/ApplyLeaveModal";
import LeaveReviewModal from "../components/LeaveReviewModal";
import LeaveAllocationsModal from "../components/LeaveAllocationsModal";
import LeaveTypesPanel from "../components/LeaveTypesPanel";
import LeavePoliciesPanel from "../components/LeavePoliciesPanel";
import { useAccess } from "@hooks/useAccess";
import {
  getLeaveBalance,
  listLeaveBalances,
  listLeaveRequests,
  getLeaveRequestById,
} from "@store/slices/leave.slice";
import { listSites } from "@store/slices/site.slice";
import { extractList } from "@utils/api.utils";
import { formatDate } from "@utils/date.utils";
import { PERMISSIONS } from "@constants/permissions";

const STATUS_FILTER_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Returned", value: "RETURNED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const TYPE_FILTER_OPTIONS = [
  { label: "All Types", value: "" },
  ...LEAVE_TYPE_OPTIONS,
];

const ROLE_TIER = {
  COMPANY_OWNER: 4,
  PLATFORM_ADMIN: 4,
  HO_ADMIN: 4,
  FINANCE_MANAGER: 3,
  PROJECT_DIRECTOR: 2,
  PROJECT_INCHARGE: 2,
  PROJECT_MANAGER: 2,
  SITE_ENGINEER: 1,
  DEPT_HEAD: 1,
  EMPLOYEE: 0,
};

export default function LeavePage() {
  const dispatch = useDispatch();
  const { can, user } = useAccess();
  const employeeId = user?.employee?.id;
  const isCompanyAdmin = Boolean(user?.isCompanyScoped);

  const {
    balance,
    balances,
    isLoadingBalances,
    requests,
    isLoadingRequests,
    currentLeaveRequest,
    isLoadingRequestDetails,
  } = useSelector((state) => state.leave);
  const { sitesData } = useSelector((state) => state.site);

  const [activeTab, setActiveTab] = useState("requests");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [resubmitTarget, setResubmitTarget] = useState(null);
  const [reviewState, setReviewState] = useState(null); // { request, mode }
  const [detailRequestId, setDetailRequestId] = useState(null);
  const [isAllocOpen, setIsAllocOpen] = useState(false);

  const canApply = can({ permissions: [PERMISSIONS.LEAVE.APPLY] });
  const canApprove = can({ permissions: [PERMISSIONS.LEAVE.APPROVE] });
  const canManage = can({ permissions: [PERMISSIONS.LEAVE.MANAGE] });

  useEffect(() => {
    if (canApprove && !sitesData) {
      dispatch(listSites());
    }
  }, [canApprove, sitesData, dispatch]);

  const loadLeave = useCallback(() => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (typeFilter) params.leaveType = typeFilter;
    if (siteFilter) params.siteId = siteFilter;
    dispatch(listLeaveRequests(params));

    if (employeeId) {
      dispatch(
        getLeaveBalance({
          employeeId,
          params: { leaveType: typeFilter || "CASUAL", year: new Date().getFullYear() },
        })
      );
    }
  }, [dispatch, employeeId, statusFilter, typeFilter, siteFilter]);

  const loadBalances = useCallback(() => {
    const params = { year: new Date().getFullYear() };
    if (typeFilter) params.leaveType = typeFilter;
    if (siteFilter) params.siteId = siteFilter;
    dispatch(listLeaveBalances(params));
  }, [dispatch, typeFilter, siteFilter]);

  useEffect(() => {
    if (activeTab === "balances") {
      loadBalances();
    }
  }, [activeTab, loadBalances]);

  useEffect(() => {
    loadLeave();
  }, [loadLeave]);

  const siteOptions = useMemo(
    () => [
      { label: "All Accessible Scopes", value: "" },
      ...extractList(sitesData).map((s) => ({
        label: s.code ? `${s.name} (${s.code})` : s.name,
        value: s.id,
      })),
    ],
    [sitesData]
  );

  const allocated = Number(balance?.allocatedDays ?? balance?.allocated ?? 0);
  const carried = Number(balance?.carriedOverDays ?? 0);
  const used = Number(balance?.usedDays ?? balance?.used ?? 0);
  const pending = Number(balance?.pendingDays ?? 0);
  const available = allocated + carried - used - pending;

  const columns = useMemo(
    () => [
      {
        key: "employee",
        header: "Employee",
        render: (r) => (
          <div>
            <span className="font-semibold text-xs block text-slate-800 dark:text-slate-100">
              {r.employee?.displayName || "Self"}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {r.leaveType || "CASUAL"}
              {r.isHalfDay ? " • Half-day" : ""}
            </span>
          </div>
        ),
      },
      {
        key: "dates",
        header: "Dates",
        render: (r) => (
          <div className="text-xs tabular-nums">
            <span>
              {formatDate(r.startDate || r.fromDate)} → {formatDate(r.endDate || r.toDate)}
            </span>
            {r.totalDays != null && (
              <span className="block text-[11px] text-slate-400">{r.totalDays} day(s)</span>
            )}
          </div>
        ),
      },
      {
        key: "reason",
        header: "Reason & Remarks",
        render: (r) => (
          <div className="text-xs max-w-xs">
            <span className="text-slate-600 dark:text-slate-300 block truncate">
              {r.reason || "—"}
            </span>
            {r.reviewRemarks && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 block truncate">
                Note: {r.reviewRemarks}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (r) => (
          <StatusBadge
            label={r.status || "PENDING"}
            tone={getStatusTone(r.status || "PENDING")}
            size="xs"
          />
        ),
      },
    ],
    []
  );

  const actorTier = useMemo(() => {
    const keys = [
      ...(user?.roles || []),
      ...(user?.assignments || []).map((a) => a.roleKey).filter(Boolean),
    ];
    return keys.reduce((max, k) => Math.max(max, ROLE_TIER[k] ?? 0), 0);
  }, [user]);

  const canReviewRow = useCallback(
    (r) => {
      if (!canApprove || r.status !== "PENDING") return false;
      if (employeeId && r.employeeId === employeeId) return false;

      const targetRole =
        r.employee?.roleKey || r.employee?.roles?.[0] || r.requesterRole;
      if (targetRole) {
        const targetTier = ROLE_TIER[targetRole] ?? 0;
        if (actorTier < 4 && targetTier >= actorTier) return false;
      }

      const actorDeptId = user?.employee?.departmentId || user?.departments?.[0]?.id;
      const targetDeptId = r.employee?.departmentId || r.departmentId;
      if (actorTier < 4 && actorDeptId && targetDeptId && actorDeptId === targetDeptId) {
        return false;
      }
      return true;
    },
    [canApprove, employeeId, actorTier, user]
  );

  const actions = useMemo(
    () => [
      {
        label: "View Details",
        icon: IconEye,
        onClick: (r) => {
          setDetailRequestId(r.id);
          dispatch(getLeaveRequestById(r.id));
        },
      },
      {
        label: "Approve",
        icon: IconCheck,
        hidden: (r) => !canReviewRow(r),
        onClick: (r) => setReviewState({ request: r, mode: "APPROVE" }),
      },
      {
        label: "Reject",
        icon: IconX,
        hidden: (r) => !canReviewRow(r),
        onClick: (r) => setReviewState({ request: r, mode: "REJECT" }),
      },
      {
        label: "Return for Changes",
        icon: IconRotateClockwise,
        hidden: (r) => !canReviewRow(r),
        onClick: (r) => setReviewState({ request: r, mode: "RETURN" }),
      },
      {
        label: "Resubmit",
        icon: IconSend,
        hidden: (r) => !canApply || r.status !== "RETURNED" || (employeeId && r.employeeId !== employeeId),
        onClick: (r) => setResubmitTarget(r),
      },
      {
        label: "Cancel Request",
        icon: IconX,
        hidden: (r) =>
          !["PENDING", "RETURNED", "APPROVED"].includes(r.status) ||
          (!canManage && (!canApply || (employeeId && r.employeeId !== employeeId))),
        onClick: (r) => setReviewState({ request: r, mode: "CANCEL" }),
      },
    ],
    [canReviewRow, canApply, canManage, employeeId, dispatch]
  );

  const balanceColumns = useMemo(
    () => [
      {
        key: "employee",
        header: "Employee",
        render: (b) => (
          <div>
            <span className="font-semibold text-xs block text-slate-800 dark:text-slate-100">
              {b.employee?.displayName || "Self"}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {b.employee?.employeeCode || "—"}
            </span>
          </div>
        ),
      },
      {
        key: "leaveType",
        header: "Leave Type",
        render: (b) => <StatusBadge label={b.leaveType || "CASUAL"} tone="indigo" size="xs" />,
      },
      {
        key: "allocatedDays",
        header: "Allocated (+Carry)",
        render: (b) => (
          <span className="text-xs tabular-nums">
            {Number(b.allocatedDays ?? 0)}
            {Number(b.carriedOverDays ?? 0) ? ` (+${Number(b.carriedOverDays)})` : ""}
          </span>
        ),
      },
      {
        key: "usedDays",
        header: "Used / Pending",
        render: (b) => (
          <span className="text-xs tabular-nums">
            {Number(b.usedDays ?? 0)} / {Number(b.pendingDays ?? 0)}
          </span>
        ),
      },
      {
        key: "available",
        header: "Available",
        render: (b) => {
          const avail =
            Number(b.allocatedDays ?? 0) +
            Number(b.carriedOverDays ?? 0) -
            Number(b.usedDays ?? 0) -
            Number(b.pendingDays ?? 0);
          return (
            <strong
              className={`text-xs tabular-nums ${
                avail > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
              }`}
            >
              {avail}
            </strong>
          );
        },
      },
    ],
    []
  );

  const tabs = [
    { key: "requests", label: "Requests & Balances", icon: IconCalendarEvent },
    { key: "balances", label: "All Balances", icon: IconCoins },
    ...(canManage ? [{ key: "policies", label: "Leave Policies", icon: IconShieldCheck }] : []),
    ...(canManage && isCompanyAdmin ? [{ key: "types", label: "Leave Types", icon: IconTag }] : []),
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeaderBanner
        title="Leave Management"
        description="Check balances, submit or review leave requests, and configure effective-dated leave policies."
      />

      {tabs.length > 1 && (
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
      )}

      {activeTab === "requests" && (
        <div className="space-y-5">
          {balance && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                color="blue"
                icon={IconCalendarEvent}
                label={`${typeFilter || "CASUAL"} Available`}
                value={available}
              />
              <StatCard
                color="emerald"
                icon={IconCheck}
                label="Allocated (+ Carry Over)"
                value={carried ? `${allocated} (+${carried})` : allocated}
              />
              <StatCard
                color="amber"
                icon={IconCalendarEvent}
                label="Used / Pending"
                value={`${used} / ${pending}`}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-36">
                <SelectField
                  id="leaveStatusFilter"
                  name="statusFilter"
                  options={STATUS_FILTER_OPTIONS}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>
              <div className="w-44">
                <SelectField
                  id="leaveTypeFilter"
                  name="typeFilter"
                  options={TYPE_FILTER_OPTIONS}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                />
              </div>
              {canApprove && (
                <div className="w-48">
                  <SelectField
                    id="leaveSiteFilter"
                    name="siteFilter"
                    options={siteOptions}
                    value={siteFilter}
                    onChange={(e) => setSiteFilter(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {canManage && isCompanyAdmin && (
                <button
                  type="button"
                  onClick={() => setIsAllocOpen(true)}
                  className="btn btn-outline btn-sm h-10 inline-flex items-center gap-1.5"
                >
                  <IconCoins size={15} />
                  <span>Allocate Balance</span>
                </button>
              )}
              {canApply && (
                <button
                  type="button"
                  onClick={() => setIsApplyOpen(true)}
                  className="btn btn-primary btn-sm h-10 inline-flex items-center gap-1.5"
                >
                  <IconPlus size={15} />
                  <span>Apply Leave</span>
                </button>
              )}
              <RefreshButton
                onClick={loadLeave}
                loading={isLoadingRequests}
                className="h-10 w-10 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700/60"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={requests}
            actions={actions}
            loading={isLoadingRequests}
            empty={{
              icon: IconCalendarEvent,
              title: "No Leave Requests",
              description: "No leave requests found for the selected filters.",
            }}
          />
        </div>
      )}

      {activeTab === "balances" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-44">
                <SelectField
                  id="balTypeFilter"
                  name="typeFilter"
                  options={TYPE_FILTER_OPTIONS}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                />
              </div>
              {canApprove && (
                <div className="w-48">
                  <SelectField
                    id="balSiteFilter"
                    name="siteFilter"
                    options={siteOptions}
                    value={siteFilter}
                    onChange={(e) => setSiteFilter(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {canManage && isCompanyAdmin && (
                <button
                  type="button"
                  onClick={() => setIsAllocOpen(true)}
                  className="btn btn-primary btn-sm h-10 inline-flex items-center gap-1.5"
                >
                  <IconCoins size={15} />
                  <span>Allocate Balance</span>
                </button>
              )}
              <RefreshButton
                onClick={loadBalances}
                loading={isLoadingBalances}
                className="h-10 w-10 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700/60"
              />
            </div>
          </div>

          <DataTable
            columns={balanceColumns}
            data={balances}
            loading={isLoadingBalances}
            empty={{
              icon: IconCoins,
              title: "No Leave Balances",
              description: "No leave balance allocations found for the selected filters.",
            }}
          />
        </div>
      )}

      {activeTab === "policies" && canManage && <LeavePoliciesPanel />}

      {activeTab === "types" && canManage && isCompanyAdmin && <LeaveTypesPanel />}

      <ModalBasic
        isOpen={Boolean(detailRequestId)}
        onClose={() => setDetailRequestId(null)}
        title="Leave Request Details"
        size="md"
      >
        <div className="p-6 text-xs space-y-4">
          {isLoadingRequestDetails ? (
            <p className="text-center text-slate-400 py-6">Loading details...</p>
          ) : currentLeaveRequest ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <strong className="text-sm text-slate-800 dark:text-white block">
                    {currentLeaveRequest.employee?.displayName || "Employee"}
                  </strong>
                  <span className="font-mono text-slate-400">
                    {currentLeaveRequest.leaveType}
                    {currentLeaveRequest.isHalfDay ? ` • ${currentLeaveRequest.halfDayPortion || "Half-day"}` : ""}
                  </span>
                </div>
                <StatusBadge
                  label={currentLeaveRequest.status || "PENDING"}
                  tone={getStatusTone(currentLeaveRequest.status || "PENDING")}
                  size="sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 p-3 tabular-nums">
                <div>
                  <span className="text-slate-400 block">Period</span>
                  <strong>
                    {formatDate(currentLeaveRequest.startDate)} → {formatDate(currentLeaveRequest.endDate)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Days</span>
                  <strong>{currentLeaveRequest.totalDays ?? "—"}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Reason</span>
                  <strong>{currentLeaveRequest.reason || "—"}</strong>
                </div>
                {currentLeaveRequest.reviewRemarks && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Reviewer Remarks</span>
                    <strong className="text-amber-600 dark:text-amber-400">
                      {currentLeaveRequest.reviewRemarks}
                    </strong>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </ModalBasic>

      <ApplyLeaveModal
        isOpen={isApplyOpen || Boolean(resubmitTarget)}
        resubmitTarget={resubmitTarget}
        onClose={() => {
          setIsApplyOpen(false);
          setResubmitTarget(null);
        }}
        onSuccess={loadLeave}
      />

      <LeaveReviewModal
        isOpen={Boolean(reviewState)}
        onClose={() => setReviewState(null)}
        request={reviewState?.request}
        mode={reviewState?.mode}
        onSuccess={loadLeave}
      />

      {canManage && isCompanyAdmin && (
        <LeaveAllocationsModal
          isOpen={isAllocOpen}
          onClose={() => setIsAllocOpen(false)}
          onSuccess={loadLeave}
        />
      )}
    </div>
  );
}
