import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import ModalBasic from "@components/ui/ModalBasic";
import { TextareaField } from "@components/fields/TextareaField";
import walletApi from "@store/api/wallet.api";
import { formikFieldProps, newIdempotencyKey } from "@utils/wallet.utils";

export function ReversalRequestModal({
  isOpen,
  onClose,
  entry,
  onSubmit,
  isSubmitting,
}) {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { reason: "" },
    validationSchema: Yup.object({
      reason: Yup.string().trim().required("Reason is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      await onSubmit({
        entryId: entry.id,
        values: {
          reason: values.reason.trim(),
          idempotencyKey: newIdempotencyKey("pi-rev"),
        },
      });
      resetForm();
    },
  });

  return (
    <ModalBasic
      id="request-reversal-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Request Ledger Reversal"
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Reversals are full-amount only and must be executed by Finance.
        </p>
        <TextareaField
          label="Reason"
          {...formikFieldProps(formik, "reason")}
          required
          rows={3}
          placeholder="e.g. Expense entered twice — duplicate"
        />
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm">
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}

export function EvidenceModal({
  isOpen,
  onClose,
  siteId,
  entry,
  onSubmit,
  isSubmitting,
}) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !entry) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", "OTHER");
      formData.append("title", `Wallet evidence (${entry.type})`);
      const upRes = await walletApi.uploadSiteDocumentApi({ siteId, formData });
      const documentId = upRes?.data?.documentId || upRes?.data?.id;
      if (!documentId) {
        toast.error("Upload failed to return documentId");
        return;
      }
      await onSubmit({
        siteId,
        entryId: entry.id,
        values: { documentId },
      });
      setFile(null);
    } catch (err) {
      toast.error(err?.message || "Failed to attach evidence");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ModalBasic
      id="ledger-evidence-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Attach Ledger Evidence"
      size="md"
    >
      <form onSubmit={handleUpload} className="p-6 space-y-4">
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="form-input form-sm w-full"
          required
        />
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!file || uploading || isSubmitting}
            className="btn btn-primary btn-sm"
          >
            {uploading || isSubmitting ? "Attaching..." : "Upload & Link"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}
