
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";

import {
  IconBuildingSkyscraper,
  IconUser,
  IconMapPin,
  IconBuilding,
  IconChevronDown,
  IconChevronUp,
  IconShieldCheck,
  IconShieldX,
  IconCheck,
  IconLock,
  IconX,
  IconClipboardCheck,
} from "@tabler/icons-react";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";

import { useQueryParams } from "@hooks/useQueryParams";

import {
  verifyOnboardingToken,
  completeOnboarding,
} from "@store/slices/onboarding.slice";

import { ROUTES } from "@constants/routes";
import { InputField } from "@components/fields/InputField";
import { FieldWrapper } from "@components/fields/FieldWrapper";
import FormSection from "@components/ui/FormSection";

/* =========================================================
   VALIDATION SCHEMA
========================================================= */

const validationSchema = Yup.object({
  displayName: Yup.string()
    .trim()
    .max(120, "Maximum 120 characters allowed")
    .required("Administrator name is required"),

password: Yup.string()
  .min(12, "Password must contain at least 12 characters")
  .required("Password is required"),

  company: Yup.object({
    legalName: Yup.string()
      .trim()
      .max(200, "Maximum 200 characters allowed")
      .required("Legal company name is required"),

    entityType: Yup.string()
      .required("Please select an entity type"),

    tradeName: Yup.string()
      .max(200, "Maximum 200 characters allowed"),

    formedOn: Yup.date()
      .max(new Date(), "Formation date cannot be in the future")
      .required("Formation date is required"),

    pan: Yup.string()
      .trim()
      .uppercase()
      .matches(
        /^[A-Z]{5}[0-9]{4}[A-Z]$/,
        "Enter a valid PAN number"
      )
      .required("PAN number is required"),

    cin: Yup.string()
      .trim()
      .uppercase()
      .test(
        "cin-format",
        "Enter a valid 21-character CIN",
        (value) => !value || /^[A-Z0-9]{21}$/.test(value)
      ),

    website: Yup.string()
      .trim()
      .transform((value) => (value === "" ? undefined : value))
      .url("Enter a valid website URL"),

    regAddressLine1: Yup.string()
      .trim()
      .required("Address line 1 is required"),

    regAddressLine2: Yup.string(),

    regLocality: Yup.string()
      .trim()
      .required("Locality is required"),

    regCity: Yup.string()
      .trim()
      .required("City is required"),

    regDistrict: Yup.string()
      .trim()
      .required("District is required"),

    regStateUt: Yup.string()
      .trim()
      .required("State / UT is required"),

    regPin: Yup.string()
      .matches(/^[0-9]{6}$/, "Enter a valid 6-digit PIN code")
      .required("PIN code is required"),

    regCountry: Yup.string()
      .required("Country is required"),

    contactName: Yup.string()
      .trim()
      .required("Contact name is required"),

    contactDesignation: Yup.string()
      .trim()
      .required("Contact designation is required"),

    contactEmail: Yup.string()
      .trim()
      .email("Enter a valid email address")
      .required("Contact email is required"),

    contactPhone: Yup.string()
      .matches(
        /^\+?[0-9\s()-]{8,18}$/,
        "Enter a valid contact number"
      )
      .required("Contact phone is required"),
  }),

  headOffice: Yup.object({
    code: Yup.string()
      .trim()
      .max(30)
      .required("Office code is required"),

    name: Yup.string()
      .trim()
      .max(120)
      .required("Office name is required"),

    isPrimary: Yup.boolean(),
  }),
});

/* =========================================================
   INITIAL VALUES
========================================================= */

