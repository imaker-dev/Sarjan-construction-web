import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";

import {
  IconBuildingSkyscraper,
  IconMapPin,
  IconUser,
  IconCheck,
  IconArrowLeft,
} from "@tabler/icons-react";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import FormSection from "@components/ui/FormSection";
import ModalAction from "@components/ui/ModalAction";
import { InputField } from "@components/fields/InputField";

import { ROUTES } from "@constants/routes";
import { createHeadOffice } from "@store/slices/head-office.slice";
import { useQueryParams } from "@hooks/useQueryParams";

// --------------------------------------------------
// VALIDATION SCHEMA
// --------------------------------------------------

const validationSchema = Yup.object({
  code: Yup.string()
    .trim()
    .max(30, "Maximum 30 characters allowed")
    .required("Office code is required"),

  name: Yup.string()
    .trim()
    .max(120, "Maximum 120 characters allowed")
    .required("Office name is required"),

  isPrimary: Yup.boolean(),

  legalName: Yup.string().trim().max(200, "Maximum 200 characters allowed"),

  addressLine1: Yup.string().trim().required("Address line 1 is required"),

  addressLine2: Yup.string(),

  locality: Yup.string().trim().required("Locality is required"),

  city: Yup.string().trim().required("City is required"),

  district: Yup.string().trim().required("District is required"),

  state: Yup.string().trim().required("State is required"),

  pinCode: Yup.string()
    .matches(/^[0-9]{6}$/, "Enter a valid 6-digit PIN code")
    .required("PIN code is required"),

  country: Yup.string().trim().required("Country is required"),

  contactName: Yup.string().trim().required("Contact name is required"),

  contactPhone: Yup.string()
    .matches(/^\+?[0-9\s()-]{8,18}$/, "Enter a valid contact number")
    .required("Contact phone is required"),

  contactEmail: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Contact email is required"),
});

// --------------------------------------------------
// INITIAL VALUES
// --------------------------------------------------

const initialValues = {
  code: "",
  name: "",
  isPrimary: false,

  legalName: "",

  addressLine1: "",
  addressLine2: "",
  locality: "",
  city: "",
  district: "",
  state: "",
  pinCode: "",
  country: "India",

  contactName: "",
  contactPhone: "",
  contactEmail: "",
};

// --------------------------------------------------
// PAGE
// --------------------------------------------------

const CreateHeadOfficePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {get} = useQueryParams();
  const headofficeId = get("headofficeId")

  const { isCreatingHeadOffice } = useSelector((state) => state.headOffice);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);


  // useEffect(() => {
  //   if(!headofficeId) return;
  //   dispatch()
  // },[headofficeId])

  // --------------------------------------------------
  // FORMIK
  // --------------------------------------------------

  const formik = useFormik({
    initialValues,
    validationSchema,

    onSubmit: () => {
      setIsConfirmationOpen(true);
    },
  });

  // --------------------------------------------------
  // FIELD PROPS
  // --------------------------------------------------

  const getFieldProps = (name) => ({
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.touched[name] && formik.errors[name],
  });

  // --------------------------------------------------
  // CONFIRM CREATION
  // --------------------------------------------------

  const handleConfirm = async () => {
    try {
      const payload = {
        ...formik.values,
        code: formik.values.code.trim().toUpperCase(),
        name: formik.values.name.trim(),
        legalName: formik.values.legalName.trim(),
        addressLine1: formik.values.addressLine1.trim(),
        addressLine2: formik.values.addressLine2.trim(),
        locality: formik.values.locality.trim(),
        city: formik.values.city.trim(),
        district: formik.values.district.trim(),
        state: formik.values.state.trim(),
        pinCode: formik.values.pinCode.trim(),
        country: formik.values.country.trim(),
        contactName: formik.values.contactName.trim(),
        contactPhone: formik.values.contactPhone.trim(),
        contactEmail: formik.values.contactEmail.trim(),
      };

      await dispatch(createHeadOffice(payload)).unwrap();

      setIsConfirmationOpen(false);

      navigate(ROUTES.HEAD_OFFICES.ROOT);
    } catch (error) {
      // Error notification is handled by the Redux slice.
    }
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="space-y-5">
      <PageHeaderBanner title="Create Head Office" />

      <form onSubmit={formik.handleSubmit} className="space-y-5" noValidate>
        {/* ==========================================
            1. OFFICE DETAILS
        ========================================== */}

        <FormSection
          title="Office Details"
          description="Provide the basic identification details for this office."
          icon={IconBuildingSkyscraper}
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <InputField
              label="Office Name"
              placeholder="e.g. Corporate Head Office"
              required
              {...getFieldProps("name")}
            />

            <InputField
              label="Office Code"
              placeholder="e.g. HQ"
              required
              maxLength={30}
              {...getFieldProps("code")}
            />

            <div className="md:col-span-2">
              <InputField
                label="Legal Name"
                placeholder="Enter registered legal name"
                {...getFieldProps("legalName")}
              />
            </div>

            <div className="md:col-span-2">
              <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  name="isPrimary"
                  checked={formik.values.isPrimary}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="form-checkbox"
                />
                Set as Primary Head Office
              </label>
            </div>
          </div>
        </FormSection>

        {/* ==========================================
            2. REGISTERED ADDRESS
        ========================================== */}

        <FormSection
          title="Registered Address"
          description="Enter the complete registered address of the head office."
          icon={IconMapPin}
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <InputField
                label="Address Line 1"
                placeholder="Building, street, plot number"
                required
                {...getFieldProps("addressLine1")}
              />
            </div>

            <div className="md:col-span-2">
              <InputField
                label="Address Line 2"
                placeholder="Landmark, area, additional address"
                {...getFieldProps("addressLine2")}
              />
            </div>

            <InputField
              label="Locality"
              placeholder="Enter locality"
              required
              {...getFieldProps("locality")}
            />

            <InputField
              label="City"
              placeholder="Enter city"
              required
              {...getFieldProps("city")}
            />

            <InputField
              label="District"
              placeholder="Enter district"
              required
              {...getFieldProps("district")}
            />

            <InputField
              label="State"
              placeholder="Enter state"
              required
              {...getFieldProps("state")}
            />

            <InputField
              label="PIN Code"
              placeholder="6-digit PIN code"
              maxLength={6}
              required
              {...getFieldProps("pinCode")}
            />

            <InputField
              label="Country"
              placeholder="Enter country"
              required
              {...getFieldProps("country")}
            />
          </div>
        </FormSection>

        {/* ==========================================
            3. CONTACT INFORMATION
        ========================================== */}

        <FormSection
          title="Contact Information"
          description="Add the primary contact person and communication details."
          icon={IconUser}
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <InputField
              label="Contact Person"
              placeholder="Enter contact person's name"
              required
              {...getFieldProps("contactName")}
            />

            <InputField
              label="Contact Phone"
              type="tel"
              placeholder="+91 98765 43210"
              required
              {...getFieldProps("contactPhone")}
            />

            <div className="md:col-span-2">
              <InputField
                label="Contact Email"
                type="email"
                placeholder="office@company.com"
                required
                {...getFieldProps("contactEmail")}
              />
            </div>
          </div>
        </FormSection>

        {/* ==========================================
            FORM ACTIONS
        ========================================== */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
          <button
            type="button"
            onClick={() => navigate(ROUTES.HEAD_OFFICES.ROOT)}
            disabled={isCreatingHeadOffice}
            className="btn btn-outline inline-flex items-center justify-center gap-2"
          >
            <IconArrowLeft size={17} />
            Cancel
          </button>

          <button
            type="submit"
            disabled={isCreatingHeadOffice}
            className="btn btn-primary inline-flex items-center justify-center gap-2"
          >
            <IconCheck size={17} />
            Review & Create
          </button>
        </div>
      </form>

      {/* ==========================================
    CONFIRMATION MODAL
========================================== */}

      <ModalAction
        id="create-head-office-confirmation"
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onSubmit={handleConfirm}
        title="Create Head Office?"
        desc="Are you sure you want to create this head office?"
        icon={IconBuildingSkyscraper}
        theme="primary"
        submitText="Confirm & Create"
        loadingText="Creating..."
        cancelText="Go Back"
        loading={isCreatingHeadOffice}
        closeOnBackdrop={!isCreatingHeadOffice}
        closeOnEscape={!isCreatingHeadOffice}
        showCancel
      >
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {formik.values.name || "Untitled Head Office"}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Office Code: {formik.values.code.toUpperCase() || "—"}
          </p>
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
          This will add a new head office to your organization.
        </p>
      </ModalAction>
    </div>
  );
};

export default CreateHeadOfficePage;
