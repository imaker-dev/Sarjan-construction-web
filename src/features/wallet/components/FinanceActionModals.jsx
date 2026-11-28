import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import ModalBasic from "@components/ui/ModalBasic";
import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import { TextareaField } from "@components/fields/TextareaField";
import {
  formatInr,
  formikFieldProps,
  newIdempotencyKey,
} from "@utils/wallet.utils";

/* -------------------------------------------------------------------------- */
/*  Create Site Wallet Modal                                                  */
/* -------------------------------------------------------------------------- */
export function CreateSiteWalletModal({
  isOpen,
  onClose,
  sitesList = [],
  onSubmit,
  isSubmitting,
}) {
  const formik = useFormik({
    initialValues: { siteId: "" },
    validationSchema: Yup.object({
      siteId: Yup.string().required("Please select a site"),
    }),
    onSubmit: async (values, { resetForm }) => {
      await onSubmit(values.siteId);
      resetForm();
    },
  });

  return (
    <ModalBasic
      id="create-site-wallet-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Create Site Wallet"
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Provisions a new INR petty-cash wallet for the selected site with an
          initial balance of ₹ 0.00.
        </p>

        <SelectField
          label="Site"
          {...formikFieldProps(formik, "siteId")}
          required
          placeholder="Select site"
          options={sitesList.map((s) => ({
            value: s.id,
            label: s.code ? `${s.name} (${s.code})` : s.name,
          }))}
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-sm"
          >
            {isSubmitting ? "Creating..." : "Create Wallet"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}

/* -------------------------------------------------------------------------- */
/*  Account Head Create / Edit Modal                                          */
/* -------------------------------------------------------------------------- */
export function AccountHeadModal({
  isOpen,
  onClose,
  editingHead,
  onSubmit,
  isSubmitting,
}) {
  const isEdit = Boolean(editingHead);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      code: editingHead?.code || "",
      name: editingHead?.name || "",
      status: editingHead?.status || "ACTIVE",
    },
    validationSchema: Yup.object({
      code: isEdit
        ? Yup.string()
        : Yup.string().trim().required("Code is required"),
      name: Yup.string().trim().required("Name is required"),
      status: Yup.string().oneOf(["ACTIVE", "INACTIVE"]),
    }),
    onSubmit: async (values) => {
      if (isEdit) {
        await onSubmit({
          accountHeadId: editingHead.id,
          values: {
            name: values.name.trim(),
            status: values.status,
            expectedVersion: editingHead.version ?? 0,
          },
        });
      } else {
        await onSubmit({
          code: values.code.trim(),
          name: values.name.trim(),
        });
      }
    },
  });

  return (
    <ModalBasic
      id="account-head-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Update Account Head" : "New Account Head"}
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
        <InputField
          label="Account Code"
          {...formikFieldProps(formik, "code")}
          disabled={isEdit}
          required={!isEdit}
          placeholder="e.g. 5010"
        />

        <InputField
          label="Account Head Name"
          {...formikFieldProps(formik, "name")}
          required
          placeholder="e.g. Materials"
        />

        {isEdit && (
          <SelectField
            label="Status"
            {...formikFieldProps(formik, "status")}
            options={[
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
          />
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-sm"
          >
            {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}

/* -------------------------------------------------------------------------- */
/*  Decide Funding Request Modal (APPROVE / REJECT / RETURN)                  */
/* -------------------------------------------------------------------------- */
export function DecideFundingModal({
  isOpen,
  onClose,
  requestDetail,
  onSubmit,
  isSubmitting,
}) {
  const req = requestDetail?.request || requestDetail || {};
  const attempts = Array.isArray(requestDetail?.attempts)
    ? requestDetail.attempts
    : [];
  const currentAttempt =
    attempts.find((a) => a.id === req.currentAttemptId) ||
    attempts[attempts.length - 1] ||
    null;

  const taskId = currentAttempt?.approvalTaskId || req.approvalTaskId;
  const maxAmount = Number(currentAttempt?.amount || req.draftAmount || 0);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      action: "APPROVE",
      approvedAmount: maxAmount ? maxAmount.toFixed(2) : "",
      reason: "",
    },
    validationSchema: Yup.object({
      action: Yup.string().oneOf(["APPROVE", "REJECT", "RETURN"]).required(),
      approvedAmount: Yup.number().when("action", {
        is: "APPROVE",
        then: (s) =>
          s
            .typeError("Enter a valid INR amount")
            .positive("Amount must be greater than 0")
            .max(maxAmount || Infinity, `Cannot exceed ${formatInr(maxAmount)}`)
            .required("Approved amount is required"),
        otherwise: (s) => s.notRequired(),
      }),
      reason: Yup.string().when("action", {
        is: (v) => v === "REJECT" || v === "RETURN",
        then: (s) => s.trim().required("Reason is required"),
        otherwise: (s) => s.notRequired(),
      }),
    }),
    onSubmit: async (values) => {
      if (!taskId) {
        toast.error("No pending approval task found for this request.");
        return;
      }
      const payload =
        values.action === "APPROVE"
          ? {
              action: "APPROVE",
              idempotencyKey: newIdempotencyKey("fm-dec"),
              decisionPayload: {
                approvedAmount: Number(values.approvedAmount).toFixed(2),
              },
            }
          : {
              action: values.action,
              idempotencyKey: newIdempotencyKey("fm-dec"),
              reason: values.reason.trim(),
            };
      await onSubmit({ taskId, values: payload });
    },
  });

  return (
    <ModalBasic
      id="decide-funding-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Review Funding Request"
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-800/30 p-3 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Requested Amount</span>
            <span className="font-bold text-slate-800 dark:text-white tabular-nums">
              {formatInr(maxAmount)}
            </span>
          </div>
          <div className="text-slate-500 dark:text-slate-400">
            {req.draftPurpose || currentAttempt?.purpose || "—"}
          </div>
        </div>

        <SelectField
          label="Decision"
          {...formikFieldProps(formik, "action")}
          required
          options={[
            { value: "APPROVE", label: "Approve (set approved amount)" },
            { value: "RETURN", label: "Return to PI for changes" },
            { value: "REJECT", label: "Reject (terminal)" },
          ]}
        />

        {formik.values.action === "APPROVE" ? (
          <InputField
            label="Approved Amount (INR)"
            {...formikFieldProps(formik, "approvedAmount")}
            type="number"
            required
          />
        ) : (
          <TextareaField
            label="Reason"
            {...formikFieldProps(formik, "reason")}
            required
            rows={3}
            placeholder="Explain why this request is returned or rejected..."
          />
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !taskId}
            className="btn btn-primary btn-sm"
          >
            {isSubmitting ? "Submitting..." : "Submit Decision"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}

/* -------------------------------------------------------------------------- */
/*  Record Transfer Modal                                                     */
/* -------------------------------------------------------------------------- */
export function RecordTransferModal({
  isOpen,
  onClose,
  request,
  onSubmit,
  isSubmitting,
}) {
  const remaining = Math.max(
    0,
    Number(request?.approvedAmount || 0) - Number(request?.confirmedAmount || 0)
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      amount: remaining ? remaining.toFixed(2) : "",
      reference: "",
      transferredAt: new Date().toISOString().slice(0, 16),
    },
    validationSchema: Yup.object({
      amount: Yup.number()
        .typeError("Enter a valid amount")
        .positive("Amount must be greater than 0")
        .required("Transfer amount is required"),
      reference: Yup.string().trim().required("UTR / bank reference is required"),
      transferredAt: Yup.string().required("Transfer date/time is required"),
    }),
    onSubmit: async (values) => {
      await onSubmit({
        requestId: request.id,
        values: {
          amount: Number(values.amount).toFixed(2),
          reference: values.reference.trim(),
          transferredAt: new Date(values.transferredAt).toISOString(),
          idempotencyKey: newIdempotencyKey("fm-tr"),
        },
      });
    },
  });

  return (
    <ModalBasic
      id="record-transfer-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Record Bank Transfer"
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Recording a transfer does not credit the site wallet yet. The wallet
          is credited only when the requesting PI confirms physical receipt.
        </p>

        <InputField
          label="Transfer Amount (INR)"
          {...formikFieldProps(formik, "amount")}
          type="number"
          required
        />

        <InputField
          label="UTR / Bank Reference"
          {...formikFieldProps(formik, "reference")}
          required
          placeholder="e.g. UTR-NEFT-88214"
        />

        <InputField
          label="Transferred At"
          {...formikFieldProps(formik, "transferredAt")}
          type="datetime-local"
          required
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-sm"
          >
            {isSubmitting ? "Recording..." : "Record Transfer"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}

/* -------------------------------------------------------------------------- */
/*  Resolve Dispute / Close Short / Execute Reversal Modals                   */
/* -------------------------------------------------------------------------- */
export function ResolveDisputeModal({
  isOpen,
  onClose,
  transfer,
  onSubmit,
  isSubmitting,
}) {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      resolution: "ACKNOWLEDGED",
      note: "",
    },
    validationSchema: Yup.object({
      resolution: Yup.string()
        .oneOf(["ACKNOWLEDGED", "SUPPLEMENTARY_PENDING"])
        .required(),
      note: Yup.string().trim().required("Resolution note is required"),
    }),
    onSubmit: async (values) => {
      await onSubmit({
        transferId: transfer.id,
        values: {
          resolution: values.resolution,
          note: values.note.trim(),
          idempotencyKey: newIdempotencyKey("fm-disp"),
        },
      });
    },
  });

  return (
    <ModalBasic
      id="resolve-dispute-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Resolve Transfer Dispute"
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
        <SelectField
          label="Resolution"
          {...formikFieldProps(formik, "resolution")}
          required
          options={[
            { value: "ACKNOWLEDGED", label: "Acknowledged (no further transfer)" },
            { value: "SUPPLEMENTARY_PENDING", label: "Supplementary transfer pending" },
          ]}
        />
        <TextareaField
          label="Note"
          {...formikFieldProps(formik, "note")}
          required
          rows={3}
          placeholder="Document bank fee or discrepancy resolution..."
        />
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm">
            {isSubmitting ? "Resolving..." : "Resolve Dispute"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}

export function CloseShortModal({
  isOpen,
  onClose,
  request,
  onSubmit,
  isSubmitting,
}) {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { reason: "" },
    validationSchema: Yup.object({
      reason: Yup.string().trim().required("Close-short reason is required"),
    }),
    onSubmit: async (values) => {
      await onSubmit({
        requestId: request.id,
        values: {
          reason: values.reason.trim(),
          idempotencyKey: newIdempotencyKey("fm-close"),
        },
      });
    },
  });

  return (
    <ModalBasic
      id="close-short-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Close Request Short"
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Writes off the remaining approved amount (
          {formatInr(
            Math.max(
              0,
              Number(request?.approvedAmount || 0) -
                Number(request?.confirmedAmount || 0)
            )
          )}
          ). This action is terminal.
        </p>
        <TextareaField
          label="Reason"
          {...formikFieldProps(formik, "reason")}
          required
          rows={3}
          placeholder="e.g. Remaining amount will not be transferred"
        />
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm">
            {isSubmitting ? "Closing..." : "Close Short"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}

export function ExecuteReversalModal({
  isOpen,
  onClose,
  reversalRequest,
  onSubmit,
  isSubmitting,
}) {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { reason: "" },
    validationSchema: Yup.object({
      reason: Yup.string().trim().required("Confirmation reason is required"),
    }),
    onSubmit: async (values) => {
      await onSubmit({
        entryId: reversalRequest.ledgerEntryId,
        values: {
          reason: values.reason.trim(),
          reversalRequestId: reversalRequest.id,
          idempotencyKey: newIdempotencyKey("fm-rev"),
        },
      });
    },
  });

  return (
    <ModalBasic
      id="execute-reversal-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Execute Ledger Reversal"
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
        <div className="rounded-xl border border-amber-200/80 dark:border-amber-500/30 bg-amber-50/40 dark:bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
          PI Reason: {reversalRequest?.reason || "—"}
        </div>
        <TextareaField
          label="Finance Confirmation Reason"
          {...formikFieldProps(formik, "reason")}
          required
          rows={3}
          placeholder="e.g. Duplicate expense confirmed"
        />
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm">
            {isSubmitting ? "Executing..." : "Execute Reversal"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reduce Approved Amount Modal                                              */
/* -------------------------------------------------------------------------- */
export function ReduceAmountModal({
  isOpen,
  onClose,
  request,
  onSubmit,
  isSubmitting,
}) {
  const currentApproved = Number(request?.approvedAmount || 0);
  const confirmed = Number(request?.confirmedAmount || 0);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      approvedAmount: currentApproved ? currentApproved.toFixed(2) : "",
      reason: "",
    },
    validationSchema: Yup.object({
      approvedAmount: Yup.number()
        .typeError("Enter a valid INR amount")
        .min(confirmed, `Cannot be less than confirmed ${formatInr(confirmed)}`)
        .max(currentApproved || Infinity, `Must not exceed ${formatInr(currentApproved)}`)
        .required("New approved amount is required"),
      reason: Yup.string().trim().required("Reason is required"),
    }),
    onSubmit: async (values) => {
      await onSubmit({
        requestId: request.id,
        values: {
          approvedAmount: Number(values.approvedAmount).toFixed(2),
          reason: values.reason.trim(),
          expectedVersion: request.version ?? 0,
          idempotencyKey: newIdempotencyKey("fm-red"),
        },
      });
    },
  });

  return (
    <ModalBasic
      id="reduce-approved-amount-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Reduce Approved Amount"
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-800/30 p-3 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Current Approved</span>
            <span className="font-bold text-slate-800 dark:text-white tabular-nums">
              {formatInr(currentApproved)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Already Confirmed</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatInr(confirmed)}
            </span>
          </div>
        </div>

        <InputField
          label="New Approved Amount (INR)"
          {...formikFieldProps(formik, "approvedAmount")}
          type="number"
          required
        />

        <TextareaField
          label="Reason for Reduction"
          {...formikFieldProps(formik, "reason")}
          required
          rows={3}
          placeholder="e.g. Budget revised after partial payment"
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm">
            {isSubmitting ? "Updating..." : "Reduce Amount"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}

/* -------------------------------------------------------------------------- */
/*  Cancel Unconfirmed Transfer Modal                                         */
/* -------------------------------------------------------------------------- */
export function CancelTransferModal({
  isOpen,
  onClose,
  transfer,
  onSubmit,
  isSubmitting,
}) {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { reason: "" },
    validationSchema: Yup.object({
      reason: Yup.string().trim().required("Cancellation reason is required"),
    }),
    onSubmit: async (values) => {
      await onSubmit({
        transferId: transfer.id,
        values: {
          reason: values.reason.trim(),
          idempotencyKey: newIdempotencyKey("fm-tr-can"),
        },
      });
    },
  });

  return (
    <ModalBasic
      id="cancel-transfer-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Unconfirmed Transfer"
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Cancels recorded transfer{" "}
          <span className="font-mono font-semibold">{transfer?.reference}</span>{" "}
          ({formatInr(transfer?.amount)}) before PI confirmation.
        </p>

        <TextareaField
          label="Cancellation Reason"
          {...formikFieldProps(formik, "reason")}
          required
          rows={3}
          placeholder="e.g. Wrong UTR entered / transfer bounced"
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Back
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm">
            {isSubmitting ? "Cancelling..." : "Cancel Transfer"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}
