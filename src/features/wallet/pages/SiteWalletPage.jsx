import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  IconCheck,
  IconEdit,
  IconEye,
  IconFileTypePdf,
  IconFileUpload,
  IconPlus,
  IconReceipt,
  IconRefresh,
  IconRotateClockwise,
  IconSend,
  IconTrash,
  IconWallet,
} from "@tabler/icons-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import DataTable from "@components/ui/DataTable";
import ModalBasic from "@components/ui/ModalBasic";
import StatCard from "@components/ui/StatCard";
import StatusBadge from "@components/ui/StatusBadge";
import { useAccess } from "@hooks/useAccess";
import { PERMISSIONS } from "@constants/permissions";
import { extractList } from "@utils/api.utils";
import {
  formatDateTimeParts,
  formatInr,
  newIdempotencyKey,
  openPdfBlob,
  WALLET_STATUS_TONES,
} from "@utils/wallet.utils";
import walletApi from "@store/api/wallet.api";
import { listSites } from "@store/slices/site.slice";
import {
  attachLedgerEvidence,
  cancelSiteFundingRequest,
  confirmSiteTransferReceipt,
  createSiteFundingRequest,
  getSiteFundingRequest,
  getSiteWallet,
  getSiteWalletLedger,
  listSiteAccountHeads,
  listSiteExpenses,
  listSiteFundingRequests,
  postSiteExpense,
  requestLedgerReversal,
  submitSiteFundingRequest,
  updateSiteFundingRequest,
} from "@store/slices/wallet.slice";
import FundingRequestModal from "../components/FundingRequestModal";
import ConfirmReceiptModal from "../components/ConfirmReceiptModal";
import PostExpenseModal from "../components/PostExpenseModal";
import VoucherDetailModal from "../components/VoucherDetailModal";
import {
  EvidenceModal,
  ReversalRequestModal,
} from "../components/LedgerActionModals";
import SiteWalletReportsTab from "../components/SiteWalletReportsTab";
import WalletStatementTable from "../components/WalletStatementTable";

