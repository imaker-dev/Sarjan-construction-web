import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconEye, IconRefresh, IconReportAnalytics } from "@tabler/icons-react";
import DataTable from "@components/ui/DataTable";
import ModalBasic from "@components/ui/ModalBasic";
import StatusBadge from "@components/ui/StatusBadge";
import {
  getFinanceWalletDetailReport,
  getFinanceWalletsReports,
} from "@store/slices/wallet.slice";
import { extractList } from "@utils/api.utils";
import { formatInr, WALLET_STATUS_TONES } from "@utils/wallet.utils";

export default function FinanceReportsTab({ sitesList = [] }) {
  const dispatch = useDispatch();
  const {
    financeWalletsReports,
    financeWalletDetailReport,
    isLoadingFinanceReports,
  } = useSelector((state) => state.wallet);

  const [siteId, setSiteId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [detailWallet, setDetailWallet] = useState(null);

  const fetchReports = useCallback(() => {
    dispatch(
      getFinanceWalletsReports({
        limit: 50,
        ...(siteId ? { siteId } : {}),
        ...(fromDate ? { from: fromDate } : {}),
        ...(toDate ? { to: toDate } : {}),
      })
    );
  }, [dispatch, siteId, fromDate, toDate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const rows = useMemo(
    () => extractList(financeWalletsReports),
    [financeWalletsReports]
  );

  const columns = useMemo(
    () => [
      {
        key: "site",
        header: "Site",
        render: (r) => (
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-white">
              {r.site?.name || r.siteName || r.siteId}
            </p>
            {r.site?.code && (
              <p className="text-[11px] font-mono text-slate-400">{r.site.code}</p>
            )}
          </div>
        ),
      },
      {
        key: "balance",
        header: "Balance",
        render: (r) => (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatInr(r.balance)}
          </span>
        ),
      },
      {
        key: "funded",
        header: "Funded / Spent",
        render: (r) => (
          <div className="text-xs tabular-nums">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              +{formatInr(r.totalFunded ?? r.totalCredited ?? 0)}
            </span>
            <span className="text-slate-400 mx-1">/</span>
            <span className="text-rose-500 dark:text-rose-400 font-semibold">
              -{formatInr(r.totalSpent ?? r.totalDebited ?? 0)}
            </span>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (r) => (
          <StatusBadge
            label={r.status || "ACTIVE"}
            tone={WALLET_STATUS_TONES[r.status] || "emerald"}
            size="xs"
          />
        ),
      },
    ],
    []
  );

  const breakdown = Array.isArray(financeWalletDetailReport?.accountHeadBreakdown)
    ? financeWalletDetailReport.accountHeadBreakdown
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            className="form-select form-sm w-auto min-w-[180px]"
          >
            <option value="">All Sites</option>
            {sitesList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code ? `${s.name} (${s.code})` : s.name}
              </option>
            ))}
          </select>
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
          onClick={fetchReports}
          disabled={isLoadingFinanceReports}
          className="btn btn-outline btn-xs inline-flex items-center gap-1"
        >
          <IconRefresh
            size={14}
            className={isLoadingFinanceReports ? "animate-spin" : ""}
          />
          <span>Refresh</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        loading={isLoadingFinanceReports}
        actions={[
          {
            label: "Account Head Breakdown",
            icon: IconEye,
            onClick: async (r) => {
              const walletId = r.walletId || r.id;
              setDetailWallet(r);
              await dispatch(
                getFinanceWalletDetailReport({
                  walletId,
                  params: {
                    ...(fromDate ? { from: fromDate } : {}),
                    ...(toDate ? { to: toDate } : {}),
                  },
                })
              );
            },
          },
        ]}
        empty={{
          icon: IconReportAnalytics,
          title: "No Wallet Reports",
          description: "No site wallet activity found for the selected filters.",
        }}
      />

      <ModalBasic
        id="finance-wallet-breakdown-modal"
        isOpen={Boolean(detailWallet)}
        onClose={() => setDetailWallet(null)}
        title={`Account Head Breakdown — ${detailWallet?.site?.name || detailWallet?.siteName || "Site"}`}
        size="lg"
      >
        <div className="p-6 space-y-4">
          {breakdown.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No account head expenses recorded in this period.
            </p>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Code</th>
                    <th className="px-4 py-2 text-left">Account Head</th>
                    <th className="px-4 py-2 text-right">Total (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {breakdown.map((b, idx) => (
                    <tr key={b.accountHeadId || idx}>
                      <td className="px-4 py-2 font-mono">{b.accountCode || b.code || "—"}</td>
                      <td className="px-4 py-2 font-medium">{b.accountHeadName || b.name || "—"}</td>
                      <td className="px-4 py-2 text-right font-bold tabular-nums">
                        {formatInr(b.total || b.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ModalBasic>
    </div>
  );
}
