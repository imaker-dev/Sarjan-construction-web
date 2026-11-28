import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  IconBuildingBank,
  IconCheck,
  IconEdit,
  IconExchange,
  IconFileTypePdf,
  IconListDetails,
  IconPlus,
  IconRefresh,
  IconRotateClockwise,
  IconScale,
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
  formatInr,
  openPdfBlob,
  WALLET_STATUS_TONES,
} from "@utils/wallet.utils";
import walletApi from "@store/api/wallet.api";
import { listSites } from "@store/slices/site.slice";
import {
  cancelWalletTransfer,
  closeShortFundingRequest,
  createAccountHead,
  createSiteWallet,
  decideApprovalTask,
  executeLedgerReversal,
  getFinanceFundingRequest,
  getFinanceWalletLedger,
  listAccountHeads,
  listFinanceFundingRequests,
  listFinanceReversalRequests,
  listFinanceWallets,
  recordWalletTransfer,
  reduceApprovedAmount,
  resolveWalletDispute,
  updateAccountHead,
} from "@store/slices/wallet.slice";
import {
  AccountHeadModal,
  CancelTransferModal,
  CloseShortModal,
  CreateSiteWalletModal,
  DecideFundingModal,
  ExecuteReversalModal,
  RecordTransferModal,
  ReduceAmountModal,
  ResolveDisputeModal,
} from "../components/FinanceActionModals";
import FinanceReportsTab from "../components/FinanceReportsTab";
import WalletStatementTable from "../components/WalletStatementTable";

