import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  IconBuilding,
  IconUser,
  IconArrowLeft,
  IconDeviceFloppy,
  IconShieldCheck,
} from "@tabler/icons-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import FormSection from "@components/ui/FormSection";
import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import ClaimModal from "../components/ClaimModal";
import { createCompany } from "@store/slices/platform.slice";
import { ROUTES } from "@constants/routes";

const ENTITY_TYPE_OPTIONS = [
  { value: "PRIVATE_LIMITED", label: "Private Limited Company" },
  { value: "PUBLIC_LIMITED", label: "Public Limited Company" },
  { value: "LLP", label: "Limited Liability Partnership (LLP)" },
  { value: "PARTNERSHIP", label: "Partnership Firm" },
  { value: "PROPRIETORSHIP", label: "Sole Proprietorship" },
  { value: "TRUST", label: "Trust / Society" },
  { value: "OTHER", label: "Other" },
];

const validationSchema = Yup.object({
  companyCode: Yup.string()
    .trim()
    .uppercase()
    .matches(/^[A-Z0-9_-]+$/, "Only uppercase letters, digits, underscores, and hyphens")
    .min(2, "Minimum 2 characters")
    .max(20, "Maximum 20 characters")
    .required("Company code is required"),

  companyName: Yup.string()
    .trim()
    .min(2, "Minimum 2 characters")
    .max(200, "Maximum 200 characters")
    .required("Company name is required"),

  legalName: Yup.string().trim().max(200, "Maximum 200 characters"),

  entityType: Yup.string()
    .oneOf(ENTITY_TYPE_OPTIONS.map((e) => e.value))
    .required("Entity type is required"),

  pan: Yup.string()
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Must be valid 10-digit PAN (e.g. ABCDE1234F)")
    .required("Company PAN is required"),

  website: Yup.string()
    .trim()
    .url("Must be a valid URL with https:// or http://")
    .nullable(),

  contactEmail: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Contact email is required"),

  contactPhone: Yup.string()
    .trim()
    .max(20, "Maximum 20 characters"),

  adminDisplayName: Yup.string()
    .trim()
    .min(2, "Minimum 2 characters")
    .max(100, "Maximum 100 characters")
    .required("Admin display name is required"),

  adminLoginId: Yup.string()
    .trim()
    .email("Admin login ID must be a valid email address")
    .required("Admin login ID email is required"),
});

const initialValues = {
  companyCode: "",
  companyName: "",
  legalName: "",
  entityType: "PRIVATE_LIMITED",
  pan: "",
  website: "",
  contactEmail: "",
  contactPhone: "",
  adminDisplayName: "",
  adminLoginId: "",
};

export default function CreateCompanyPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isCreatingCompany } = useSelector((state) => state.platform);
  const [createdClaimData, setCreatedClaimData] = useState(null);

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        companyCode: values.companyCode.trim().toUpperCase(),
        companyName: values.companyName.trim(),
        legalName: values.legalName?.trim() || values.companyName.trim(),
        entityType: values.entityType,
        pan: values.pan.trim().toUpperCase(),
        website: values.website?.trim() || undefined,
        contactEmail: values.contactEmail.trim(),
        contactPhone: values.contactPhone?.trim() || undefined,
        adminDisplayName: values.adminDisplayName.trim(),
        adminLoginId: values.adminLoginId.trim(),
      };

      try {
        const res = await dispatch(createCompany(payload)).unwrap();
        setCreatedClaimData(res);
      } catch {
        // Error toast handled by slice
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

  const handleClaimModalClose = () => {
    setCreatedClaimData(null);
    navigate(ROUTES.PLATFORM.COMPANIES);
  };

  return (
    <main className="space-y-6 pb-12">
      <PageHeaderBanner
        title="Provision Customer Company"
        description="Create a new customer tenant company, default administrative roles, and generate the first admin onboarding claim link."
      />

      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="space-y-6">
          {/* Company Details */}
          <FormSection
            title="Company Information"
            description="Tenant identification and legal registration parameters."
            icon={IconBuilding}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <InputField
                label="Company Code"
                placeholder="e.g. SARJAN"
                required
                maxLength={20}
                helperText="Short uppercase identifier for this tenant."
                {...getFieldProps("companyCode")}
                onChange={(e) =>
                  setFieldValue("companyCode", e.target.value.toUpperCase())
                }
              />

              <InputField
                label="Company Display Name"
                placeholder="e.g. Sarjan Construction Ltd"
                required
                maxLength={200}
                {...getFieldProps("companyName")}
              />

              <InputField
                label="Legal Entity Name"
                placeholder="e.g. Sarjan Construction Limited"
                maxLength={200}
                helperText="Official registered entity name if different from display name."
                {...getFieldProps("legalName")}
              />

              <SelectField
                label="Entity Type"
                name="entityType"
                required
                options={ENTITY_TYPE_OPTIONS}
                value={values.entityType}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.entityType && errors.entityType}
              />

              <InputField
                label="Permanent Account Number (PAN)"
                placeholder="e.g. ABCDE1234F"
                required
                maxLength={10}
                helperText="10-character alphanumeric PAN issued by IT Dept."
                {...getFieldProps("pan")}
                onChange={(e) =>
                  setFieldValue("pan", e.target.value.toUpperCase())
                }
              />

              <InputField
                label="Company Website"
                type="url"
                placeholder="https://sarjaninfra.com"
                {...getFieldProps("website")}
              />

              <InputField
                label="Corporate Contact Email"
                type="email"
                placeholder="info@sarjaninfra.com"
                required
                {...getFieldProps("contactEmail")}
              />

              <InputField
                label="Corporate Contact Phone"
                type="tel"
                placeholder="+919876543210"
                {...getFieldProps("contactPhone")}
              />
            </div>
          </FormSection>

          {/* First Admin Account */}
          <FormSection
            title="Initial Company Administrator"
            description="The first admin account will receive OWNER and HO_ADMIN roles and a claim link to onboard."
            icon={IconShieldCheck}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <InputField
                label="Admin Full Name"
                placeholder="e.g. Bhavin Patel"
                required
                icon={IconUser}
                {...getFieldProps("adminDisplayName")}
              />

              <InputField
                label="Admin Login ID (Email)"
                type="email"
                placeholder="admin@sarjaninfra.com"
                required
                helperText="This email will be the login handle and will receive the claim token link."
                {...getFieldProps("adminLoginId")}
              />
            </div>
          </FormSection>

          {/* Form Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => navigate(ROUTES.PLATFORM.COMPANIES)}
              className="btn btn-outline"
              disabled={isCreatingCompany}
            >
              <IconArrowLeft size={17} stroke={1.8} />
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreatingCompany}
            >
              <IconDeviceFloppy size={17} stroke={1.8} />
              {isCreatingCompany
                ? "Provisioning Tenant..."
                : "Provision Company & Admin"}
            </button>
          </div>
        </div>
      </form>

      {/* Claim Token Modal on Success */}
      {createdClaimData && (
        <ClaimModal
          isOpen={!!createdClaimData}
          onClose={handleClaimModalClose}
          data={createdClaimData}
        />
      )}
    </main>
  );
}

