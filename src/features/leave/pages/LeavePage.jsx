import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconCalendarEvent, IconPlus, IconCheck, IconX } from "@tabler/icons-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import StatCard from "@components/ui/StatCard";
import DataTable from "@components/ui/DataTable";
import StatusBadge, { getStatusTone } from "@components/ui/StatusBadge";
import RefreshButton from "@components/ui/RefreshButton";
import ApplyLeaveModal from "../components/ApplyLeaveModal";
import { useAccess } from "@hooks/useAccess";
import {
  getLeaveBalance,
  listLeaveRequests,
  cancelLeaveRequest,
  reviewLeaveRequest,
} from "@store/slices/leave.slice";
import { PERMISSIONS } from "@constants/permissions";
import { formatDate } from "@utils/date.utils";

export default function LeavePage() {
  const dispatch = useDispatch();
  const { can, user } = useAccess();
  const employeeId = user?.employee?.id;

  const { balance, requests, isLoadingRequests } = useSelector((state) => state.leave);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const canApply = can({ permissions: [PERMISSIONS.LEAVE.APPLY] });
  const canApprove = can({ permissions: [PERMISSIONS.LEAVE.APPROVE] });

  const loadLeave = useCallback(() => {
    dispatch(listLeaveRequests());
    if (employeeId) {
      dispatch(
        getLeaveBalance({
          employeeId,
          params: { leaveType: "CASUAL", year: new Date().getFullYear() },
        })
      );
    }
  }, [dispatch, employeeId]);

  useEffect(() => {
    loadLeave();
  }, [loadLeave]);

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
            </span>
          </div>
        ),
      },
      {
        key: "dates",
        header: "Dates",
        render: (r) => (
          <span className="text-xs tabular-nums">
            {formatDate(r.fromDate)} → {formatDate(r.toDate)}
          </span>
        ),
      },
      {
        key: "reason",
        header: "Reason",
        render: (r) => <span className="text-xs text-slate-500">{r.reason || "—"}</span>,
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

  const actions = useMemo(
    () => [
      {
        label: "Approve",
        icon: IconCheck,
        hidden: (r) => !canApprove || r.status !== "PENDING",
        onClick: async (r) => {
          try {
            await dispatch(reviewLeaveRequest({ id: r.id, values: { decision: "APPROVED" } })).unwrap();
            loadLeave();
          } catch {
            // handled
          }
        },
      },
      {
        label: "Reject",
        icon: IconX,
        hidden: (r) => !canApprove || r.status !== "PENDING",
        onClick: async (r) => {
          try {
            await dispatch(reviewLeaveRequest({ id: r.id, values: { decision: "REJECTED" } })).unwrap();
            loadLeave();
          } catch {
            // handled
          }
        },
      },
      {
        label: "Cancel Request",
        icon: IconX,
        hidden: (r) => !canApply || r.status !== "PENDING" || (employeeId && r.employeeId !== employeeId),
        onClick: async (r) => {
          try {
            await dispatch(cancelLeaveRequest({ id: r.id })).unwrap();
            loadLeave();
          } catch {
            // handled
          }
        },
      },
    ],
    [canApprove, canApply, employeeId, dispatch, loadLeave]
  );

  return (
    <div className="space-y-6 pb-12">
      <PageHeaderBanner
        title="Leave Management"
        description="Check your leave balance, submit leave requests, and review team requests."
      />

      {balance && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            color="blue"
            icon={IconCalendarEvent}
            label="Casual leave remaining"
            value={balance.remaining ?? balance.balance ?? 0}
          />
          <StatCard
            color="emerald"
            icon={IconCheck}
            label="Allocated"
            value={balance.allocated ?? 0}
          />
          <StatCard
            color="amber"
            icon={IconCalendarEvent}
            label="Used"
            value={balance.used ?? 0}
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        {canApply && (
          <button
            type="button"
            onClick={() => setIsApplyOpen(true)}
            className="btn btn-primary btn-sm h-9 inline-flex items-center gap-1.5"
          >
            <IconPlus size={15} />
            <span>Apply Leave</span>
          </button>
        )}
        <RefreshButton
          onClick={loadLeave}
          loading={isLoadingRequests}
          className="h-9 w-9 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700/60"
        />
      </div>

      <DataTable
        columns={columns}
        data={requests}
        actions={actions}
        loading={isLoadingRequests}
        empty={{
          icon: IconCalendarEvent,
          title: "No Leave Requests",
          description: "No leave requests found.",
        }}
      />

      <ApplyLeaveModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onSuccess={loadLeave}
      />
    </div>
  );
}