export default function FinanceWalletsPage() {
  const dispatch = useDispatch();
  const { can } = useAccess();
  const canManage = can({ permissions: [PERMISSIONS.WALLET.FINANCE_MANAGE] });

  const [activeTab, setActiveTab] = useState("wallets"); // "wallets" | "queue" | "reversals" | "heads"
  const [queueStatus, setQueueStatus] = useState("");

  // Modal targets
  const [createWalletOpen, setCreateWalletOpen] = useState(false);
  const [headModalState, setHeadModalState] = useState({ open: false, head: null });
  const [decideTarget, setDecideTarget] = useState(null);
  const [transferTarget, setTransferTarget] = useState(null);
  const [manageTransfersTarget, setManageTransfersTarget] = useState(null);
  const [cancelTransferTarget, setCancelTransferTarget] = useState(null);
  const [reduceAmountTarget, setReduceAmountTarget] = useState(null);
  const [disputeTarget, setDisputeTarget] = useState(null);
  const [closeShortTarget, setCloseShortTarget] = useState(null);
  const [reversalTarget, setReversalTarget] = useState(null);
  const [statementWallet, setStatementWallet] = useState(null);

  const {
    financeWallets,
    financeWalletLedger,
    accountHeads,
    financeFundingRequests,
    financeFundingDetail,
    financeReversalRequests,
    isLoadingFinanceWallets,
    isLoadingFinanceLedger,
    isLoadingAccountHeads,
    isLoadingFinanceQueue,
    isLoadingFinanceReversals,
    isSubmitting,
  } = useSelector((state) => state.wallet);
  const { sitesData } = useSelector((state) => state.site);

  const sitesList = useMemo(() => extractList(sitesData), [sitesData]);
  const walletsList = useMemo(() => extractList(financeWallets), [financeWallets]);
  const headsList = useMemo(() => extractList(accountHeads), [accountHeads]);
  const queueList = useMemo(
    () => extractList(financeFundingRequests),
    [financeFundingRequests]
  );
  const reversalsList = useMemo(
    () => extractList(financeReversalRequests),
    [financeReversalRequests]
  );

  const loadAll = useCallback(() => {
    dispatch(listSites());
    dispatch(listFinanceWallets({ limit: 50 }));
    dispatch(
      listFinanceFundingRequests(
        queueStatus ? { status: queueStatus, limit: 50 } : { limit: 50 }
      )
    );
    dispatch(listFinanceReversalRequests({ status: "REQUESTED", limit: 50 }));
    dispatch(listAccountHeads({ limit: 100 }));
  }, [dispatch, queueStatus]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Real-time refresh on SITE_WALLET_* / WALLET_* WebSocket hints
  useEffect(() => {
    const onRealtime = (e) => {
      const et = String(e?.detail?.eventType || "");
      if (et.startsWith("SITE_WALLET_") || et.startsWith("WALLET_")) {
        loadAll();
      }
    };
    window.addEventListener("sarjan:realtime-notification", onRealtime);
    return () =>
      window.removeEventListener("sarjan:realtime-notification", onRealtime);
  }, [loadAll]);

  const totalBalance = useMemo(
    () =>
      walletsList.reduce((sum, w) => sum + Number(w.balance ?? 0), 0),
    [walletsList]
  );

  const walletColumns = useMemo(
    () => [
      {
        key: "site",
        header: "Site",
        render: (w) => (
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-white">
              {w.site?.name || w.siteName || w.siteId}
            </p>
            {w.site?.code && (
              <p className="text-[11px] font-mono text-slate-400">{w.site.code}</p>
            )}
          </div>
        ),
      },
      {
        key: "balance",
        header: "Balance",
        render: (w) => (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatInr(w.balance)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (w) => (
          <StatusBadge
            label={w.status || "ACTIVE"}
            tone={WALLET_STATUS_TONES[w.status] || "slate"}
            size="xs"
          />
        ),
      },
      {
        key: "updatedAt",
        header: "Updated",
        render: (w) => (
          <span className="text-xs text-slate-400 tabular-nums">
            {w.updatedAt ? new Date(w.updatedAt).toLocaleDateString("en-IN") : "—"}
          </span>
        ),
      },
    ],
    []
  );

  const queueColumns = useMemo(
    () => [
      {
        key: "site",
        header: "Site & Purpose",
        render: (r) => (
          <div className="max-w-[260px]">
            <p className="text-xs font-semibold text-slate-800 dark:text-white">
              {r.site?.name || r.siteId}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {r.draftPurpose || r.purpose || "—"}
            </p>
          </div>
        ),
      },
      {
        key: "amounts",
        header: "Requested / Approved / Confirmed",
        render: (r) => (
          <div className="text-xs tabular-nums space-y-0.5">
            <div className="font-semibold text-slate-800 dark:text-white">
              Req: {formatInr(r.draftAmount)}
            </div>
            <div className="text-[11px] text-slate-400">
              Appr: {r.approvedAmount ? formatInr(r.approvedAmount) : "—"} • Conf:{" "}
              {formatInr(r.confirmedAmount)}
            </div>
          </div>
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

  const queueActions = useMemo(
    () => [
      {
        label: "Approve / Reject / Return",
        icon: IconCheck,
        hidden: (r) => !canManage || r.status !== "SUBMITTED",
        onClick: async (r) => {
          await dispatch(getFinanceFundingRequest(r.id));
          setDecideTarget(r);
        },
      },
      {
        label: "Record Bank Transfer",
        icon: IconSend,
        hidden: (r) =>
          !canManage ||
          (r.status !== "APPROVED" && r.status !== "PARTIALLY_FUNDED"),
        onClick: (r) => setTransferTarget(r),
      },
      {
        label: "Manage Transfers / PDFs",
        icon: IconListDetails,
        hidden: (r) =>
          r.status !== "APPROVED" &&
          r.status !== "PARTIALLY_FUNDED" &&
          r.status !== "FUNDED" &&
          r.status !== "CLOSED_SHORT",
        onClick: async (r) => {
          await dispatch(getFinanceFundingRequest(r.id));
          setManageTransfersTarget(r);
        },
      },
      {
        label: "Reduce Approved Amount",
        icon: IconScale,
        hidden: (r) =>
          !canManage ||
          (r.status !== "APPROVED" && r.status !== "PARTIALLY_FUNDED"),
        onClick: (r) => setReduceAmountTarget(r),
      },
      {
        label: "Resolve Disputed Transfer",
        icon: IconExchange,
        hidden: (r) => !canManage || r.status !== "PARTIALLY_FUNDED",
        onClick: async (r) => {
          const detail = await dispatch(getFinanceFundingRequest(r.id)).unwrap();
          const disputed = (detail?.transfers || []).find(
            (t) => t.status === "DISPUTED"
          );
          if (!disputed) {
            toast.info("No disputed transfers found on this request.");
            return;
          }
          setDisputeTarget(disputed);
        },
      },
      {
        label: "Close Short",
        icon: IconListDetails,
        hidden: (r) =>
          !canManage ||
          (r.status !== "APPROVED" && r.status !== "PARTIALLY_FUNDED"),
        onClick: (r) => setCloseShortTarget(r),
      },
    ],
    [canManage, dispatch]
  );

  const reversalColumns = useMemo(
    () => [
      {
        key: "reason",
        header: "Reversal Reason",
        render: (rr) => (
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-white">
              {rr.reason || "—"}
            </p>
            <p className="text-[11px] font-mono text-slate-400">
              Entry: {rr.ledgerEntryId}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (rr) => (
          <StatusBadge
            label={rr.status}
            tone={WALLET_STATUS_TONES[rr.status] || "slate"}
            size="xs"
          />
        ),
      },
    ],
    []
  );

  const headColumns = useMemo(
    () => [
      {
        key: "code",
        header: "Code",
        render: (h) => (
          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
            {h.code}
          </span>
        ),
      },
      {
        key: "name",
        header: "Account Head",
        render: (h) => (
          <span className="text-xs font-medium text-slate-800 dark:text-white">
            {h.name}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (h) => (
          <StatusBadge
            label={h.status}
            tone={WALLET_STATUS_TONES[h.status] || "slate"}
            size="xs"
          />
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-5">
      <PageHeaderBanner
        title="Finance Wallets & Funding"
        subtitle="Provision site wallets, approve petty-cash funding, record transfers, and manage account heads."
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Site Wallets"
          value={walletsList.length}
          icon={IconWallet}
          tone="emerald"
        />
        <StatCard
          label="Total Site Balance"
          value={formatInr(totalBalance)}
          icon={IconBuildingBank}
          tone="indigo"
        />
        <StatCard
          label="Funding Queue"
          value={queueList.length}
          icon={IconSend}
          tone="amber"
        />
        <StatCard
          label="Pending Reversals"
          value={reversalsList.length}
          icon={IconRotateClockwise}
          tone="rose"
        />
      </div>

      {/* Tabs & Actions */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex flex-wrap rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800/60">
            {[
              { key: "wallets", label: "Site Wallets" },
              { key: "queue", label: "Funding Queue" },
              { key: "reversals", label: "Reversals" },
              { key: "heads", label: "Account Heads" },
              { key: "reports", label: "Reports" },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === t.key
                    ? "bg-white text-slate-800 shadow-xs dark:bg-[#1C2536] dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "queue" && (
              <select
                value={queueStatus}
                onChange={(e) => setQueueStatus(e.target.value)}
                className="form-select form-sm w-auto"
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
                <option value="PARTIALLY_FUNDED">Partially Funded</option>
                <option value="FUNDED">Funded</option>
                <option value="CLOSED_SHORT">Closed Short</option>
                <option value="REJECTED">Rejected</option>
              </select>
            )}

            <button
              type="button"
              onClick={loadAll}
              className="btn btn-outline btn-xs inline-flex items-center gap-1"
            >
              <IconRefresh size={14} />
              <span>Refresh</span>
            </button>

            {canManage && activeTab === "wallets" && (
              <button
                type="button"
                onClick={() => setCreateWalletOpen(true)}
                className="btn btn-primary btn-xs inline-flex items-center gap-1"
              >
                <IconPlus size={14} />
                <span>Create Wallet</span>
              </button>
            )}

            {canManage && activeTab === "heads" && (
              <button
                type="button"
                onClick={() => setHeadModalState({ open: true, head: null })}
                className="btn btn-primary btn-xs inline-flex items-center gap-1"
              >
                <IconPlus size={14} />
                <span>Add Account Head</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-4">
          {activeTab === "wallets" && (
            <DataTable
              columns={walletColumns}
              data={walletsList}
              loading={isLoadingFinanceWallets}
              actions={[
                {
                  label: "View Bank Statement",
                  icon: IconListDetails,
                  onClick: async (w) => {
                    setStatementWallet(w);
                    await dispatch(
                      getFinanceWalletLedger({
                        walletId: w.id,
                        params: { limit: 50 },
                      })
                    );
                  },
                },
              ]}
              empty={{
                icon: IconWallet,
                title: "No Site Wallets",
                description: "Create a wallet for an active site to begin funding.",
              }}
            />
          )}

          {activeTab === "queue" && (
            <DataTable
              columns={queueColumns}
              data={queueList}
              actions={queueActions}
              loading={isLoadingFinanceQueue}
              empty={{
                icon: IconSend,
                title: "No Funding Requests",
                description: "No funding requests match the selected status filter.",
              }}
            />
          )}

          {activeTab === "reversals" && (
            <DataTable
              columns={reversalColumns}
              data={reversalsList}
              loading={isLoadingFinanceReversals}
              actions={[
                {
                  label: "Execute Reversal",
                  icon: IconRotateClockwise,
                  hidden: (rr) => !canManage || rr.status !== "REQUESTED",
                  onClick: (rr) => setReversalTarget(rr),
                },
              ]}
              empty={{
                icon: IconRotateClockwise,
                title: "No Reversal Requests",
                description: "No pending reversal requests from sites.",
              }}
            />
          )}

          {activeTab === "heads" && (
            <DataTable
              columns={headColumns}
              data={headsList}
              loading={isLoadingAccountHeads}
              actions={[
                {
                  label: "Edit",
                  icon: IconEdit,
                  hidden: () => !canManage,
                  onClick: (h) => setHeadModalState({ open: true, head: h }),
                },
              ]}
              empty={{
                icon: IconListDetails,
                title: "No Account Heads",
                description: "Add expense account heads (e.g. Materials, Fuel).",
              }}
            />
          )}

          {activeTab === "reports" && (
            <FinanceReportsTab sitesList={sitesList} />
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateSiteWalletModal
        isOpen={createWalletOpen}
        onClose={() => setCreateWalletOpen(false)}
        sitesList={sitesList}
        isSubmitting={isSubmitting}
        onSubmit={async (siteId) => {
          await dispatch(createSiteWallet({ siteId })).unwrap();
          toast.success("Site wallet ready");
          setCreateWalletOpen(false);
          loadAll();
        }}
      />

      <AccountHeadModal
        isOpen={headModalState.open}
        onClose={() => setHeadModalState({ open: false, head: null })}
        editingHead={headModalState.head}
        isSubmitting={isSubmitting}
        onSubmit={async (payload) => {
          if (headModalState.head) {
            await dispatch(updateAccountHead(payload)).unwrap();
            toast.success("Account head updated");
          } else {
            await dispatch(createAccountHead(payload)).unwrap();
            toast.success("Account head created");
          }
          setHeadModalState({ open: false, head: null });
          loadAll();
        }}
      />

      <DecideFundingModal
        isOpen={Boolean(decideTarget)}
        onClose={() => setDecideTarget(null)}
        requestDetail={financeFundingDetail || decideTarget}
        isSubmitting={isSubmitting}
        onSubmit={async (payload) => {
          await dispatch(decideApprovalTask(payload)).unwrap();
          toast.success("Decision recorded");
          setDecideTarget(null);
          loadAll();
        }}
      />

      <RecordTransferModal
        isOpen={Boolean(transferTarget)}
        onClose={() => setTransferTarget(null)}
        request={transferTarget}
        isSubmitting={isSubmitting}
        onSubmit={async (payload) => {
          await dispatch(recordWalletTransfer(payload)).unwrap();
          toast.success("Bank transfer recorded (awaiting PI receipt confirmation)");
          setTransferTarget(null);
          loadAll();
        }}
      />

      <ResolveDisputeModal
        isOpen={Boolean(disputeTarget)}
        onClose={() => setDisputeTarget(null)}
        transfer={disputeTarget}
        isSubmitting={isSubmitting}
        onSubmit={async (payload) => {
          await dispatch(resolveWalletDispute(payload)).unwrap();
          toast.success("Dispute resolved");
          setDisputeTarget(null);
          loadAll();
        }}
      />

      <CloseShortModal
        isOpen={Boolean(closeShortTarget)}
        onClose={() => setCloseShortTarget(null)}
        request={closeShortTarget}
        isSubmitting={isSubmitting}
        onSubmit={async (payload) => {
          await dispatch(closeShortFundingRequest(payload)).unwrap();
          toast.success("Funding request closed short");
          setCloseShortTarget(null);
          loadAll();
        }}
      />

      <ExecuteReversalModal
        isOpen={Boolean(reversalTarget)}
        onClose={() => setReversalTarget(null)}
        reversalRequest={reversalTarget}
        isSubmitting={isSubmitting}
        onSubmit={async (payload) => {
          await dispatch(executeLedgerReversal(payload)).unwrap();
          toast.success("Ledger entry reversed");
          setReversalTarget(null);
          loadAll();
        }}
      />

      <ReduceAmountModal
        isOpen={Boolean(reduceAmountTarget)}
        onClose={() => setReduceAmountTarget(null)}
        request={reduceAmountTarget}
        isSubmitting={isSubmitting}
        onSubmit={async (payload) => {
          await dispatch(reduceApprovedAmount(payload)).unwrap();
          toast.success("Approved amount reduced");
          setReduceAmountTarget(null);
          loadAll();
        }}
      />

      <CancelTransferModal
        isOpen={Boolean(cancelTransferTarget)}
        onClose={() => setCancelTransferTarget(null)}
        transfer={cancelTransferTarget}
        isSubmitting={isSubmitting}
        onSubmit={async (payload) => {
          await dispatch(cancelWalletTransfer(payload)).unwrap();
          toast.success("Unconfirmed transfer cancelled");
          setCancelTransferTarget(null);
          setManageTransfersTarget(null);
          loadAll();
        }}
      />

      <ModalBasic
        id="finance-manage-transfers-modal"
        isOpen={Boolean(manageTransfersTarget)}
        onClose={() => setManageTransfersTarget(null)}
        title="Recorded Transfers & Receipts"
        size="lg"
      >
        <div className="p-6 space-y-3">
          {(financeFundingDetail?.transfers || []).length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No transfers recorded for this request yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60 border border-slate-200 dark:border-slate-700/60 rounded-xl">
              {(financeFundingDetail?.transfers || []).map((tr) => (
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
                          const res = await walletApi.getFinanceTransferPdfApi(
                            tr.id
                          );
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
                        onClick={() => setCancelTransferTarget(tr)}
                        className="btn btn-outline btn-xs text-rose-500 inline-flex items-center gap-1"
                      >
                        <IconTrash size={13} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModalBasic>

      <ModalBasic
        id="finance-wallet-statement-modal"
        isOpen={Boolean(statementWallet)}
        onClose={() => setStatementWallet(null)}
        title={`Wallet Statement — ${statementWallet?.site?.name || statementWallet?.siteName || "Site"}`}
        size="4xl"
      >
        <div className="p-6">
          <WalletStatementTable
            entries={extractList(financeWalletLedger)}
            loading={isLoadingFinanceLedger}
            mode="finance"
            walletId={statementWallet?.id}
            siteId={statementWallet?.siteId || statementWallet?.site?.id}
          />
        </div>
      </ModalBasic>
    </div>
  );
}
