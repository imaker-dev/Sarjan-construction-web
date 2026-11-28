import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  IconArrowsExchange,
  IconCalendar,
  IconCoins,
  IconDownload,
  IconFileText,
  IconFileTypePdf,
  IconFileUpload,
  IconReceipt,
  IconRotateClockwise,
  IconShoppingCart,
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
} from "@utils/wallet.utils";

const matchesPeriod = (dateStr, period) => {
  if (period === "ALL" || !dateStr) return true;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return true;
  const now = new Date();
  if (period === "TODAY") {
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }
  if (period === "WEEK") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return d >= start;
  }
  if (period === "MONTH") {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  return true;
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [periodFilter, setPeriodFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return entries.filter((e) => {
      if (typeFilter === "IN" && !isCreditEntry(e.type)) return false;
      if (typeFilter === "OUT" && !isDebitEntry(e.type)) return false;
      if (!matchesPeriod(e.postedAt || e.createdAt, periodFilter)) return false;
      if (!q) return true;

      const desc = [
        e.expense?.payee,
        e.payee,
        e.description,
        e.expense?.description,
        e.transfer?.reference,
        e.reversalReason,
        LEDGER_TYPE_LABELS[e.type],
        e.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return desc.includes(q);
    });
  }, [entries, searchQuery, periodFilter, typeFilter]);

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
        header: (
          <span className="inline-flex items-center gap-1.5">
            <IconCalendar size={14} className="text-slate-400" />
            <span>Date & Time</span>
          </span>
        ),
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
        key: "description",
        header: (
          <span className="inline-flex items-center gap-1.5">
            <IconFileText size={14} className="text-slate-400" />
            <span>Description</span>
          </span>
        ),
        render: (e) => {
          const desc =
            e.description ||
            e.expense?.description ||
            e.transfer?.reference ||
            e.reversalReason ||
            null;
          const payee = e.expense?.payee || e.payee;
          const label =
            [payee, desc].filter(Boolean).join(" — ") ||
            LEDGER_TYPE_LABELS[e.type] ||
            e.type;
          return (
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200 max-w-[260px] truncate">
              {label}
            </p>
          );
        },
      },
      {
        key: "moneyType",
        header: (
          <span className="inline-flex items-center gap-1.5">
            <IconArrowsExchange size={14} className="text-slate-400" />
            <span>Type</span>
          </span>
        ),
        render: (e) =>
          isCreditEntry(e.type) ? (
            <StatusBadge
              label="Credit"
              tone="emerald"
              icon={IconDownload}
              size="xs"
            />
          ) : (
            <StatusBadge
              label="Debit"
              tone="rose"
              icon={IconShoppingCart}
              size="xs"
            />
          ),
      },
      {
        key: "amount",
        header: (
          <span className="inline-flex items-center gap-1.5">
            <IconCoins size={14} className="text-slate-400" />
            <span>Amount (₹)</span>
          </span>
        ),
        render: (e) => {
          const isCredit = isCreditEntry(e.type);
          return (
            <span
              className={`text-xs font-bold tabular-nums whitespace-nowrap ${isCredit
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-500 dark:text-rose-400"
                }`}
            >
              {isCredit ? "+" : "-"}
              {formatInr(e.amount)}
            </span>
          );
        },
      },
      {
        key: "balanceAfter",
        header: (
          <span className="inline-flex items-center gap-1.5">
            <IconWallet size={14} className="text-slate-400" />
            <span>Balance After (₹)</span>
          </span>
        ),
        render: (e) => (
          <span className="text-xs font-bold text-slate-800 dark:text-white tabular-nums whitespace-nowrap">
            {formatInr(e.balanceAfter)}
          </span>
        ),
      },
      {
        key: "pdf",
        header: (
          <span className="inline-flex items-center gap-1.5">
            <IconReceipt size={14} className="text-slate-400" />
            <span>Receipt</span>
          </span>
        ),
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
      title={
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
            <IconWallet size={17} />
          </span>
          <div>
            <div className="text-[15px] font-semibold text-slate-800 dark:text-white leading-tight">
              Transactions
            </div>
            <div className="text-[12px] font-normal text-slate-400 dark:text-slate-500">
              All your money in and out, with current balance
            </div>
          </div>
        </div>
      }
      search={{
        value: searchQuery,
        onChange: setSearchQuery,
        placeholder: "Search by name or note...",
      }}
      headerExtra={
        <div className="flex items-center gap-2">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="form-select form-sm w-auto"
            aria-label="Filter by period"
          >
            <option value="ALL">All Time</option>
            <option value="MONTH">This Month</option>
            <option value="WEEK">This Week</option>
            <option value="TODAY">Today</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="form-select form-sm w-auto"
            aria-label="Filter by transaction type"
          >
            <option value="ALL">Filter: All</option>
            <option value="IN">Credit</option>
            <option value="OUT">Debit</option>
          </select>
        </div>
      }
      columns={columns}
      data={filteredEntries}
      actions={actions}
      loading={loading}
      empty={{
        icon: IconWallet,
        title: "No Transactions Yet",
        description:
          "Credit and debit entries will appear here once funds are confirmed or expenses are posted.",
      }}
    />
  );
}
