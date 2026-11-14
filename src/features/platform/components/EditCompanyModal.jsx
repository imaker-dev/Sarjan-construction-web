import React from "react";
import ModalBasic from "@components/ui/ModalBasic";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateCompany } from "@store/slices/platform.slice";
import { InputField } from "@components/fields/InputField";

const validationSchema = Yup.object({
  name: Yup.string().trim().max(200, "Maximum 200 characters").required("Company name is required"),
  legalName: Yup.string().trim().max(200, "Maximum 200 characters"),
  pan: Yup.string()
    .trim()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
      message: "Invalid PAN format (e.g. ABCDE1234F)",
      excludeEmptyString: true,
    }),
  website: Yup.string().trim().url("Must be a valid URL (e.g. https://example.com)").nullable(),
  contactEmail: Yup.string().trim().email("Must be a valid email address"),
  contactPhone: Yup.string().trim().max(20, "Maximum 20 characters"),
});

export default function EditCompanyModal({ isOpen, onClose, company }) {
  const dispatch = useDispatch();
  const { isUpdatingCompany } = useSelector((state) => state.platform);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: company?.name || "",
      legalName: company?.legalName || "",
      pan: company?.pan || "",
      website: company?.website || "",
      contactEmail: company?.contactEmail || "",
      contactPhone: company?.contactPhone || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!company) return;

      const payload = {
        name: values.name.trim(),
        legalName: values.legalName?.trim() || undefined,
        pan: values.pan?.trim()?.toUpperCase() || undefined,
        website: values.website?.trim() || undefined,
        contactEmail: values.contactEmail?.trim() || undefined,
        contactPhone: values.contactPhone?.trim() || undefined,
        expectedVersion: company.version,
      };

      try {
        await dispatch(
          updateCompany({
            companyId: company.id,
            values: payload,
          })
        ).unwrap();
        onClose();
      } catch {
        // Error toast handled in slice
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;

  const getFieldProps = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] && errors[name],
  });

  if (!company) return null;

  return (
    <ModalBasic
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Profile: ${company.name || company.code}`}
      description="Update customer company profile details."
      size="2xl"
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4 p-6" noValidate>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <InputField
            label="Company Display Name"
            placeholder="e.g. Acme Infrastructure Pvt Ltd"
            required
            {...getFieldProps("name")}
          />

          <InputField
            label="Legal Registered Name"
            placeholder="e.g. Acme Infrastructure Private Limited"
            {...getFieldProps("legalName")}
          />

          <InputField
            label="Company PAN"
            placeholder="e.g. ABCDE1234F"
            maxLength={10}
            {...getFieldProps("pan")}
            onChange={(e) => setFieldValue("pan", e.target.value.toUpperCase())}
          />

          <InputField
            label="Official Website"
            placeholder="https://example.com"
            {...getFieldProps("website")}
          />

          <InputField
            label="Primary Contact Email"
            type="email"
            placeholder="contact@company.com"
            {...getFieldProps("contactEmail")}
          />

          <InputField
            label="Primary Contact Phone"
            type="tel"
            placeholder="+919876543210"
            {...getFieldProps("contactPhone")}
          />
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs text-muted-foreground font-mono">
            Optimistic Lock Version: v{company.version ?? 1}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={isUpdatingCompany}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUpdatingCompany}
            >
              {isUpdatingCompany ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </ModalBasic>
  );
}

