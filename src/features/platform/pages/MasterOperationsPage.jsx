import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  IconListCheck,
  IconPlus,
  IconTrash,
  IconLock,
  IconRefresh,
  IconSearch,
  IconAlertTriangle,
  IconFolder,
  IconShield,
} from "@tabler/icons-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import ModalBasic from "@components/ui/ModalBasic";
import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import { TextareaField } from "@components/fields/TextareaField";
import {
  getGlobalOperations,
  createGlobalOperation,
  deleteGlobalOperation,
} from "@store/slices/platform.slice";

const COMMON_DOMAINS = [
  { value: "MACHINERY", label: "Machinery" },
  { value: "SAFETY", label: "Safety" },
  { value: "QUALITY", label: "Quality" },
  { value: "FINANCE", label: "Finance" },
  { value: "SITE", label: "Site Operations" },
  { value: "HR", label: "Human Resources" },
  { value: "PROCUREMENT", label: "Procurement" },
  { value: "GENERAL", label: "General Administration" },
];

const newOperationSchema = Yup.object({
  key: Yup.string()
    .trim()
    .uppercase()
    .matches(
      /^[A-Z0-9_-]+$/,
      "Only uppercase letters, digits, underscores, and hyphens"
    )
    .min(1, "Key is required")
    .max(80, "Maximum 80 characters")
    .required("Operation key is required"),

  domain: Yup.string()
    .trim()
    .uppercase()
    .min(1, "Domain is required")
    .max(80, "Maximum 80 characters")
    .required("Domain is required"),

  name: Yup.string()
    .trim()
    .min(1, "Display title is required")
    .max(200, "Maximum 200 characters")
    .required("Name is required"),

  description: Yup.string().trim().max(1000, "Maximum 1000 characters"),

  sensitive: Yup.boolean(),
});

