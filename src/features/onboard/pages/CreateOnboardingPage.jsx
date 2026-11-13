import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ChevronDown,
  Copy,
  Check,
  Building2,
  UserRound,
  Mail,
  Hash,
  ArrowRight,
  Link2,
} from "lucide-react";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import ModalAction from "@components/ui/ModalAction";
import { InputField } from "@components/fields/InputField";
import { useDispatch, useSelector } from "react-redux";
import { handleResponse } from "@utils/async.utils";
import { generateOnboardingLink } from "@store/slices/onboarding.slice";

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

const validationSchema = Yup.object({
  companyCode: Yup.string()
    .trim()
    .matches(
      /^[A-Z0-9_-]+$/,
      "Only uppercase letters, numbers, hyphens and underscores are allowed",
    )
    .max(40, "Maximum 40 characters")
    .required("Company code is required"),

  companyName: Yup.string()
    .trim()
    .max(200, "Maximum 200 characters")
    .required("Company name is required"),

  adminLoginId: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Admin email is required"),

  adminDisplayName: Yup.string()
    .trim()
    .max(120, "Maximum 120 characters")
    .required("Admin name is required"),
});

const INITIAL_VALUES = {
  companyCode: "",
  companyName: "",
  adminLoginId: "",
  adminDisplayName: "",
};

/* -------------------------------------------------------------------------- */
/* Collapsible Form Section                                                   */
/* -------------------------------------------------------------------------- */

const FormSection = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon
              size={19}
              strokeWidth={1.8}
              className="text-muted-foreground"
            />
          )}

          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>

        <ChevronDown
          size={18}
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-border px-5 py-5">{children}</div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Page Component                                                              */
/* -------------------------------------------------------------------------- */

const CreateOnboardingPage = () => {
  const dispatch = useDispatch();
  const { isGeneratingLink } = useSelector((state) => state.onboarding);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [copied, setCopied] = useState(false);

  const formik = useFormik({
    initialValues: INITIAL_VALUES,
    validationSchema,

    onSubmit: () => {
      setShowConfirmation(true);
    },
  });

  /* ------------------------------------------------------------------------ */
  /* Create Company                                                            */
  /* ------------------------------------------------------------------------ */

  const handleCreate = async () => {
    const payload = {
      companyCode: formik.values.companyCode.trim(),
      companyName: formik.values.companyName.trim(),
      adminLoginId: formik.values.adminLoginId.trim(),
      adminDisplayName: formik.values.adminDisplayName.trim(),
    };

    await handleResponse(
      dispatch(generateOnboardingLink(payload)),
      async (res) => {
        console.log(res)
        setGeneratedData(res);
        setCopied(false);
        setShowConfirmation(false);
      },
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Copy Invitation Link                                                      */
  /* ------------------------------------------------------------------------ */

  const handleCopyLink = async () => {
    if (!generatedData?.claimUrl) return;

    try {
      await navigator.clipboard.writeText(generatedData.claimUrl);
      setCopied(true);
    } catch (error) {
      console.error("Unable to copy invitation link:", error);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Reset Form                                                                */
  /* ------------------------------------------------------------------------ */

  const handleReset = () => {
    formik.resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeaderBanner
        title="Create Onboarding"
        // description="Register a new company and generate an onboarding invitation for its administrator."
      />

      {/* Form */}
      <form onSubmit={formik.handleSubmit}>
        <div className="space-y-5">
          {/* Company Details */}
          <FormSection
            title="Company Details"
            icon={Building2}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <InputField
                label="Company Code"
                name="companyCode"
                placeholder="e.g. SARJAN-INFRA"
                required
                icon={Hash}
                value={formik.values.companyCode}
                onChange={(e) =>
                  formik.setFieldValue(
                    "companyCode",
                    e.target.value.toUpperCase(),
                  )
                }
                onBlur={formik.handleBlur}
                error={formik.touched.companyCode && formik.errors.companyCode}
                helperText="Unique identifier for the company."
                maxLength={40}
              />

              <InputField
                label="Company Name"
                name="companyName"
                placeholder="Enter company name"
                required
                icon={Building2}
                value={formik.values.companyName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.companyName && formik.errors.companyName}
                maxLength={200}
              />
            </div>
          </FormSection>

          {/* Administrator Details */}
          <FormSection
            title="Administrator Details"
            icon={UserRound}
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
              <InputField
                label="Admin Display Name"
                name="adminDisplayName"
                placeholder="Enter administrator name"
                required
                icon={UserRound}
                value={formik.values.adminDisplayName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.adminDisplayName &&
                  formik.errors.adminDisplayName
                }
                maxLength={120}
              />

              <InputField
                label="Admin Email"
                name="adminLoginId"
                type="email"
                placeholder="admin@company.com"
                required
                icon={Mail}
                value={formik.values.adminLoginId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.adminLoginId && formik.errors.adminLoginId
                }
              />
            </div>
          </FormSection>

          {/* Form Actions */}
          <div className="flex flex-col-reverse items-center justify-between gap-3 pt-2 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">*</span> Required fields
            </p>

            <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-outline"
                // className="btn border border-border bg-card text-muted-foreground hover:bg-muted"
              >
                Reset
              </button>

              <button
                type="submit"
                className="btn btn-primary inline-flex items-center gap-2"
              >
                Create Onboarding
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ------------------------------------------------------------------ */}
      {/* Generated Invitation Link                                          */}
      {/* ------------------------------------------------------------------ */}

      {generatedData?.claimUrl && (
        <div className="mx-auto max-w-5xl rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-500/10 text-success-600">
              <Check size={20} />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Company Created Successfully
              </h4>

              <p className="mt-1 text-xs text-muted-foreground">
                The onboarding invitation is ready to share.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Onboarding Invitation Link
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                readOnly
                value={generatedData.claimUrl}
                className="form-input min-w-0 flex-1"
              />

              <button
                type="button"
                onClick={handleCopyLink}
                className="btn btn-outline-primary inline-flex items-center justify-center gap-2"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>

            {generatedData.claimExpiresAt && (
              <p className="mt-2 text-xs text-muted-foreground">
                <Link2 size={13} className="mr-1 inline-block" />
                Expires on:{" "}
                {new Date(generatedData.claimExpiresAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Confirmation Modal                                                  */}
      {/* ------------------------------------------------------------------ */}

      <ModalAction
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onSubmit={handleCreate}
        title="Confirm Company Creation"
        desc="Please review the company and administrator details before proceeding."
        icon={Building2}
        theme="primary"
        submitText="Create Company"
        loadingText="Creating Company..."
        loading={isGeneratingLink}
        size="md"
      >
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Company Name</p>

            <p className="mt-1 text-sm font-semibold text-foreground">
              {formik.values.companyName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Company Code</p>

              <p className="mt-1 text-sm font-medium text-foreground">
                {formik.values.companyCode}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Administrator</p>

              <p className="mt-1 text-sm font-medium text-foreground">
                {formik.values.adminDisplayName}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Admin Email</p>

            <p className="mt-1 break-all text-sm font-medium text-foreground">
              {formik.values.adminLoginId}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-info-500/20 bg-info-500/5 px-3 py-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            A single-use onboarding invitation will be generated and remain
            valid for 24 hours.
          </p>
        </div>
      </ModalAction>
    </div>
  );
};

export default CreateOnboardingPage;
