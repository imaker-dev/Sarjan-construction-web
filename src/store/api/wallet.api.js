import Api from "../api-client";

const walletApi = {
  // ----------------------------------------------
  // FINANCE SIDE (COMPANY-SCOPED)
  // ----------------------------------------------
  createSiteWalletApi: ({ siteId, values = {} }) =>
    Api.post(`/finance/sites/${siteId}/wallet`, values),

  listFinanceWalletsApi: (params = {}) =>
    Api.get("/finance/wallets", { params }),

  getFinanceWalletApi: (walletId) =>
    Api.get(`/finance/wallets/${walletId}`),

  getFinanceWalletLedgerApi: ({ walletId, params = {} }) =>
    Api.get(`/finance/wallets/${walletId}/ledger`, { params }),

  // Account Heads
  listAccountHeadsApi: (params = {}) =>
    Api.get("/finance/wallet/account-heads", { params }),

  createAccountHeadApi: (values) =>
    Api.post("/finance/wallet/account-heads", values),

  updateAccountHeadApi: ({ accountHeadId, values }) =>
    Api.patch(`/finance/wallet/account-heads/${accountHeadId}`, values),

  // Finance Funding Queue & Transfers
  listFinanceFundingRequestsApi: (params = {}) =>
    Api.get("/finance/wallet-funding-requests", { params }),

  getFinanceFundingRequestApi: (requestId) =>
    Api.get(`/finance/wallet-funding-requests/${requestId}`),

  recordWalletTransferApi: ({ requestId, values }) =>
    Api.post(`/finance/wallet-funding-requests/${requestId}/transfers`, values),

  listFinanceTransfersApi: ({ requestId, params = {} }) =>
    Api.get(`/finance/wallet-funding-requests/${requestId}/transfers`, { params }),

  resolveWalletDisputeApi: ({ transferId, values }) =>
    Api.post(`/finance/wallet-transfers/${transferId}/resolve-dispute`, values),

  closeShortFundingRequestApi: ({ requestId, values }) =>
    Api.post(`/finance/wallet-funding-requests/${requestId}/close-short`, values),

  reduceApprovedAmountApi: ({ requestId, values }) =>
    Api.post(`/finance/wallet-funding-requests/${requestId}/reduce-amount`, values),

  cancelWalletTransferApi: ({ transferId, values }) =>
    Api.post(`/finance/wallet-transfers/${transferId}/cancel`, values),

  // Finance Site-Wise Reports
  getFinanceWalletsReportsApi: (params = {}) =>
    Api.get("/finance/wallets/reports", { params }),

  getFinanceWalletDetailReportApi: ({ walletId, params = {} }) =>
    Api.get(`/finance/wallets/${walletId}/reports`, { params }),

  // Finance PDFs
  getFinanceVoucherPdfApi: ({ walletId, voucherId }) =>
    Api.get(`/finance/wallets/${walletId}/vouchers/${voucherId}/pdf`, {
      responseType: "blob",
    }),

  getFinanceTransferPdfApi: (transferId) =>
    Api.get(`/finance/wallet-transfers/${transferId}/pdf`, {
      responseType: "blob",
    }),

  // Approval Tasks (shared workflow)
  listApprovalTasksApi: (params = {}) =>
    Api.get("/approval-tasks", { params }),

  decideApprovalTaskApi: ({ taskId, values }) =>
    Api.post(`/approval-tasks/${taskId}/decisions`, values),

  // Finance Reversals
  listFinanceReversalRequestsApi: (params = {}) =>
    Api.get("/finance/wallet-reversal-requests", { params }),

  executeLedgerReversalApi: ({ entryId, values }) =>
    Api.post(`/finance/wallet/ledger/${entryId}/reverse`, values),

  // ----------------------------------------------
  // SITE SIDE (PI WRITE + PD READ-ONLY)
  // ----------------------------------------------
  getSiteWalletApi: (siteId) =>
    Api.get(`/sites/${siteId}/wallet`),

  getSiteWalletLedgerApi: ({ siteId, params = {} }) =>
    Api.get(`/sites/${siteId}/wallet/ledger`, { params }),

  getSiteWalletReportsApi: ({ siteId, params = {} }) =>
    Api.get(`/sites/${siteId}/wallet/reports`, { params }),

  // Account Heads (Site-scoped read for PI/PD)
  listSiteAccountHeadsApi: ({ siteId, params = {} }) =>
    Api.get(`/sites/${siteId}/wallet/account-heads`, { params }),

  // Funding Requests (PI)
  listSiteFundingRequestsApi: ({ siteId, params = {} }) =>
    Api.get(`/sites/${siteId}/wallet/funding-requests`, { params }),

  getSiteFundingRequestApi: ({ siteId, requestId }) =>
    Api.get(`/sites/${siteId}/wallet/funding-requests/${requestId}`),

  listSiteFundingRequestAttemptsApi: ({ siteId, requestId }) =>
    Api.get(`/sites/${siteId}/wallet/funding-requests/${requestId}/attempts`),

  createSiteFundingRequestApi: ({ siteId, values }) =>
    Api.post(`/sites/${siteId}/wallet/funding-requests`, values),

  updateSiteFundingRequestApi: ({ siteId, requestId, values }) =>
    Api.patch(`/sites/${siteId}/wallet/funding-requests/${requestId}`, values),

  submitSiteFundingRequestApi: ({ siteId, requestId, values }) =>
    Api.post(`/sites/${siteId}/wallet/funding-requests/${requestId}/submit`, values),

  cancelSiteFundingRequestApi: ({ siteId, requestId, values }) =>
    Api.post(`/sites/${siteId}/wallet/funding-requests/${requestId}/cancel`, values),

  // Transfers & Receipt Confirmation (PI)
  getSiteTransferApi: ({ siteId, transferId }) =>
    Api.get(`/sites/${siteId}/wallet/transfers/${transferId}`),

  confirmSiteTransferReceiptApi: ({ siteId, transferId, values }) =>
    Api.post(`/sites/${siteId}/wallet/transfers/${transferId}/confirm`, values),

  // Expenses, Vouchers & Evidence (PI)
  listSiteExpensesApi: ({ siteId, params = {} }) =>
    Api.get(`/sites/${siteId}/wallet/expenses`, { params }),

  getSiteExpenseApi: ({ siteId, expenseId }) =>
    Api.get(`/sites/${siteId}/wallet/expenses/${expenseId}`),

  postSiteExpenseApi: ({ siteId, values }) =>
    Api.post(`/sites/${siteId}/wallet/expenses`, values),

  getSiteVoucherApi: ({ siteId, voucherId }) =>
    Api.get(`/sites/${siteId}/wallet/vouchers/${voucherId}`),

  getSiteVoucherPrintHtmlApi: ({ siteId, voucherId }) =>
    Api.get(`/sites/${siteId}/wallet/vouchers/${voucherId}/print`, {
      responseType: "text",
    }),

  getSiteVoucherPdfApi: ({ siteId, voucherId }) =>
    Api.get(`/sites/${siteId}/wallet/vouchers/${voucherId}/pdf`, {
      responseType: "blob",
    }),

  getSiteTransferPdfApi: ({ siteId, transferId }) =>
    Api.get(`/sites/${siteId}/wallet/transfers/${transferId}/pdf`, {
      responseType: "blob",
    }),

  uploadSiteDocumentApi: ({ siteId, formData }) =>
    Api.post(`/org/sites/${siteId}/documents/upload`, formData),

  attachSignedVoucherApi: ({ siteId, voucherId, values }) =>
    Api.post(`/sites/${siteId}/wallet/vouchers/${voucherId}/signed-document`, values),

  attachLedgerEvidenceApi: ({ siteId, entryId, values }) =>
    Api.post(`/sites/${siteId}/wallet/ledger/${entryId}/documents`, values),

  // Reversal Request (PI)
  requestLedgerReversalApi: ({ siteId, entryId, values }) =>
    Api.post(`/sites/${siteId}/wallet/ledger/${entryId}/reversal-requests`, values),
};

export default walletApi;