export default function SiteWalletPage() {
  const dispatch = useDispatch();
  const { can, assignments } = useAccess();
  const canManage = can({ permissions: [PERMISSIONS.WALLET.SITE_MANAGE] });

  const { sitesData } = useSelector((state) => state.site);
  const sitesList = useMemo(() => extractList(sitesData), [sitesData]);

  const defaultSiteId = useMemo(() => {
    const assigned = assignments.find((a) => a.siteId)?.siteId;
    return assigned || sitesList[0]?.id || "";
  }, [assignments, sitesList]);

  const [selectedSiteId, setSelectedSiteId] = useState("");
  const activeSiteId = selectedSiteId || defaultSiteId;

  const [activeTab, setActiveTab] = useState("ledger"); // "ledger" | "requests" | "expenses" | "reports"

  // Modals
  const [reqModalState, setReqModalState] = useState({ open: false, req: null });
  const [reqDetailOpen, setReqDetailOpen] = useState(false);
  const [confirmTransferTarget, setConfirmTransferTarget] = useState(null);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [voucherIdTarget, setVoucherIdTarget] = useState(null);
  const [reversalEntryTarget, setReversalEntryTarget] = useState(null);
  const [evidenceEntryTarget, setEvidenceEntryTarget] = useState(null);

  const {
    siteWalletSummary,
    siteLedger,
    siteFundingRequests,
    siteFundingDetail,
    siteExpenses,
    accountHeads,
    isLoadingSiteWallet,
    isLoadingSiteLedger,
    isLoadingSiteRequests,
    isLoadingSiteExpenses,
    isSubmitting,
  } = useSelector((state) => state.wallet);

  useEffect(() => {
    dispatch(listSites());
  }, [dispatch]);

  const loadSiteData = useCallback(async () => {
    if (!activeSiteId) return;
    try {
      await dispatch(getSiteWallet(activeSiteId)).unwrap();
      dispatch(
        getSiteWalletLedger({ siteId: activeSiteId, params: { limit: 50 } })
      );
      dispatch(
        listSiteFundingRequests({ siteId: activeSiteId, params: { limit: 50 } })
      );
      dispatch(listSiteExpenses({ siteId: activeSiteId, params: { limit: 50 } }));
      dispatch(
        listSiteAccountHeads({
          siteId: activeSiteId,
          params: { status: "ACTIVE", limit: 100 },
        })
      );
    } catch {
      // Wallet not yet provisioned for this site (404)
    }
  }, [dispatch, activeSiteId]);

  useEffect(() => {
    loadSiteData();
  }, [loadSiteData]);

  // Real-time refresh on SITE_WALLET_* / WALLET_* WebSocket hints
  useEffect(() => {
    const onRealtime = (e) => {
      const et = String(e?.detail?.eventType || "");
      if (et.startsWith("SITE_WALLET_") || et.startsWith("WALLET_")) {
        loadSiteData();
      }
    };
    window.addEventListener("sarjan:realtime-notification", onRealtime);
    return () =>
      window.removeEventListener("sarjan:realtime-notification", onRealtime);
  }, [loadSiteData]);

  const wallet = siteWalletSummary?.wallet || siteWalletSummary || null;
  const ledgerList = useMemo(() => extractList(siteLedger), [siteLedger]);
  const requestsList = useMemo(
    () => extractList(siteFundingRequests),
    [siteFundingRequests]
  );
  const expensesList = useMemo(() => extractList(siteExpenses), [siteExpenses]);
  const headsList = useMemo(() => extractList(accountHeads), [accountHeads]);

  const ledgerColumns = useMemo(
    () => [
      {
        key: "seq",
        header: "#",
        render: (e) => (
          <span className="font-mono text-xs text-slate-400 tabular-nums">
            {e.seq ?? "—"}
          </span>
        ),
      },
      {
        key: "type",
        header: "Type",
        render: (e) => (
          <StatusBadge
            label={LEDGER_TYPE_LABELS[e.type] || e.type}
            tone={WALLET_STATUS_TONES[e.type] || "slate"}
            size="xs"
          />
        ),
      },
      {
        key: "amount",
        header: "Amount",
        render: (e) => (
          <span className="text-xs font-bold text-slate-800 dark:text-white tabular-nums">
            {formatInr(e.amount)}
          </span>
        ),
      },
      {
        key: "balanceAfter",
        header: "Balance After",
        render: (e) => (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatInr(e.balanceAfter)}
          </span>
        ),
      },
      {
        key: "postedAt",
        header: "Posted At",
        render: (e) => (
          <span className="text-xs text-slate-400 tabular-nums">
            {e.postedAt ? new Date(e.postedAt).toLocaleString("en-IN") : "—"}
          </span>
        ),
      },
    ],
    []
  );

  const requestColumns = useMemo(
    () => [
      {
        key: "purpose",
        header: "Purpose",
        render: (r) => (
          <div className="max-w-[260px]">
            <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
              {r.draftPurpose || r.purpose || "—"}
            </p>
            {r.draftNeededByDate && (
              <p className="text-[11px] text-slate-400 tabular-nums">
                Needed by: {String(r.draftNeededByDate).slice(0, 10)}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "requested",
        header: "Requested",
        align: "right",
        render: (r) => (
          <span className="text-xs font-semibold tabular-nums text-slate-800 dark:text-white">
            {formatInr(r.draftAmount)}
          </span>
        ),
      },
      {
        key: "approved",
        header: "Approved",
        align: "right",
        render: (r) => (
          <span className="text-xs font-medium tabular-nums text-slate-700 dark:text-slate-200">
            {r.approvedAmount ? formatInr(r.approvedAmount) : "—"}
          </span>
        ),
      },
      {
        key: "confirmed",
        header: "Confirmed",
        align: "right",
        render: (r) => (
          <span
            className={`text-xs font-semibold tabular-nums ${
              Number(r.confirmedAmount || 0) > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-400"
            }`}
          >
            {formatInr(r.confirmedAmount)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (r) => (
          <StatusBadge
            label={r.status}
            tone={WALLET_STATUS_TONES[r.status] || "slate"}
            size="xs"
          />
        ),
      },
    ],
    []
  );

  const expenseColumns = useMemo(
    () => [
      {
        key: "date",
        header: "Date & Time",
        render: (ex) => {
          const { date, time } = formatDateTimeParts(
            ex.createdAt || ex.expenseDate
          );
          return (
            <div className="leading-tight whitespace-nowrap">
              <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200 block">
                {ex.expenseDate ? String(ex.expenseDate).slice(0, 10) : date}
              </span>
              {time && (
                <span className="text-[11px] text-slate-400 tabular-nums block mt-0.5">
                  {time}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "desc",
        header: "Payee & Description",
        render: (ex) => (
          <div className="max-w-[260px]">
            <p className="text-xs font-semibold text-slate-800 dark:text-white">
              {ex.payee || "—"}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {ex.description || "—"}
            </p>
          </div>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        render: (ex) => (
          <span className="text-xs font-bold text-rose-500 dark:text-rose-400 tabular-nums">
            -{formatInr(ex.amount)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (ex) => (
          <StatusBadge
            label={ex.status || "POSTED"}
            tone={WALLET_STATUS_TONES[ex.status] || "emerald"}
            size="xs"
          />
        ),
      },
    ],
    []
  );

  const detailTransfers = Array.isArray(siteFundingDetail?.transfers)
    ? siteFundingDetail.transfers
    : [];

  return (
    <div className="space-y-5">
      <PageHeaderBanner
        title="Site Wallet"
        subtitle={
          canManage
            ? "Request funds, confirm physical receipts, post petty-cash expenses, and manage cash vouchers."
            : "Read-only oversight of site wallet balance, funding requests, expenses, and ledger."
        }
      />

      {/* Site Selector */}
      <div className="rounded-xl bg-white dark:bg-[#1C2536] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={activeSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="form-select form-sm w-auto min-w-[220px]"
          >
            {sitesList.length === 0 ? (
              <option value="">No sites available</option>
            ) : (
              sitesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code ? `${s.name} (${s.code})` : s.name}
                </option>
              ))
            )}
          </select>
        </div>

        <button
          type="button"
          onClick={loadSiteData}
          className="btn btn-outline btn-xs inline-flex items-center gap-1"
        >
          <IconRefresh size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Wallet Balance"
          value={formatInr(wallet?.balance ?? 0)}
          icon={IconWallet}
          color="emerald"
        />
        <StatCard
          label="Pending Requests"
          value={siteWalletSummary?.pendingRequests ?? 0}
          icon={IconSend}
          color="amber"
        />
        <StatCard
          label="Approved Amount"
          value={formatInr(siteWalletSummary?.approvedAmount ?? 0)}
          icon={IconCheck}
          color="indigo"
        />
        <StatCard
          label="Confirmed Amount"
          value={formatInr(siteWalletSummary?.confirmedAmount ?? 0)}
          icon={IconReceipt}
          color="emerald"
        />
      </div>

      {/* Workspace Card or Unprovisioned Empty State */}
      {!isLoadingSiteWallet && !wallet ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] p-10 text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            <IconWallet size={22} />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white">
            No Wallet Provisioned for This Site
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-md mx-auto">
            Ask a Finance Manager to create the site wallet under{" "}
            <span className="font-medium text-slate-600 dark:text-slate-300">
              Finance Wallets → Create Wallet
            </span>{" "}
            before requesting funds or posting expenses.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex flex-wrap rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800/60">
              {[
                { key: "ledger", label: "Ledger" },
                {
                  key: "requests",
                  label: "Funding Requests",
                  badge: requestsList.filter((r) =>
                    ["APPROVED", "PARTIALLY_FUNDED", "RETURNED"].includes(r.status)
                  ).length,
                },
                { key: "expenses", label: "Expenses & Vouchers" },
                { key: "reports", label: "Reports" },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === t.key
                    ? "bg-white text-slate-800 shadow-xs dark:bg-[#1C2536] dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    }`}
                >
                  <span>{t.label}</span>
                  {t.badge > 0 && (
                    <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold leading-none tabular-nums text-white">
                      {t.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {canManage && activeSiteId && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReqModalState({ open: true, req: null })}
                  className="btn btn-outline btn-xs inline-flex items-center gap-1"
                >
                  <IconPlus size={14} />
                  <span>Request Funds</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(true)}
                  className="btn btn-primary btn-xs inline-flex items-center gap-1"
                >
                  <IconPlus size={14} />
                  <span>Post Expense</span>
                </button>
              </div>
            )}
          </div>

          {activeTab === "ledger" && (
            <WalletStatementTable
              entries={ledgerList}
              loading={isLoadingSiteLedger}
              mode="site"
              siteId={activeSiteId}
              canManage={canManage}
              onAttachEvidence={(entry) => setEvidenceEntryTarget(entry)}
              onRequestReversal={(entry) => setReversalEntryTarget(entry)}
            />
          )}

          {activeTab === "requests" && (
            <DataTable
              columns={requestColumns}
              data={requestsList}
              loading={isLoadingSiteRequests}
              actions={[
                {
                  label: "View / Confirm Receipt",
                  icon: IconEye,
                  onClick: async (r) => {
                    await dispatch(
                      getSiteFundingRequest({
                        siteId: activeSiteId,
                        requestId: r.id,
                      })
                    );
                    setReqDetailOpen(true);
                  },
                },
                {
                  label: "Edit Draft",
                  icon: IconEdit,
                  hidden: (r) =>
                    !canManage ||
                    (r.status !== "DRAFT" && r.status !== "RETURNED"),
                  onClick: (r) => setReqModalState({ open: true, req: r }),
                },
                {
                  label: "Submit Request",
                  icon: IconSend,
                  hidden: (r) =>
                    !canManage ||
                    (r.status !== "DRAFT" && r.status !== "RETURNED"),
                  onClick: async (r) => {
                    await dispatch(
                      submitSiteFundingRequest({
                        siteId: activeSiteId,
                        requestId: r.id,
                        values: { idempotencyKey: newIdempotencyKey("pi-sub") },
                      })
                    ).unwrap();
                    toast.success("Funding request submitted to Finance");
                    loadSiteData();
                  },
                },
                {
                  label: "Cancel Draft",
                  icon: IconTrash,
                  hidden: (r) =>
                    !canManage ||
                    (r.status !== "DRAFT" && r.status !== "RETURNED"),
                  onClick: async (r) => {
                    await dispatch(
                      cancelSiteFundingRequest({
                        siteId: activeSiteId,
                        requestId: r.id,
                        values: { idempotencyKey: newIdempotencyKey("pi-can") },
                      })
                    ).unwrap();
                    toast.success("Funding request cancelled");
                    loadSiteData();
                  },
                },
              ]}
              empty={{
                icon: IconSend,
                title: "No Funding Requests",
                description: "Create a funding request to request petty cash from Finance.",
              }}
            />
          )}

          {activeTab === "expenses" && (
            <DataTable
              columns={expenseColumns}
              data={expensesList}
              loading={isLoadingSiteExpenses}
              actions={[
                {
                  label: "PDF Voucher",
                  icon: IconFileTypePdf,
                  hidden: (ex) => !ex.voucherId && !ex.voucher?.id,
                  onClick: async (ex) => {
                    try {
                      const res = await walletApi.getSiteVoucherPdfApi({
                        siteId: activeSiteId,
                        voucherId: ex.voucherId || ex.voucher?.id,
                      });
                      openPdfBlob(res.data);
                    } catch {
                      toast.error("Failed to download voucher PDF");
                    }
                  },
                },
                {
                  label: "View / Print Voucher",
                  icon: IconReceipt,
                  hidden: (ex) => !ex.voucherId && !ex.voucher?.id,
                  onClick: (ex) =>
                    setVoucherIdTarget(ex.voucherId || ex.voucher?.id),
                },
              ]}
              empty={{
                icon: IconReceipt,
                title: "No Expenses Posted",
                description: "Expenses debited from this site wallet will appear here.",
              }}
            />
          )}

          {activeTab === "reports" && (
            <SiteWalletReportsTab siteId={activeSiteId} />
          )}
        </div>
      )}

      {/* Funding Request Detail & Transfers Modal */}
      <ModalBasic
        id="site-funding-detail-modal"
        isOpen={reqDetailOpen}
        onClose={() => setReqDetailOpen(false)}
        title="Funding Request & Transfers"
        size="lg"
      >
        <div className="p-6 space-y-4">
          {detailTransfers.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No bank transfers recorded yet for this request.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60 border border-slate-200 dark:border-slate-700/60 rounded-xl">
              {detailTransfers.map((tr) => (
                <div
                  key={tr.id}
                  className="p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-white tabular-nums">
                        {formatInr(tr.amount)}
                      </span>
                      <StatusBadge
                        label={tr.status}
                        tone={WALLET_STATUS_TONES[tr.status] || "slate"}
                        size="xs"
                      />
                    </div>
                    <p className="text-slate-400 mt-0.5 font-mono">
                      Ref: {tr.reference} • Confirmed:{" "}
                      {formatInr(tr.confirmedAmount)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await walletApi.getSiteTransferPdfApi({
                            siteId: activeSiteId,
                            transferId: tr.id,
                          });
                          openPdfBlob(res.data);
                        } catch {
                          toast.error("Failed to download transfer receipt PDF");
                        }
                      }}
                      className="btn btn-outline btn-xs inline-flex items-center gap-1"
                    >
                      <IconFileTypePdf size={13} className="text-rose-500" />
                      <span>PDF</span>
                    </button>

                    {canManage && tr.status === "RECORDED" && (
                      <button
                        type="button"
                        onClick={() => setConfirmTransferTarget(tr)}
                        className="btn btn-primary btn-xs inline-flex items-center gap-1"
                      >
                        <IconCheck size={13} />
                        <span>Confirm Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModalBasic>

      {/* Modals */}
      <FundingRequestModal
        isOpen={reqModalState.open}
        onClose={() => setReqModalState({ open: false, req: null })}
        editingRequest={reqModalState.req}
        isSubmitting={isSubmitting}
        onSubmit={async ({ isEdit, submitToFinance, requestId, values }) => {
          let targetId = requestId;
          if (isEdit) {
            await dispatch(
              updateSiteFundingRequest({
                siteId: activeSiteId,
                requestId,
                values,
              })
            ).unwrap();
          } else {
            const res = await dispatch(
              createSiteFundingRequest({ siteId: activeSiteId, values })
            ).unwrap();
            targetId = res?.request?.id || res?.id;
          }

          if (submitToFinance && targetId) {
            await dispatch(
              submitSiteFundingRequest({
                siteId: activeSiteId,
                requestId: targetId,
                values: { idempotencyKey: newIdempotencyKey("pi-sub") },
              })
            ).unwrap();
            toast.success("Funding request submitted to Finance");
          } else {
            toast.success(isEdit ? "Draft updated" : "Funding request draft created");
          }

          setReqModalState({ open: false, req: null });
          loadSiteData();
        }}
      />

      <ConfirmReceiptModal
        isOpen={Boolean(confirmTransferTarget)}
        onClose={() => setConfirmTransferTarget(null)}
        transfer={confirmTransferTarget}
        isSubmitting={isSubmitting}
        onSubmit={async ({ transferId, values }) => {
          await dispatch(
            confirmSiteTransferReceipt({
              siteId: activeSiteId,
              transferId,
              values,
            })
          ).unwrap();
          toast.success("Receipt confirmed and wallet credited");
          setConfirmTransferTarget(null);
          setReqDetailOpen(false);
          loadSiteData();
        }}
      />

      <PostExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        accountHeads={headsList}
        isSubmitting={isSubmitting}
        onSubmit={async (values) => {
          await dispatch(
            postSiteExpense({ siteId: activeSiteId, values })
          ).unwrap();
          toast.success("Expense posted and wallet debited");
          setExpenseModalOpen(false);
          loadSiteData();
        }}
      />

      <VoucherDetailModal
        isOpen={Boolean(voucherIdTarget)}
        onClose={() => setVoucherIdTarget(null)}
        siteId={activeSiteId}
        voucherId={voucherIdTarget}
        canManage={canManage}
        onAttached={loadSiteData}
      />

      <ReversalRequestModal
        isOpen={Boolean(reversalEntryTarget)}
        onClose={() => setReversalEntryTarget(null)}
        entry={reversalEntryTarget}
        isSubmitting={isSubmitting}
        onSubmit={async ({ entryId, values }) => {
          await dispatch(
            requestLedgerReversal({
              siteId: activeSiteId,
              entryId,
              values,
            })
          ).unwrap();
          toast.success("Reversal request sent to Finance");
          setReversalEntryTarget(null);
        }}
      />

      <EvidenceModal
        isOpen={Boolean(evidenceEntryTarget)}
        onClose={() => setEvidenceEntryTarget(null)}
        siteId={activeSiteId}
        entry={evidenceEntryTarget}
        isSubmitting={isSubmitting}
        onSubmit={async (payload) => {
          await dispatch(attachLedgerEvidence(payload)).unwrap();
          toast.success("Evidence attached to ledger entry");
          setEvidenceEntryTarget(null);
        }}
      />
    </div>
  );
}
