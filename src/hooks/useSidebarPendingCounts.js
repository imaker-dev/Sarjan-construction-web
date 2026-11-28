import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PERMISSIONS } from "@constants/permissions";
import useAccess from "@hooks/useAccess";
import {
  listFinanceFundingRequests,
  listFinanceReversalRequests,
} from "@store/slices/wallet.slice";
import { listLeaveRequests } from "@store/slices/leave.slice";
import { listDailyReports } from "@store/slices/dailyReport.slice";

const toList = (v) =>
  Array.isArray(v) ? v : Array.isArray(v?.items) ? v.items : [];

/**
 * Fetches lightweight pending lists for Finance Wallets, Site Wallet, Leave,
 * and Daily Reports on mount and keeps them in sync with `sarjan:realtime-notification`
 * WebSocket events so Sidebar badges stay live across the app.
 */
export function useSidebarPendingCounts() {
  const dispatch = useDispatch();
  const { can } = useAccess();

  const canFinanceWallet = can({ permissions: [PERMISSIONS.WALLET.FINANCE_READ] });
  const canLeave = can({
    permissions: [PERMISSIONS.LEAVE.READ, PERMISSIONS.LEAVE.APPLY],
  });
  const canDailyReports = can({ permissions: [PERMISSIONS.ATTENDANCE.READ] });

  const financeFundingRequests = useSelector(
    (state) => state.wallet?.financeFundingRequests,
  );
  const financeReversalRequests = useSelector(
    (state) => state.wallet?.financeReversalRequests,
  );
  const siteFundingRequests = useSelector(
    (state) => state.wallet?.siteFundingRequests,
  );
  const leaveRequests = useSelector((state) => state.leave?.requests);
  const dailyReports = useSelector((state) => state.dailyReport?.reports);

  useEffect(() => {
    if (canFinanceWallet && toList(financeFundingRequests).length === 0) {
      dispatch(listFinanceFundingRequests({ limit: 50 }));
      dispatch(listFinanceReversalRequests({ limit: 50 }));
    }
    if (canLeave && toList(leaveRequests).length === 0) {
      dispatch(listLeaveRequests({ limit: 50 }));
    }
    if (canDailyReports && toList(dailyReports).length === 0) {
      dispatch(listDailyReports({ limit: 50 }));
    }

    const onRealtime = (e) => {
      const et = String(e?.detail?.eventType || "");
      if (
        canFinanceWallet &&
        (et.startsWith("SITE_WALLET_") || et.startsWith("WALLET_"))
      ) {
        dispatch(listFinanceFundingRequests({ limit: 50 }));
        dispatch(listFinanceReversalRequests({ limit: 50 }));
      }
      if (canLeave && et.startsWith("LEAVE_")) {
        dispatch(listLeaveRequests({ limit: 50 }));
      }
      if (
        canDailyReports &&
        (et.startsWith("DAILY_REPORT_") || et.startsWith("DSR_"))
      ) {
        dispatch(listDailyReports({ limit: 50 }));
      }
    };

    window.addEventListener("sarjan:realtime-notification", onRealtime);
    return () =>
      window.removeEventListener("sarjan:realtime-notification", onRealtime);
    // Initial mount fetch + live WS refresh per user permissions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canFinanceWallet, canLeave, canDailyReports, dispatch]);

  return useMemo(() => {
    const financeWalletPending =
      toList(financeFundingRequests).filter((r) =>
        ["SUBMITTED", "APPROVED", "PARTIALLY_FUNDED"].includes(r.status),
      ).length +
      toList(financeReversalRequests).filter((r) => r.status === "REQUESTED")
        .length;

    const siteWalletPending = toList(siteFundingRequests).filter((r) =>
      ["APPROVED", "PARTIALLY_FUNDED", "RETURNED"].includes(r.status),
    ).length;

    const leavePending = toList(leaveRequests).filter((r) =>
      ["PENDING", "RETURNED"].includes(r.status),
    ).length;

    const dailyReportsPending = toList(dailyReports).filter((r) =>
      ["SUBMITTED", "APPROVED"].includes(r.status),
    ).length;

    return {
      financeWalletPending,
      siteWalletPending,
      leavePending,
      dailyReportsPending,
    };
  }, [
    financeFundingRequests,
    financeReversalRequests,
    siteFundingRequests,
    leaveRequests,
    dailyReports,
  ]);
}
