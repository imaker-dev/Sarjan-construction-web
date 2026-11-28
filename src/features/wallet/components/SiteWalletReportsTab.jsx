import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconRefresh } from "@tabler/icons-react";
import StatusBadge from "@components/ui/StatusBadge";
import { getSiteWalletReports } from "@store/slices/wallet.slice";
import {
  formatInr,
  LEDGER_TYPE_LABELS,
  WALLET_STATUS_TONES,
} from "@utils/wallet.utils";

export default function SiteWalletReportsTab({ siteId }) {
  const dispatch = useDispatch();
  const { siteReports, isLoadingSiteReports } = useSelector(
    (state) => state.wallet
  );

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchReport = () => {
    if (!siteId) return;
    dispatch(
      getSiteWalletReports({
        siteId,
        params: {
          ...(fromDate ? { from: fromDate } : {}),
          ...(toDate ? { to: toDate } : {}),
        },
      })
    );
  };

  useEffect(() => {
    fetchReport();
  }, [siteId, fromDate, toDate]);

  const byType = Array.isArray(siteReports?.byType) ? siteReports.byType : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="form-input form-sm w-auto"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="form-input form-sm w-auto"
          />
        </div>
        <button
          type="button"
          onClick={fetchReport}
          disabled={isLoadingSiteReports}
          className="btn btn-outline btn-xs inline-flex items-center gap-1"
        >
          <IconRefresh
            size={14}
            className={isLoadingSiteReports ? "animate-spin" : ""}
          />
          <span>Refresh</span>
        </button>
      </div>

      {isLoadingSiteReports ? (
        <div className="py-10 text-center text-sm text-slate-400">
          Loading wallet report...
        </div>
      ) : !siteReports ? (
        <div className="py-10 text-center text-sm text-slate-400">
          No report data available.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 p-4">
              <span className="text-xs text-slate-400 block">
                Current Wallet Balance
              </span>
              <span className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums block">
                {formatInr(siteReports.balance)}
              </span>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 p-4">
              <span className="text-xs text-slate-400 block">
                Posted Expenses
              </span>
              <span className="mt-1 text-lg font-bold text-slate-800 dark:text-white tabular-nums block">
                {siteReports.postedExpenses ?? 0}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 text-left">Transaction Type</th>
                  <th className="px-4 py-2.5 text-right">Count</th>
                  <th className="px-4 py-2.5 text-right">Total (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {byType.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-slate-400"
                    >
                      No ledger entries in selected period.
                    </td>
                  </tr>
                ) : (
                  byType.map((row) => (
                    <tr key={row.type}>
                      <td className="px-4 py-2.5">
                        <StatusBadge
                          label={LEDGER_TYPE_LABELS[row.type] || row.type}
                          tone={WALLET_STATUS_TONES[row.type] || "slate"}
                          size="xs"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                        {row.count}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-bold text-slate-800 dark:text-white">
                        {formatInr(row.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
