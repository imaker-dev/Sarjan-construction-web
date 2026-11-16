import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Building2, UserRound, Mail, Hash, ArrowRight } from "lucide-react";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import ModalAction from "@components/ui/ModalAction";
import { InputField } from "@components/fields/InputField";
import { useDispatch, useSelector } from "react-redux";
import { handleResponse } from "@utils/async.utils";
import FormSection from "@components/ui/FormSection";
import Alert from "@components/ui/Alert";
import { createCompany } from "@store/slices/company.slice";
import CompanyCreatedModal from "../components/CompanyCreatedModal";

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
/* Page Component                                                              */
/* -------------------------------------------------------------------------- */

const CreateCompanyPage = () => {
  const dispatch = useDispatch();
  const { isCreatingCompany } = useSelector((state) => state.company);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);

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

    await handleResponse(dispatch(createCompany(payload)), async (res) => {
      const response = res.payload;

      setGeneratedData(response);
      setShowConfirmation(false);
      setShowInvitationModal(true);
      formik.resetForm();
    });
  };

  /* ------------------------------------------------------------------------ */
  /* Reset Form                                                                */
  /* ------------------------------------------------------------------------ */

  const handleReset = () => {
    formik.resetForm();
    setGeneratedData(null);
    setShowConfirmation(false);
    setShowInvitationModal(false);
  };


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeaderBanner title="Create Onboarding" />

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
                Create Company
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </form>

      <CompanyCreatedModal
        isOpen={showInvitationModal}
        onClose={() => setShowInvitationModal(false)}
        company={generatedData}
        onCreateAnother={handleReset}
      />

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
        loading={isCreatingCompany}
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

        <div className="mt-3">
          <Alert
            description={`A single-use onboarding invitation will be generated and remain
            valid for 24 hours.`}
            size="sm"
          />
        </div>
      </ModalAction>
    </div>
  );
};

export default CreateCompanyPage;
