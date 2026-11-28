import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  IconFileTypePdf,
  IconFileUpload,
  IconRotateClockwise,
  IconWallet,
} from "@tabler/icons-react";
import DataTable from "@components/ui/DataTable";
import StatusBadge from "@components/ui/StatusBadge";
import walletApi from "@store/api/wallet.api";
import {
  formatDateTimeParts,
  formatInr,
  isCreditEntry,
  isDebitEntry,
  LEDGER_TYPE_LABELS,
  openPdfBlob,
  WALLET_STATUS_TONES,
} from "@utils/wallet.utils";

/**
 * Bank-statement style Credit/Debit ledger table shared by Site Wallet (PI/PD)
 * and Finance Wallet Statement modal.
 */
export default function WalletStatementTable({
  entries = [],
  loading = false,
  mode = "site", // "site" | "finance"
  siteId,
  walletId,
  canManage = false,
  onAttachEvidence,
  onRequestReversal,
}) {
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadPdf = async (entry) => {
    setDownloadingId(entry.id);
    try {
      const transferId = entry.transferId || entry.transfer?.id;
      let voucherId = entry.voucherId || entry.voucher?.id || entry.expense?.voucherId;

      if (transferId) {
        const res =
          mode === "finance"
            ? await walletApi.getFinanceTransferPdfApi(transferId)
            : await walletApi.getSiteTransferPdfApi({ siteId, transferId });
        openPdfBlob(res.data);
        return;
      }

      if (!voucherId && mode === "site" && entry.expenseId && siteId) {
        const expRes = await walletApi.getSiteExpenseApi({
          siteId,
          expenseId: entry.expenseId,
        });
        const exp = expRes?.data?.expense || expRes?.data;
        voucherId = exp?.voucherId || exp?.voucher?.id;
      }

      if (voucherId) {
        const res =
          mode === "finance"
            ? await walletApi.getFinanceVoucherPdfApi({ walletId, voucherId })
            : await walletApi.getSiteVoucherPdfApi({ siteId, voucherId });
        openPdfBlob(res.data);
        return;
      }

      toast.info("No PDF receipt or cash voucher is linked to this entry.");
    } catch {
      toast.error("Failed to download transaction PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "postedAt",
        header: "Date & Time",
        render: (e) => {
          const { date, time } = formatDateTimeParts(e.postedAt || e.createdAt);
          return (
            <div className="leading-tight whitespace-nowrap">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 tabular-nums block">
                {date}
              </span>
              {time && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums block mt-0.5">
                  {time}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "particulars",
        header: "Particulars",
        render: (e) => {
          const desc =
            e.description ||
            e.expense?.description ||
            e.transfer?.reference ||
            e.reversalReason ||
            null;
          const payee = e.expense?.payee || e.payee;
          return (
            <div className="space-y-1 max-w-[260px]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-[10px] text-slate-400">
                  #{e.seq ?? "—"}
                </span>
                <StatusBadge
                  label={LEDGER_TYPE_LABELS[e.type] || e.type}
                  tone={WALLET_STATUS_TONES[e.type] || "slate"}
                  size="xs"
                />
              </div>
              {(desc || payee) && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {[payee, desc].filter(Boolean).join(" — ")}
                </p>
              )}
            </div>
          );
        },
      },
      {
        key: "debit",
        header: "Debit (₹)",
        render: (e) =>
          isDebitEntry(e.type) ? (
            <span className="text-xs font-bold text-rose-500 dark:text-rose-400 tabular-nums whitespace-nowrap">
              -{formatInr(e.amount)}
            </span>
          ) : (
            <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
          ),
      },
      {
        key: "credit",
        header: "Credit (₹)",
        render: (e) =>
          isCreditEntry(e.type) ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums whitespace-nowrap">
              +{formatInr(e.amount)}
            </span>
          ) : (
            <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
          ),
      },
      {
        key: "balanceAfter",
        header: "Balance (₹)",
        render: (e) => (
          <span className="text-xs font-bold text-slate-800 dark:text-white tabular-nums whitespace-nowrap">
            {formatInr(e.balanceAfter)}
          </span>
        ),
      },
      {
        key: "pdf",
        header: "Receipt / PDF",
        render: (e) => {
          const hasDoc = Boolean(
            e.transferId ||
              e.transfer?.id ||
              e.voucherId ||
              e.voucher?.id ||
              e.expenseId
          );
          if (!hasDoc) {
            return (
              <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
            );
          }
          return (
            <button
              type="button"
              disabled={downloadingId === e.id}
              onClick={() => handleDownloadPdf(e)}
              className="btn btn-outline btn-xs inline-flex items-center gap-1"
            >
              <IconFileTypePdf size={13} className="text-rose-500" />
              <span>{downloadingId === e.id ? "..." : "PDF"}</span>
            </button>
          );
        },
      },
    ],
    [downloadingId, mode, siteId, walletId]
  );

  const actions = useMemo(() => {
    if (mode !== "site" || !canManage) return undefined;
    return [
      {
        label: "Attach Evidence",
        icon: IconFileUpload,
        onClick: (entry) => onAttachEvidence?.(entry),
      },
      {
        label: "Request Reversal",
        icon: IconRotateClockwise,
        hidden: (entry) => String(entry.type || "").startsWith("REVERSAL_"),
        onClick: (entry) => onRequestReversal?.(entry),
      },
    ];
  }, [mode, canManage, onAttachEvidence, onRequestReversal]);

  return (
    <DataTable
      columns={columns}
      data={entries}
      actions={actions}
      loading={loading}
      empty={{
        icon: IconWallet,
        title: "No Transactions Yet",
        description:
          "Bank-style credit and debit entries will appear here once funds are confirmed or expenses are posted.",
      }}
    />
  );
}