export default function MasterOperationsPage() {
  const dispatch = useDispatch();
  const {
    globalOperations,
    isLoadingOperations,
    isCreatingOperation,
    isDeletingOperation,
  } = useSelector((state) => state.platform);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  useEffect(() => {
    dispatch(getGlobalOperations());
  }, [dispatch]);

  // Normalize operations data: supports both array of operations and object grouped by domain { DOMAIN: [...] }
  const flatOperationsList = useMemo(() => {
    if (!globalOperations) return [];
    if (Array.isArray(globalOperations)) return globalOperations;
    if (Array.isArray(globalOperations.data)) return globalOperations.data;

    // If it's grouped by domain: { MACHINERY: [...], SAFETY: [...] }
    if (typeof globalOperations === "object") {
      const list = [];
      for (const [dom, ops] of Object.entries(globalOperations)) {
        if (Array.isArray(ops)) {
          ops.forEach((item) => {
            list.push({ ...item, domain: item.domain || dom });
          });
        }
      }
      return list;
    }
    return [];
  }, [globalOperations]);

  // Extract unique domains
  const availableDomains = useMemo(() => {
    const set = new Set();
    flatOperationsList.forEach((op) => {
      if (op.domain) set.add(op.domain.toUpperCase());
    });
    return Array.from(set).sort();
  }, [flatOperationsList]);

  // Filtered list
  const filteredOperations = useMemo(() => {
    return flatOperationsList.filter((op) => {
      const matchesSearch =
        !searchTerm ||
        op.key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDomain =
        selectedDomain === "ALL" ||
        op.domain?.toUpperCase() === selectedDomain.toUpperCase();

      return matchesSearch && matchesDomain;
    });
  }, [flatOperationsList, searchTerm, selectedDomain]);

  // Formik for adding new operation
  const formik = useFormik({
    initialValues: {
      key: "",
      domain: "MACHINERY",
      name: "",
      description: "",
      sensitive: false,
    },
    validationSchema: newOperationSchema,
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        key: values.key.trim().toUpperCase(),
        domain: values.domain.trim().toUpperCase(),
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        sensitive: values.sensitive,
      };

      try {
        await dispatch(createGlobalOperation(payload)).unwrap();
        resetForm();
        setIsAddModalOpen(false);
        dispatch(getGlobalOperations());
      } catch {
        // error toast handled by slice
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  const getFieldProps = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] && errors[name],
  });

  const handleDelete = async () => {
    if (!deleteCandidate) return;

    try {
      await dispatch(deleteGlobalOperation(deleteCandidate.key)).unwrap();
      setDeleteCandidate(null);
    } catch {
      // 409 Conflict handled in slice
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <PageHeaderBanner
        title="Master Operations Catalogue"
        description="Global operation blueprints that customer departments and employees can enable across the system."
      />

      {/* Filter and Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <IconSearch
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search operation key, title, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 w-full"
            />
          </div>

          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="form-select max-w-[180px] text-xs font-semibold"
          >
            <option value="ALL">All Domains ({flatOperationsList.length})</option>
            {availableDomains.map((dom) => (
              <option key={dom} value={dom}>
                {dom}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch(getGlobalOperations())}
            className="btn btn-outline"
            title="Refresh catalogue"
            disabled={isLoadingOperations}
          >
            <IconRefresh
              size={16}
              className={isLoadingOperations ? "animate-spin" : ""}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary"
          >
            <IconPlus size={16} />
            <span>Add Operation</span>
          </button>
        </div>
      </div>

      {/* Operations List Cards */}
      {isLoadingOperations && flatOperationsList.length === 0 ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : filteredOperations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center bg-background">
          <IconListCheck size={40} className="mx-auto text-muted-foreground mb-3" />
          <h3 className="text-base font-semibold text-foreground">
            No operations found
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchTerm || selectedDomain !== "ALL"
              ? "No catalogue operations match your current search/domain filter."
              : "No operations are registered in the global catalogue yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOperations.map((op) => (
            <div
              key={op.key}
              className="group relative flex flex-col justify-between rounded-xl border border-border bg-background p-5 shadow-sm hover:border-primary-400/50 hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
                    {op.domain || "GLOBAL"}
                  </span>

                  {op.sensitive && (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      <IconLock size={12} />
                      Sensitive
                    </span>
                  )}
                </div>

                <h3 className="mt-2.5 text-sm font-semibold text-foreground group-hover:text-primary-600 transition-colors">
                  {op.name}
                </h3>

                <code className="mt-1 block font-mono text-xs font-medium text-primary-600 dark:text-primary-400 break-all">
                  {op.key}
                </code>

                <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {op.description || "No description provided."}
                </p>
              </div>

              {/* Card Footer with Delete */}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-[11px] text-muted-foreground">
                  System Blueprint
                </span>

                <button
                  type="button"
                  onClick={() => setDeleteCandidate(op)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/15 dark:hover:text-rose-400 transition-colors"
                  title="Delete from catalogue"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Operation Modal */}
      <ModalBasic
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Operation to Catalogue"
        description="Register a new system-wide operational capability."
        size="lg"
      >
        <form onSubmit={formik.handleSubmit} className="space-y-4 p-6" noValidate>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Operation Key"
              placeholder="e.g. MACHINERY_BREAKDOWN_REPORT"
              required
              maxLength={80}
              helperText="Uppercase alphanumeric key (A-Z, 0-9, -, _)"
              {...getFieldProps("key")}
              onChange={(e) =>
                setFieldValue("key", e.target.value.toUpperCase())
              }
            />

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                Domain <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                list="domain-suggestions"
                name="domain"
                placeholder="e.g. MACHINERY, SAFETY, SITE"
                value={values.domain}
                onChange={(e) =>
                  setFieldValue("domain", e.target.value.toUpperCase())
                }
                onBlur={handleBlur}
                className={`form-input w-full ${
                  touched.domain && errors.domain ? "is-invalid" : ""
                }`}
                maxLength={80}
              />
              <datalist id="domain-suggestions">
                {COMMON_DOMAINS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </datalist>
              {touched.domain && errors.domain && (
                <p className="mt-1 text-xs text-red-500">{errors.domain}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <InputField
                label="Operation Display Title"
                placeholder="e.g. Machinery Breakdown Report"
                required
                maxLength={200}
                {...getFieldProps("name")}
              />
            </div>

            <div className="md:col-span-2">
              <TextareaField
                label="Operation Description"
                placeholder="Describe what this operational task or report entails..."
                rows={3}
                maxLength={1000}
                {...getFieldProps("description")}
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-start gap-3 rounded-xl border border-border p-3.5 hover:bg-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  name="sensitive"
                  checked={values.sensitive}
                  onChange={handleChange}
                  className="mt-0.5 rounded"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                    <IconLock size={14} className="text-amber-500" />
                    Sensitive / Confidential Operation
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Flag this operation if it involves financial records, audit logs, or restricted executive tasks.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn btn-outline"
              disabled={isCreatingOperation}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreatingOperation}
            >
              {isCreatingOperation ? "Creating Operation..." : "Create Operation"}
            </button>
          </div>
        </form>
      </ModalBasic>

      {/* Delete Operation Confirmation Modal */}
      {deleteCandidate && (
        <ModalBasic
          isOpen={!!deleteCandidate}
          onClose={() => setDeleteCandidate(null)}
          title="Delete Operation Blueprint?"
          description={`Operation: ${deleteCandidate.name} (${deleteCandidate.key})`}
          size="md"
        >
          <div className="space-y-4 p-6">
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-700 dark:text-rose-400">
              <div className="flex items-center gap-2 font-semibold">
                <IconAlertTriangle size={18} />
                Safety Rule Enforced
              </div>
              <p className="mt-1 leading-relaxed">
                If this operation is currently enabled on any customer company department or assigned to any employee, deletion will be blocked with a <strong>409 Conflict</strong>.
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Are you sure you want to permanently remove <code className="font-mono text-foreground font-semibold">{deleteCandidate.key}</code> from the global master catalogue?
            </p>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="btn btn-outline"
                disabled={isDeletingOperation}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={isDeletingOperation}
              >
                {isDeletingOperation ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </ModalBasic>
      )}
    </div>
  );
}