const getInitialValues = (token) => ({
  token,
  password: "",
  displayName: "",

  company: {
    legalName: "",
    entityType: "",
    tradeName: "",
    formedOn: "",
    pan: "",
    cin: "",
    website: "",

    regAddressLine1: "",
    regAddressLine2: "",
    regLocality: "",
    regCity: "",
    regDistrict: "",
    regStateUt: "",
    regPin: "",
    regCountry: "IN",

    contactName: "",
    contactDesignation: "",
    contactEmail: "",
    contactPhone: "",
  },

  headOffice: {
    code: "HQ",
    name: "",
    isPrimary: true,
  },
});

/* =========================================================
   REUSABLE SELECT FIELD
========================================================= */

const SelectField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required,
  options,
  placeholder = "Select an option",
}) => {
  const fieldError = touched && error;

  return (
    <FieldWrapper
      label={label}
      id={name}
      required={required}
      error={fieldError}
    >
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={Boolean(fieldError)}
        className={`form-input w-full ${
          fieldError ? "is-invalid" : ""
        }`}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
};

/* =========================================================
   SUMMARY ITEM
========================================================= */

const SummaryItem = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-xs text-slate-500 dark:text-slate-400">
      {label}
    </p>

    <p className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-200">
      {value || "—"}
    </p>
  </div>
);

