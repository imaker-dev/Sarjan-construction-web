import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Eye,
  FileText,
  Files,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Download,
} from "lucide-react";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import DataTable from "@components/ui/DataTable";
import ModalAction from "@components/ui/ModalAction";

import {
  downloadEmployeeDocument,
  getEmployeeDocuments,
  verifyEmployeeDocument,
} from "@store/slices/employee.slice";

import { useQueryParams } from "@hooks/useQueryParams";
import { formatDate } from "@utils/date.utils";
import { formatText } from "@utils/text.utils";
import { TextareaField } from "@components/fields/TextareaField";
import { handleResponse } from "@utils/async.utils";
import { downloadFile } from "@utils/download.utils";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const Muted = ({ children }) => (
  <span className="text-slate-400 dark:text-slate-500">{children}</span>
);

const getVerificationStyle = (status) => {
  const styles = {
    VERIFIED:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    PENDING:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    REJECTED: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  };

  return (
    styles[status] ||
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
  );
};

// --------------------------------------------------
// Employee Documents Page
// --------------------------------------------------

const EmployeeDocumentsPage = () => {
  const dispatch = useDispatch();
  const { get } = useQueryParams();

  const employeeId = get("employeeId");

  const {
    isLoadingEmployeeDocuments,
    employeeDocuments,
    isVerifyingEmployeeDocument,
    isDownloadingEmployeeDocument,
  } = useSelector((state) => state.employee);

  // --------------------------------------------------
  // Modal States
  // --------------------------------------------------

  const [verificationModal, setVerificationModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // --------------------------------------------------
  // Fetch Documents
  // --------------------------------------------------

  useEffect(() => {
    if (!employeeId) return;

    dispatch(getEmployeeDocuments(employeeId));
  }, [dispatch, employeeId]);

  // --------------------------------------------------
  // Table Data
  // --------------------------------------------------

  const rows = useMemo(
    () => (Array.isArray(employeeDocuments) ? employeeDocuments : []),
    [employeeDocuments],
  );

  // --------------------------------------------------
  // Verification Actions
  // --------------------------------------------------

  const handleOpenVerification = useCallback((doc, status) => {
    setVerificationModal({ doc, status });
    setRejectionReason("");
  }, []);

  const handleCloseVerification = useCallback(() => {
    if (isVerifyingEmployeeDocument) return;

    setVerificationModal(null);
    setRejectionReason("");
  }, [isVerifyingEmployeeDocument]);

  const handleSubmitVerification = async () => {
    if (!verificationModal) return;

    const { doc, status } = verificationModal;

    if (status === "REJECTED" && !rejectionReason.trim()) return;

    try {
      await dispatch(
        verifyEmployeeDocument({
          id: employeeId,
          docId: doc.id,
          values: {
            status,
            expectedVersion: doc.version ?? 0,
            ...(status === "REJECTED" && {
              rejectionReason: rejectionReason.trim(),
            }),
          },
        }),
      ).unwrap();

      setVerificationModal(null);
      setRejectionReason("");
    } catch (error) {
      // Error notification is handled by Redux.
    }
  };

  const downloadDocument = async (doc) => {
    await handleResponse(
      dispatch(downloadEmployeeDocument({ employeeId, docId: doc.id })),
      (res) => {
        downloadFile({ data: res.payload, fileName: doc.title });
      },
    );
  };
  // --------------------------------------------------
  // Table Columns
  // --------------------------------------------------

  const columns = useMemo(
    () => [
      {
        key: "title",
        header: "Document",
        render: (doc) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <FileText size={18} strokeWidth={1.7} />
            </div>

            <div className="min-w-0 leading-tight">
              <div className="max-w-[280px] truncate text-[13.5px] font-medium text-slate-800 dark:text-slate-100">
                {doc.title || doc.document?.originalFileName || "Untitled"}
              </div>

              <div className="mt-1 text-[12px] text-slate-400 dark:text-slate-500">
                {formatText(doc.documentType)}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "documentNumber",
        header: "Document Number",
        render: (doc) =>
          doc.documentNumber ? (
            <span className="text-[13px] text-slate-600 dark:text-slate-300">
              {doc.documentNumber}
            </span>
          ) : (
            <Muted>Not provided</Muted>
          ),
      },
      {
        key: "issuingAuthority",
        header: "Issuing Authority",
        render: (doc) =>
          doc.issuingAuthority ? (
            <span className="text-[13px] text-slate-600 dark:text-slate-300">
              {doc.issuingAuthority}
            </span>
          ) : (
            <Muted>—</Muted>
          ),
      },
      {
        key: "createdAt",
        header: "Uploaded",
        className: "whitespace-nowrap",
        render: (doc) => formatDate(doc.createdAt),
      },
      {
        key: "verificationStatus",
        header: "Verification",
        render: (doc) => (
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold ${getVerificationStyle(doc.verificationStatus)}`}
              >
                {formatText(doc.verificationStatus)}
              </span>

              {doc.verificationStatus === "REJECTED" && doc.rejectionReason && (
                <span
                  title={doc.rejectionReason}
                  className="max-w-[160px] truncate text-xs text-red-500"
                >
                  {doc.rejectionReason}
                </span>
              )}
            </div>

            {["VERIFIED", "REJECTED"].includes(doc.verificationStatus) && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {doc.verifiedAt ? formatDate(doc.verifiedAt) : "—"}
                {" · "}
                {doc.verifiedBy?.loginId || "Unknown"}
              </span>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  // --------------------------------------------------
  // Table Actions
  // --------------------------------------------------

  const actions = useMemo(
    () => [
      {
        label: "Download",
        icon: Download,
        onClick: (doc) => downloadDocument(doc),
      },
      {
        label: "Verify",
        icon: CheckCircle2,
        onClick: (doc) => handleOpenVerification(doc, "VERIFIED"),
        hidden: (doc) => doc.verificationStatus !== "PENDING",
      },
      {
        label: "Reject",
        icon: XCircle,
        onClick: (doc) => handleOpenVerification(doc, "REJECTED"),
        danger: true,
        hidden: (doc) => doc.verificationStatus !== "PENDING",
      },
    ],
    [handleOpenVerification],
  );

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="space-y-5">
      <PageHeaderBanner title="Employee Documents" />

      <DataTable
        title="Uploaded Documents"
        columns={columns}
        data={rows}
        actions={actions}
        loading={isLoadingEmployeeDocuments}
        empty={{
          icon: Files,
          title: "No documents found",
          description: "Documents uploaded by this employee will show up here.",
        }}
      />

      {/* Document Verification / Rejection Modal */}
      <ModalAction
        id="employee-document-verification"
        isOpen={!!verificationModal}
        onClose={handleCloseVerification}
        onSubmit={handleSubmitVerification}
        title={
          verificationModal?.status === "VERIFIED"
            ? "Verify Document"
            : "Reject Document"
        }
        desc={
          verificationModal?.status === "VERIFIED"
            ? "Are you sure you want to verify this employee document?"
            : "Please provide a reason for rejecting this employee document."
        }
        icon={verificationModal?.status === "VERIFIED" ? ShieldCheck : XCircle}
        theme={verificationModal?.status === "VERIFIED" ? "success" : "danger"}
        submitText={
          verificationModal?.status === "VERIFIED"
            ? "Verify Document"
            : "Reject Document"
        }
        loadingText={
          verificationModal?.status === "VERIFIED"
            ? "Verifying..."
            : "Rejecting..."
        }
        loading={isVerifyingEmployeeDocument}
        submitDisabled={
          !verificationModal ||
          (verificationModal.status === "REJECTED" && !rejectionReason.trim())
        }
        cancelText="Cancel"
      >
        {/* Document Details */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
              <FileText size={20} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {verificationModal?.doc?.title}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {formatText(verificationModal?.doc?.documentType)}
              </p>
            </div>
          </div>
        </div>

        {/* Rejection Reason */}
        {verificationModal?.status === "REJECTED" && (
          <div className="mt-4">
            <TextareaField
              label="Rejection Reason"
              name="rejectionReason"
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this document is being rejected..."
              maxLength={1000}
              helperText={
                <div className="flex items-center justify-between gap-2">
                  <span>
                    Provide a clear reason so the employee can correct the
                    document.
                  </span>
                  <span className="shrink-0">
                    {rejectionReason.length}/1000
                  </span>
                </div>
              }
            />
          </div>
        )}

        {/* Verification Information */}
        {verificationModal?.status === "VERIFIED" && (
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            Once verified, this document will be marked as verified in the
            employee's records.
          </p>
        )}
      </ModalAction>
    </div>
  );
};

export default EmployeeDocumentsPage;
