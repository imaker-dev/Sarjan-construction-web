export const formatInr = (value) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return "₹ 0.00";
  return `₹ ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const newIdempotencyKey = (prefix = "wallet") => {
  const rand =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 12)
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}-${rand}`.slice(0, 80);
};

export const WALLET_STATUS_TONES = {
  ACTIVE: "emerald",
  INACTIVE: "slate",
  DRAFT: "slate",
  SUBMITTED: "indigo",
  RETURNED: "amber",
  APPROVED: "emerald",
  REJECTED: "rose",
  CANCELLED: "slate",
  RECORDED: "indigo",
  CONFIRMED: "emerald",
  DISPUTED: "rose",
  PARTIALLY_FUNDED: "amber",
  FUNDED: "emerald",
  CLOSED: "slate",
  CLOSED_SHORT: "amber",
  POSTED: "emerald",
  REVERSED: "rose",
  REQUESTED: "amber",
  EXECUTED: "emerald",
  CREDIT_FUNDING: "emerald",
  DEBIT_EXPENSE: "rose",
  REVERSAL_CREDIT: "indigo",
  REVERSAL_DEBIT: "amber",
};

export const LEDGER_TYPE_LABELS = {
  CREDIT_FUNDING: "Funding Credit",
  DEBIT_EXPENSE: "Expense Debit",
  REVERSAL_CREDIT: "Reversal Credit",
  REVERSAL_DEBIT: "Reversal Debit",
};

export const formikFieldProps = (formik, name) => ({
  name,
  value: formik.values[name],
  onChange: formik.handleChange,
  onBlur: formik.handleBlur,
  error: formik.touched[name] && formik.errors[name],
});

export const openPdfBlob = (blobData) => {
  const blob =
    blobData instanceof Blob
      ? blobData
      : new Blob([blobData], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const formatDateTimeParts = (iso) => {
  if (!iso) return { date: "—", time: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: String(iso), time: "" };
  return {
    date: d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).toUpperCase(),
  };
};

export const isCreditEntry = (type) =>
  type === "CREDIT_FUNDING" || type === "REVERSAL_CREDIT";

export const isDebitEntry = (type) =>
  type === "DEBIT_EXPENSE" || type === "REVERSAL_DEBIT";