/* =========================================================
   CONFIRMATION MODAL
========================================================= */

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  values,
  loading,
}) => {
  if (!isOpen) return null;

  const company = values.company;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-800">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-white">
              Confirm Company Onboarding
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Review your information before completing onboarding.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close confirmation"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700"
          >
            <IconX size={19} stroke={1.8} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">

          {/* Administrator */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Administrator Details
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <SummaryItem
                label="Display Name"
                value={values.displayName}
              />

              <SummaryItem
                label="Administrator Email"
                value={company.contactEmail}
              />
            </div>
          </div>

          {/* Company */}
          <div className="border-t border-slate-100 pt-5 dark:border-slate-700">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Company Information
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <SummaryItem label="Legal Name" value={company.legalName} />
              <SummaryItem label="Trade Name" value={company.tradeName} />
              <SummaryItem label="Entity Type" value={company.entityType} />
              <SummaryItem label="Formation Date" value={company.formedOn} />
              <SummaryItem label="PAN" value={company.pan} />
              <SummaryItem label="CIN" value={company.cin} />
              <SummaryItem label="Website" value={company.website} />
            </div>
          </div>

          {/* Registered Address */}
          <div className="border-t border-slate-100 pt-5 dark:border-slate-700">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Registered Office
            </h4>

            <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
              {[
                company.regAddressLine1,
                company.regAddressLine2,
                company.regLocality,
                company.regCity,
                company.regDistrict,
                company.regStateUt,
                company.regPin,
                company.regCountry,
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>

          {/* Contact */}
          <div className="border-t border-slate-100 pt-5 dark:border-slate-700">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Contact Information
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <SummaryItem label="Contact Name" value={company.contactName} />
              <SummaryItem
                label="Designation"
                value={company.contactDesignation}
              />
              <SummaryItem label="Email" value={company.contactEmail} />
              <SummaryItem label="Phone" value={company.contactPhone} />
            </div>
          </div>

          {/* Head Office */}
          <div className="border-t border-slate-100 pt-5 dark:border-slate-700">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Head Office
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <SummaryItem
                label="Office Code"
                value={values.headOffice.code}
              />

              <SummaryItem
                label="Office Name"
                value={values.headOffice.name}
              />

              <SummaryItem
                label="Primary Office"
                value={values.headOffice.isPrimary ? "Yes" : "No"}
              />
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            Please ensure all company details are correct. Once submitted,
            your onboarding will be completed using these details.
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end dark:border-slate-700">

          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={loading}
          >
            Go Back
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              "Completing..."
            ) : (
              <>
                <IconCheck size={17} stroke={1.8} />
                Confirm & Complete
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN PAGE
========================================================= */

const VerifyOnboardingPage = () => {
  const { get } = useQueryParams();
  const token = get("token");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    isVerifyingToken,
    isCompletingOnboarding,
  } = useSelector((state) => state.onboarding);

  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const [openSections, setOpenSections] = useState({
    administrator: true,
    company: true,
    registeredOffice: false,
    headOffice: false,
  });

  /* -------------------------------------------------------
     VERIFY TOKEN
  ------------------------------------------------------- */

  useEffect(() => {
    let active = true;

    setIsVerified(false);
    setVerificationError("");

    if (!token) {
      setVerificationError(
        "The onboarding invitation token is missing. Please use the invitation link provided to you."
      );

      return () => {
        active = false;
      };
    }

    dispatch(verifyOnboardingToken(token))
      .unwrap()
      .then(() => {
        if (active) {
          setIsVerified(true);
        }
      })
      .catch((error) => {
        if (active) {
          setVerificationError(
            typeof error === "string"
              ? error
              : error?.message ||
                  "This invitation link is invalid or has expired."
          );
        }
      });

    return () => {
      active = false;
    };
  }, [dispatch, token]);

  /* -------------------------------------------------------
     FORMIK
  ------------------------------------------------------- */

  const formik = useFormik({
    initialValues: getInitialValues(token),
    enableReinitialize: true,
    validationSchema,

    onSubmit: () => {
      setIsConfirmationOpen(true);
    },
  });

  /* -------------------------------------------------------
     SECTION TOGGLE
  ------------------------------------------------------- */

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  /* -------------------------------------------------------
     FIELD PROPS
  ------------------------------------------------------- */

  const getFieldProps = (name) => ({
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.touched[name] && formik.errors[name],
  });

  const getCompanyFieldProps = (name) => ({
    name: `company.${name}`,
    value: formik.values.company[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error:
      formik.touched.company?.[name] &&
      formik.errors.company?.[name],
  });

  const getHeadOfficeFieldProps = (name) => ({
    name: `headOffice.${name}`,
    value: formik.values.headOffice[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error:
      formik.touched.headOffice?.[name] &&
      formik.errors.headOffice?.[name],
  });

  /* -------------------------------------------------------
     CONFIRM SUBMISSION
  ------------------------------------------------------- */

  const handleConfirm = async () => {
    try {
      const payload = {
        ...formik.values,

        company: {
          ...formik.values.company,
          pan: formik.values.company.pan.toUpperCase(),
          cin: formik.values.company.cin.toUpperCase(),
        },
      };

      await dispatch(completeOnboarding(payload)).unwrap();

      setIsConfirmationOpen(false);
      setIsCompleted(true);
    } catch (error) {
      // Error notification is handled by the Redux slice.
    }
  };

  /* -------------------------------------------------------
     VERIFYING STATE
  ------------------------------------------------------- */

  if (isVerifyingToken) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16 dark:bg-slate-900">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">

          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500/20 border-t-primary-500" />

          <h2 className="mt-5 text-base font-semibold text-slate-800 dark:text-white">
            Verifying Your Invitation
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Please wait while we validate your onboarding invitation.
          </p>

        </div>
      </main>
    );
  }

  /* -------------------------------------------------------
     VERIFICATION FAILED
  ------------------------------------------------------- */

  if (!isVerified) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10">
            <IconShieldX size={29} stroke={1.8} />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-800 dark:text-white">
            Invitation Verification Failed
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {verificationError || "We could not verify your invitation."}
          </p>

          <p className="mt-5 text-xs text-slate-400">
            Your invitation may have expired or already been used.
            Please contact your platform administrator for a new link.
          </p>

        </div>
      </main>
    );
  }

  /* -------------------------------------------------------
     SUCCESS STATE
  ------------------------------------------------------- */

  if (isCompleted) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
            <IconCheck size={30} stroke={2} />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-slate-800 dark:text-white">
            Onboarding Completed!
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Your company has been successfully onboarded and your
            administrator account is ready.
          </p>

          <button
            type="button"
            className="btn btn-primary mt-6 w-full"
            onClick={() => navigate(ROUTES.AUTH.LOGIN)}
          >
            Continue to Login
          </button>

        </div>
      </main>
    );
  }

  /* -------------------------------------------------------
     MAIN ONBOARDING FORM
  ------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">

        <PageHeaderBanner
          title="Complete Company Onboarding"
          description="Provide your company and administrator details to activate your account."
        />

        {/* VERIFIED STATUS */}

        <div className="mb-6 mt-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">

          <IconShieldCheck
            size={21}
            stroke={1.8}
            className="shrink-0 text-emerald-600 dark:text-emerald-400"
          />

          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Invitation Verified
            </p>

            <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
              Your invitation is valid. You can now complete your company setup.
            </p>
          </div>

        </div>

        <form
          onSubmit={formik.handleSubmit}
          className="space-y-4"
          noValidate
        >

          {/* =================================================
              1. ADMINISTRATOR DETAILS
          ================================================= */}

          <FormSection
            title="Administrator Details"
            description="Set up the primary company administrator account."
            icon={IconUser}
            collapsible={true}
            open={openSections.administrator}
            onToggle={() => toggleSection("administrator")}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <InputField
                label="Administrator Name"
                placeholder="Enter administrator name"
                required
                {...getFieldProps("displayName")}
              />

              <InputField
                label="Password"
                type="password"
                placeholder="Create a secure password"
                required
                icon={IconLock}
                helperText="Password must contain at least 12 characters."
                {...getFieldProps("password")}
              />

            </div>

          
          </FormSection>

          {/* =================================================
              2. COMPANY INFORMATION
          ================================================= */}

          <FormSection
            title="Company Information"
            description="Enter your company's legal and registration details."
            icon={IconBuildingSkyscraper}
            collapsible={true}
            open={openSections.company}
            onToggle={() => toggleSection("company")}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <InputField
                label="Legal Company Name"
                placeholder="Enter registered legal name"
                required
                {...getCompanyFieldProps("legalName")}
              />

              <SelectField
                label="Entity Type"
                name="company.entityType"
                value={formik.values.company.entityType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.company?.entityType}
                touched={formik.touched.company?.entityType}
                required
                options={[
                  { value: "PRIVATE_LIMITED", label: "Private Limited" },
                  { value: "PUBLIC_LIMITED", label: "Public Limited" },
                  { value: "LLP", label: "Limited Liability Partnership" },
                  { value: "PARTNERSHIP", label: "Partnership" },
                  { value: "PROPRIETORSHIP", label: "Proprietorship" },
                  { value: "ONE_PERSON_COMPANY", label: "One Person Company" },
                  { value: "OTHER", label: "Other" },
                ]}
              />

              <InputField
                label="Trade Name"
                placeholder="Enter trade name (if applicable)"
                {...getCompanyFieldProps("tradeName")}
              />

              <InputField
                label="Date of Formation"
                type="date"
                required
                {...getCompanyFieldProps("formedOn")}
              />

              <InputField
                label="PAN Number"
                placeholder="ABCDE1234F"
                required
                maxLength={10}
                {...getCompanyFieldProps("pan")}
              />

              <InputField
                label="CIN Number"
                placeholder="Enter CIN (if applicable)"
                maxLength={21}
                {...getCompanyFieldProps("cin")}
              />

              <div className="md:col-span-2">
                <InputField
                  label="Company Website"
                  placeholder="https://www.example.com"
                  {...getCompanyFieldProps("website")}
                />
              </div>

            </div>
          </FormSection>

          {/* =================================================
              3. REGISTERED OFFICE & CONTACT
          ================================================= */}

          <FormSection
            title="Registered Office & Contact"
            description="Provide your company's registered address and contact information."
            icon={IconMapPin}
            collapsible={true}
            open={openSections.registeredOffice}
            onToggle={() => toggleSection("registeredOffice")}
          >
            <div className="space-y-6">

              {/* Registered Address */}

              <div>
                <h4 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Registered Address
                </h4>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <div className="md:col-span-2">
                    <InputField
                      label="Address Line 1"
                      placeholder="Building, street, plot number"
                      required
                      {...getCompanyFieldProps("regAddressLine1")}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <InputField
                      label="Address Line 2"
                      placeholder="Landmark, area, additional address"
                      {...getCompanyFieldProps("regAddressLine2")}
                    />
                  </div>

                  <InputField
                    label="Locality"
                    placeholder="Enter locality"
                    required
                    {...getCompanyFieldProps("regLocality")}
                  />

                  <InputField
                    label="City"
                    placeholder="Enter city"
                    required
                    {...getCompanyFieldProps("regCity")}
                  />

                  <InputField
                    label="District"
                    placeholder="Enter district"
                    required
                    {...getCompanyFieldProps("regDistrict")}
                  />

                  <InputField
                    label="State / UT"
                    placeholder="Enter state or union territory"
                    required
                    {...getCompanyFieldProps("regStateUt")}
                  />

                  <InputField
                    label="PIN Code"
                    placeholder="6-digit PIN code"
                    maxLength={6}
                    required
                    {...getCompanyFieldProps("regPin")}
                  />

                  <SelectField
                    label="Country"
                    name="company.regCountry"
                    value={formik.values.company.regCountry}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.errors.company?.regCountry}
                    touched={formik.touched.company?.regCountry}
                    required
                    options={[
                      { value: "IN", label: "India" },
                    ]}
                  />

                </div>
              </div>

              {/* Contact Information */}

              <div className="border-t border-slate-100 pt-5 dark:border-slate-700">

                <h4 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Contact Information
                </h4>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <InputField
                    label="Contact Person"
                    placeholder="Enter contact person's name"
                    required
                    {...getCompanyFieldProps("contactName")}
                  />

                  <InputField
                    label="Designation"
                    placeholder="e.g. Managing Director"
                    required
                    {...getCompanyFieldProps("contactDesignation")}
                  />

                  <InputField
                    label="Contact Email"
                    type="email"
                    placeholder="contact@company.com"
                    required
                    {...getCompanyFieldProps("contactEmail")}
                  />

                  <InputField
                    label="Contact Phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    required
                    {...getCompanyFieldProps("contactPhone")}
                  />

                </div>
              </div>

            </div>
          </FormSection>

          {/* =================================================
              4. HEAD OFFICE
          ================================================= */}

          <FormSection
            title="Head Office"
            description="Configure the primary office for your company."
            icon={IconBuilding}
            open={openSections.headOffice}
            onToggle={() => toggleSection("headOffice")}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <InputField
                label="Office Code"
                placeholder="e.g. HQ"
                required
                maxLength={30}
                {...getHeadOfficeFieldProps("code")}
              />

              <InputField
                label="Office Name"
                placeholder="e.g. Corporate Head Office"
                required
                maxLength={120}
                {...getHeadOfficeFieldProps("name")}
              />

              <div className="md:col-span-2">

                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">

                  <input
                    type="checkbox"
                    name="headOffice.isPrimary"
                    checked={formik.values.headOffice.isPrimary}
                    onChange={formik.handleChange}
                    className="form-checkbox"
                    // className="h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                  />

                  Set this as the primary company office

                </label>

              </div>

            </div>
          </FormSection>

          {/* =================================================
              FORM ACTIONS
          ================================================= */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please review your details before submitting.
            </p>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCompletingOnboarding}
            >
              <IconClipboardCheck size={17} stroke={1.8} />
              Review & Continue
            </button>

          </div>

        </form>
      </div>

      {/* =================================================
          CONFIRMATION MODAL
      ================================================= */}

      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirm}
        values={formik.values}
        loading={isCompletingOnboarding}
      />

    </main>
  );
};

export default VerifyOnboardingPage;
