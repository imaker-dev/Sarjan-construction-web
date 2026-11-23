import { useState } from "react";
import { Upload, X, AlertCircle, Loader2 } from "lucide-react";

import ModalBasic from "@components/ui/ModalBasic.jsx";
import DragDropUploader from "@components/fields/DragDropUploader";
import { SelectField } from "@components/fields/SelectField";
import { InputField } from "@components/fields/InputField";

const DOCUMENT_TYPES = [
  { value: "AADHAAR", label: "Aadhaar Card" },
  { value: "PAN", label: "PAN Card" },
  { value: "VOTER_ID", label: "Voter ID" },
  { value: "PASSPORT", label: "Passport" },
  { value: "DRIVING_LICENSE", label: "Driving License" },
  { value: "OPERATOR_LICENSE", label: "Operator License" },
  { value: "TRADE_CERTIFICATE", label: "Trade Certificate" },
  { value: "ACADEMIC_CERTIFICATE", label: "Academic Certificate" },
  { value: "FITNESS_CERTIFICATE", label: "Fitness Certificate" },
  { value: "POLICE_VERIFICATION", label: "Police Verification" },
  { value: "EMPLOYMENT_CONTRACT", label: "Employment Contract" },
  { value: "BANK_DETAILS", label: "Bank Details" },
  { value: "PHOTO", label: "Photo" },
  { value: "OTHER", label: "Other" },
];

const DocumentUploadModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [documentType, setDocumentType] = useState("");
  const [title, setTitle] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");

  const handleClose = () => {
    if (loading) return;

    setDocumentType("");
    setTitle("");
    setSelectedFiles([]);
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!documentType) {
      setError("Please select a document type.");
      return;
    }

    if (!selectedFiles.length) {
      setError("Please upload a document.");
      return;
    }

    const formData = new FormData();

    formData.append("file", selectedFiles[0]);
    formData.append("documentType", documentType);

    if (title.trim()) {
      formData.append("title", title.trim());
    }

    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <ModalBasic
      id="document-upload"
      title="Upload document"
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-5 p-5">
          {/* Document type */}
          <SelectField
            label="Document type"
            name="documentType"
            required
            placeholder="Select document type"
            options={DOCUMENT_TYPES}
            value={documentType}
            onChange={(e) => {
              setDocumentType(e.target.value);
              setError("");
            }}
            disabled={loading}
          />

          {/* Document title */}
          {/* <InputField
            label="Document title"
            name="title"
            placeholder="Enter document title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            maxLength={150}
            helperText="Optional. Defaults to the file name if left empty."
          /> */}

          {/* File upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Upload file <span className="text-red-500">*</span>
            </label>

            <DragDropUploader
              value={selectedFiles}
              onChange={(files) => {
                setSelectedFiles(files);
                setError("");
              }}
              multiple={false}
              accept="application/pdf,image/jpeg,image/png"
              maxFiles={1}
              maxSize={10 * 1024 * 1024}
              size="md"
              disabled={loading}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="btn border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || !selectedFiles.length || !documentType}
            className="btn bg-primary-500 text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} className="mr-2" />
                Upload document
              </>
            )}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
};

export default DocumentUploadModal;
