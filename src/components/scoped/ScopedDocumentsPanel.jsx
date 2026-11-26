import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IconFileText, IconPlus } from "@tabler/icons-react";
import DataTable from "@components/ui/DataTable";
import ModalBasic from "@components/ui/ModalBasic";
import RefreshButton from "@components/ui/RefreshButton";
import DragDropUploader from "@components/fields/DragDropUploader";
import { InputField } from "@components/fields/InputField";
import { uploadDocument } from "@store/slices/profile.slice";
import { getScopeHandler } from "./scope.config";
import { formatDate } from "@utils/date.utils";

export default function ScopedDocumentsPanel({ scopeType, scopeId, canLink = false }) {
  const dispatch = useDispatch();
  const handler = getScopeHandler(scopeType);
  const scopeState = useSelector((state) => state[handler.sliceKey]);
  const { isUploadingDocument } = useSelector((state) => state.profile);
  const documents = scopeState[handler.docsKey];
  const isLoadingDocuments = scopeState[handler.docsLoadingKey];
  const isMutating = scopeState[handler.mutatingKey] || isUploadingDocument;
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const loadDocs = () => {
    if (!scopeId) return;
    dispatch(handler.fetchDocs({ [handler.idKey]: scopeId }));
  };

  useEffect(() => {
    loadDocs();
  }, [scopeType, scopeId]);

  const formik = useFormik({
    initialValues: { title: "", documentType: "SAFETY_CERT", fileUrl: "" },
    validationSchema: Yup.object({
      title: Yup.string().trim().required("Title is required"),
      documentType: Yup.string().trim().required("Document type is required"),
      fileUrl: Yup.string().test(
        "file-or-url",
        "Upload a file or enter a Document URL / Storage Key",
        function (val) {
          if (selectedFiles.length > 0) return true;
          return Boolean(val?.trim());
        }
      ),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        let resolvedUrl = values.fileUrl.trim();
        if (selectedFiles.length > 0 && !resolvedUrl) {
          const formData = new FormData();
          formData.append("file", selectedFiles[0]);
          formData.append("documentType", values.documentType.trim());
          formData.append("title", values.title.trim());
          const uploaded = await dispatch(uploadDocument(formData)).unwrap();
          const u = uploaded?.data || uploaded;
          resolvedUrl = u?.fileUrl || u?.url || u?.storageKey || u?.id || "";
        }
        const payload = {
          title: values.title.trim(),
          documentType: values.documentType.trim(),
          fileUrl: resolvedUrl,
        };
        await dispatch(handler.linkDoc({ [handler.idKey]: scopeId, values: payload })).unwrap();
        resetForm();
        setSelectedFiles([]);
        setIsLinkOpen(false);
        loadDocs();
      } catch {
        // handled in slice
      }
    },
  });

  const columns = useMemo(
    () => [
      {
        key: "title",
        header: "Document",
        render: (d) => (
          <div>
            <span className="font-semibold text-xs block text-slate-800 dark:text-slate-100">
              {d.title || d.name || "Untitled"}
            </span>
            <span className="text-[11px] font-mono text-slate-400">{d.documentType || "—"}</span>
          </div>
        ),
      },
      {
        key: "createdAt",
        header: "Linked On",
        render: (d) => <span className="text-xs">{formatDate(d.createdAt)}</span>,
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {canLink && (
          <button
            type="button"
            onClick={() => setIsLinkOpen(true)}
            className="btn btn-primary btn-sm h-9 inline-flex items-center gap-1.5"
          >
            <IconPlus size={15} />
            <span>Link Document</span>
          </button>
        )}
        <RefreshButton
          onClick={loadDocs}
          loading={isLoadingDocuments}
          className="h-9 w-9 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700/60"
        />
      </div>

      <DataTable
        columns={columns}
        data={documents}
        loading={isLoadingDocuments}
        empty={{
          icon: IconFileText,
          title: "No Documents",
          description: "No documents are linked to this scope yet.",
        }}
      />

      <ModalBasic
        isOpen={isLinkOpen}
        onClose={() => setIsLinkOpen(false)}
        title="Link Scope Document"
        size="md"
      >
        <form onSubmit={formik.handleSubmit} className="space-y-4 p-6">
          <InputField
            id="title"
            name="title"
            label="Title"
            required
            value={formik.values.title}
            onChange={formik.handleChange}
            error={formik.touched.title && formik.errors.title}
          />
          <InputField
            id="documentType"
            name="documentType"
            label="Document Type"
            required
            value={formik.values.documentType}
            onChange={formik.handleChange}
            error={formik.touched.documentType && formik.errors.documentType}
          />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-200">
              Upload File (Optional if URL provided)
            </label>
            <DragDropUploader
              value={selectedFiles}
              onChange={(files) => setSelectedFiles(files)}
              multiple={false}
              accept="application/pdf,image/jpeg,image/png"
              maxFiles={1}
              maxSize={10 * 1024 * 1024}
              size="sm"
              disabled={isMutating}
            />
          </div>
          <InputField
            id="fileUrl"
            name="fileUrl"
            label="Or Document URL / Storage Key"
            placeholder="Auto-filled on upload or paste URL..."
            value={formik.values.fileUrl}
            onChange={formik.handleChange}
            error={formik.touched.fileUrl && formik.errors.fileUrl}
          />
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => {
                setSelectedFiles([]);
                setIsLinkOpen(false);
              }}
              className="btn btn-outline btn-sm"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isMutating}>
              {isMutating ? "Saving..." : "Link Document"}
            </button>
          </div>
        </form>
      </ModalBasic>
    </div>
  );
}
