import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import walletApi from "@store/api/wallet.api";
import { toast } from "sonner";

const errMsg = (err, fallback) =>
  err?.message || err?.error?.message || fallback;

// --------------------------------------------------
// FINANCE THUNKS
// --------------------------------------------------

export const createSiteWallet = createAsyncThunk(
  "wallet/createSiteWallet",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.createSiteWalletApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const listFinanceWallets = createAsyncThunk(
  "wallet/listFinanceWallets",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await walletApi.listFinanceWalletsApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getFinanceWalletLedger = createAsyncThunk(
  "wallet/getFinanceWalletLedger",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.getFinanceWalletLedgerApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const listAccountHeads = createAsyncThunk(
  "wallet/listAccountHeads",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await walletApi.listAccountHeadsApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createAccountHead = createAsyncThunk(
  "wallet/createAccountHead",
  async (values, { rejectWithValue }) => {
    try {
      const res = await walletApi.createAccountHeadApi(values);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateAccountHead = createAsyncThunk(
  "wallet/updateAccountHead",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.updateAccountHeadApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const listFinanceFundingRequests = createAsyncThunk(
  "wallet/listFinanceFundingRequests",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await walletApi.listFinanceFundingRequestsApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getFinanceFundingRequest = createAsyncThunk(
  "wallet/getFinanceFundingRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      const res = await walletApi.getFinanceFundingRequestApi(requestId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const decideApprovalTask = createAsyncThunk(
  "wallet/decideApprovalTask",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.decideApprovalTaskApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const recordWalletTransfer = createAsyncThunk(
  "wallet/recordWalletTransfer",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.recordWalletTransferApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const resolveWalletDispute = createAsyncThunk(
  "wallet/resolveWalletDispute",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.resolveWalletDisputeApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const closeShortFundingRequest = createAsyncThunk(
  "wallet/closeShortFundingRequest",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.closeShortFundingRequestApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const reduceApprovedAmount = createAsyncThunk(
  "wallet/reduceApprovedAmount",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.reduceApprovedAmountApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const cancelWalletTransfer = createAsyncThunk(
  "wallet/cancelWalletTransfer",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.cancelWalletTransferApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getFinanceWalletsReports = createAsyncThunk(
  "wallet/getFinanceWalletsReports",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await walletApi.getFinanceWalletsReportsApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getFinanceWalletDetailReport = createAsyncThunk(
  "wallet/getFinanceWalletDetailReport",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.getFinanceWalletDetailReportApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const listFinanceReversalRequests = createAsyncThunk(
  "wallet/listFinanceReversalRequests",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await walletApi.listFinanceReversalRequestsApi(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const executeLedgerReversal = createAsyncThunk(
  "wallet/executeLedgerReversal",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.executeLedgerReversalApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// --------------------------------------------------
// SITE THUNKS (PI + PD)
// --------------------------------------------------

export const listSiteAccountHeads = createAsyncThunk(
  "wallet/listSiteAccountHeads",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.listSiteAccountHeadsApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getSiteWallet = createAsyncThunk(
  "wallet/getSiteWallet",
  async (siteId, { rejectWithValue }) => {
    try {
      const res = await walletApi.getSiteWalletApi(siteId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getSiteWalletLedger = createAsyncThunk(
  "wallet/getSiteWalletLedger",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.getSiteWalletLedgerApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getSiteWalletReports = createAsyncThunk(
  "wallet/getSiteWalletReports",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.getSiteWalletReportsApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const listSiteFundingRequests = createAsyncThunk(
  "wallet/listSiteFundingRequests",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.listSiteFundingRequestsApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getSiteFundingRequest = createAsyncThunk(
  "wallet/getSiteFundingRequest",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.getSiteFundingRequestApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createSiteFundingRequest = createAsyncThunk(
  "wallet/createSiteFundingRequest",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.createSiteFundingRequestApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateSiteFundingRequest = createAsyncThunk(
  "wallet/updateSiteFundingRequest",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.updateSiteFundingRequestApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const submitSiteFundingRequest = createAsyncThunk(
  "wallet/submitSiteFundingRequest",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.submitSiteFundingRequestApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const cancelSiteFundingRequest = createAsyncThunk(
  "wallet/cancelSiteFundingRequest",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.cancelSiteFundingRequestApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const confirmSiteTransferReceipt = createAsyncThunk(
  "wallet/confirmSiteTransferReceipt",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.confirmSiteTransferReceiptApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const listSiteExpenses = createAsyncThunk(
  "wallet/listSiteExpenses",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.listSiteExpensesApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const postSiteExpense = createAsyncThunk(
  "wallet/postSiteExpense",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.postSiteExpenseApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getSiteVoucher = createAsyncThunk(
  "wallet/getSiteVoucher",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.getSiteVoucherApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const attachSignedVoucher = createAsyncThunk(
  "wallet/attachSignedVoucher",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.attachSignedVoucherApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const attachLedgerEvidence = createAsyncThunk(
  "wallet/attachLedgerEvidence",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.attachLedgerEvidenceApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const requestLedgerReversal = createAsyncThunk(
  "wallet/requestLedgerReversal",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await walletApi.requestLedgerReversalApi(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  // Finance state
  financeWallets: [],
  financeWalletLedger: [],
  accountHeads: [],
  financeFundingRequests: [],
  financeFundingDetail: null,
  financeReversalRequests: [],
  financeWalletsReports: null,
  financeWalletDetailReport: null,

  // Site state
  siteWalletSummary: null,
  siteLedger: [],
  siteReports: null,
  siteFundingRequests: [],
  siteFundingDetail: null,
  siteExpenses: [],
  siteVoucherDetail: null,

  // Loading flags
  isLoadingFinanceWallets: false,
  isLoadingFinanceLedger: false,
  isLoadingAccountHeads: false,
  isLoadingFinanceQueue: false,
  isLoadingFinanceReversals: false,
  isLoadingFinanceReports: false,
  isLoadingSiteWallet: false,
  isLoadingSiteLedger: false,
  isLoadingSiteReports: false,
  isLoadingSiteRequests: false,
  isLoadingSiteExpenses: false,
  isLoadingVoucher: false,
  isSubmitting: false,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    clearSiteWalletState: (state) => {
      state.siteWalletSummary = null;
      state.siteLedger = [];
      state.siteReports = null;
      state.siteFundingRequests = [];
      state.siteFundingDetail = null;
      state.siteExpenses = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listFinanceWallets.pending, (state) => {
        state.isLoadingFinanceWallets = true;
      })
      .addCase(listFinanceWallets.fulfilled, (state, action) => {
        state.isLoadingFinanceWallets = false;
        state.financeWallets = action.payload;
      })
      .addCase(listFinanceWallets.rejected, (state, action) => {
        state.isLoadingFinanceWallets = false;
        toast.error(errMsg(action.payload, "Failed to load site wallets"));
      })

      .addCase(getFinanceWalletLedger.pending, (state) => {
        state.isLoadingFinanceLedger = true;
      })
      .addCase(getFinanceWalletLedger.fulfilled, (state, action) => {
        state.isLoadingFinanceLedger = false;
        state.financeWalletLedger = action.payload;
      })
      .addCase(getFinanceWalletLedger.rejected, (state, action) => {
        state.isLoadingFinanceLedger = false;
        toast.error(errMsg(action.payload, "Failed to load wallet statement"));
      })

      .addCase(listAccountHeads.pending, (state) => {
        state.isLoadingAccountHeads = true;
      })
      .addCase(listAccountHeads.fulfilled, (state, action) => {
        state.isLoadingAccountHeads = false;
        state.accountHeads = action.payload;
      })
      .addCase(listAccountHeads.rejected, (state) => {
        state.isLoadingAccountHeads = false;
      })

      .addCase(listSiteAccountHeads.pending, (state) => {
        state.isLoadingAccountHeads = true;
      })
      .addCase(listSiteAccountHeads.fulfilled, (state, action) => {
        state.isLoadingAccountHeads = false;
        state.accountHeads = action.payload;
      })
      .addCase(listSiteAccountHeads.rejected, (state) => {
        state.isLoadingAccountHeads = false;
      })

      .addCase(listFinanceFundingRequests.pending, (state) => {
        state.isLoadingFinanceQueue = true;
      })
      .addCase(listFinanceFundingRequests.fulfilled, (state, action) => {
        state.isLoadingFinanceQueue = false;
        state.financeFundingRequests = action.payload;
      })
      .addCase(listFinanceFundingRequests.rejected, (state, action) => {
        state.isLoadingFinanceQueue = false;
        toast.error(errMsg(action.payload, "Failed to load funding queue"));
      })

      .addCase(getFinanceFundingRequest.fulfilled, (state, action) => {
        state.financeFundingDetail = action.payload;
      })

      .addCase(listFinanceReversalRequests.pending, (state) => {
        state.isLoadingFinanceReversals = true;
      })
      .addCase(listFinanceReversalRequests.fulfilled, (state, action) => {
        state.isLoadingFinanceReversals = false;
        state.financeReversalRequests = action.payload;
      })
      .addCase(listFinanceReversalRequests.rejected, (state, action) => {
        state.isLoadingFinanceReversals = false;
        toast.error(errMsg(action.payload, "Failed to load reversal requests"));
      })

      .addCase(getFinanceWalletsReports.pending, (state) => {
        state.isLoadingFinanceReports = true;
      })
      .addCase(getFinanceWalletsReports.fulfilled, (state, action) => {
        state.isLoadingFinanceReports = false;
        state.financeWalletsReports = action.payload;
      })
      .addCase(getFinanceWalletsReports.rejected, (state, action) => {
        state.isLoadingFinanceReports = false;
        toast.error(errMsg(action.payload, "Failed to load finance wallet reports"));
      })

      .addCase(getFinanceWalletDetailReport.fulfilled, (state, action) => {
        state.financeWalletDetailReport = action.payload;
      })

      .addCase(getSiteWallet.pending, (state) => {
        state.isLoadingSiteWallet = true;
      })
      .addCase(getSiteWallet.fulfilled, (state, action) => {
        state.isLoadingSiteWallet = false;
        state.siteWalletSummary = action.payload;
      })
      .addCase(getSiteWallet.rejected, (state) => {
        state.isLoadingSiteWallet = false;
        state.siteWalletSummary = null;
      })

      .addCase(getSiteWalletLedger.pending, (state) => {
        state.isLoadingSiteLedger = true;
      })
      .addCase(getSiteWalletLedger.fulfilled, (state, action) => {
        state.isLoadingSiteLedger = false;
        state.siteLedger = action.payload;
      })
      .addCase(getSiteWalletLedger.rejected, (state) => {
        state.isLoadingSiteLedger = false;
      })

      .addCase(getSiteWalletReports.pending, (state) => {
        state.isLoadingSiteReports = true;
      })
      .addCase(getSiteWalletReports.fulfilled, (state, action) => {
        state.isLoadingSiteReports = false;
        state.siteReports = action.payload;
      })
      .addCase(getSiteWalletReports.rejected, (state) => {
        state.isLoadingSiteReports = false;
      })

      .addCase(listSiteFundingRequests.pending, (state) => {
        state.isLoadingSiteRequests = true;
      })
      .addCase(listSiteFundingRequests.fulfilled, (state, action) => {
        state.isLoadingSiteRequests = false;
        state.siteFundingRequests = action.payload;
      })
      .addCase(listSiteFundingRequests.rejected, (state) => {
        state.isLoadingSiteRequests = false;
      })

      .addCase(getSiteFundingRequest.fulfilled, (state, action) => {
        state.siteFundingDetail = action.payload;
      })

      .addCase(listSiteExpenses.pending, (state) => {
        state.isLoadingSiteExpenses = true;
      })
      .addCase(listSiteExpenses.fulfilled, (state, action) => {
        state.isLoadingSiteExpenses = false;
        state.siteExpenses = action.payload;
      })
      .addCase(listSiteExpenses.rejected, (state) => {
        state.isLoadingSiteExpenses = false;
      })

      .addCase(getSiteVoucher.pending, (state) => {
        state.isLoadingVoucher = true;
      })
      .addCase(getSiteVoucher.fulfilled, (state, action) => {
        state.isLoadingVoucher = false;
        state.siteVoucherDetail = action.payload;
      })
      .addCase(getSiteVoucher.rejected, (state, action) => {
        state.isLoadingVoucher = false;
        toast.error(errMsg(action.payload, "Failed to load cash voucher"));
      })

      // Mutation loading & toast handling
      .addMatcher(
        (action) =>
          action.type.startsWith("wallet/") &&
          action.type.endsWith("/pending") &&
          !action.type.includes("list") &&
          !action.type.includes("get"),
        (state) => {
          state.isSubmitting = true;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("wallet/") &&
          action.type.endsWith("/fulfilled") &&
          !action.type.includes("list") &&
          !action.type.includes("get"),
        (state) => {
          state.isSubmitting = false;
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("wallet/") &&
          action.type.endsWith("/rejected") &&
          !action.type.includes("list") &&
          !action.type.includes("get"),
        (state, action) => {
          state.isSubmitting = false;
          toast.error(errMsg(action.payload, "Wallet action failed"));
        }
      );
  },
});

export const { clearSiteWalletState } = walletSlice.actions;
export default walletSlice.reducer;
