
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";

import {
  IconUser,
  IconBriefcase,
  IconPhone,
  IconArrowLeft,
  IconDeviceFloppy,
} from "@tabler/icons-react";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import FormSection from "@components/ui/FormSection";
import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";

import { createEmployee } from "@store/slices/employee.slice";
import { ROUTES } from "@constants/routes";

const ENGAGEMENT_OPTIONS = [
  { value: "DIRECT_EMPLOYEE", label: "Direct Employee" },
  { value: "CONTRACTOR_WORKER", label: "Contractor Worker" },
  { value: "DAILY_WAGE", label: "Daily Wage" },
  { value: "APPRENTICE", label: "Apprentice" },
  { value: "CONSULTANT", label: "Consultant" },
  { value: "OTHER", label: "Other" },
];

const validationSchema = Yup.object({
  employeeCode: Yup.string()
    .trim()
    .uppercase()
    .matches(
      /^[A-Z0-9_-]+$/,
      "Only uppercase letters, numbers, hyphens and underscores are allowed",
    )
    .min(1, "Employee code is required")
    .max(40, "Maximum 40 characters allowed")
    .required("Employee code is required"),

  displayName: Yup.string()
    .trim()
    .min(1, "Employee name is required")
    .max(200, "Maximum 200 characters allowed")
    .required("Employee name is required"),

  engagementType: Yup.string()
    .oneOf(ENGAGEMENT_OPTIONS.map((option) => option.value))
    .required("Please select an engagement type"),

  designation: Yup.string()
    .trim()
    .max(120, "Maximum 120 characters allowed"),

  tradeCategory: Yup.string()
    .trim()
    .max(80, "Maximum 80 characters allowed"),

  joiningDate: Yup.string()
    .nullable()
    .test(
      "valid-date",
      "Enter a valid joining date",
      (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
    ),

  contactPhone: Yup.string()
    .trim()
    .max(20, "Maximum 20 characters allowed"),

  contactEmail: Yup.string()
    .trim()
    .email("Enter a valid email address"),

  emergencyContactName: Yup.string()
    .trim()
    .max(200, "Maximum 200 characters allowed"),

  emergencyContactPhone: Yup.string()
    .trim()
    .max(20, "Maximum 20 characters allowed"),
}).test(
  "emergency-contact-pair",
  "Both emergency contact name and phone are required",
  function (values) {
    const hasName = Boolean(values?.emergencyContactName?.trim());
    const hasPhone = Boolean(values?.emergencyContactPhone?.trim());

    if (hasName === hasPhone) return true;

    return this.createError({
      path: hasName
        ? "emergencyContactPhone"
        : "emergencyContactName",
      message: "Both emergency contact name and phone are required",
    });
  },
);

const initialValues = {
  employeeCode: "",
  displayName: "",
  engagementType: "",
  designation: "",
  tradeCategory: "",
  joiningDate: "",
  contactPhone: "",
  contactEmail: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
};

const CreateEmployeePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isCreatingEmployee } = useSelector(
    (state) => state.employee,
  );

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        employeeCode: values.employeeCode.trim().toUpperCase(),
        displayName: values.displayName.trim(),
        engagementType: values.engagementType,
      };

      // Optional fields: include only when provided.
      const optionalFields = [
        "designation",
        "tradeCategory",
        "joiningDate",
        "contactPhone",
        "contactEmail",
        "emergencyContactName",
        "emergencyContactPhone",
      ];

      optionalFields.forEach((field) => {
        const value = values[field];

        if (value?.trim()) {
          payload[field] = value.trim();
        }
      });

      try {
        await dispatch(createEmployee(payload)).unwrap();
        navigate(ROUTES.EMPLOYEES.ROOT);
      } catch (error) {
        // Error notification is handled by the Redux slice.
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
  } = formik;

  const getFieldProps = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] && errors[name],
  });

  return (
    <main className="min-h-screen space-y-6">
      <PageHeaderBanner
        title="Create Employee"
        description="Add an employee to your organization and provide their employment and contact details."
      />

      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="space-y-5">

          {/* Employee Information */}
          <FormSection
            title="Employee Information"
            description="Provide the employee's basic identification details."
            icon={IconUser}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <InputField
                label="Employee Code"
                placeholder="e.g. EMP-002"
                required
                maxLength={40}
                helperText="Use uppercase letters, numbers, hyphens or underscores."
                {...getFieldProps("employeeCode")}
                onChange={(event) =>
                  setFieldValue(
                    "employeeCode",
                    event.target.value.toUpperCase(),
                  )
                }
              />

              <InputField
                label="Employee Name"
                placeholder="e.g. Vikram Singh"
                required
                maxLength={200}
                {...getFieldProps("displayName")}
              />
            </div>
          </FormSection>

          {/* Employment Details */}
          <FormSection
            title="Employment Details"
            description="Define the employee's engagement type and professional details."
            icon={IconBriefcase}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <SelectField
                label="Engagement Type"
                name="engagementType"
                required
                placeholder="Select engagement type"
                options={ENGAGEMENT_OPTIONS}
                {...getFieldProps("engagementType")}
              />

              <InputField
                label="Designation"
                placeholder="e.g. Project Manager"
                maxLength={120}
                {...getFieldProps("designation")}
              />

              <InputField
                label="Trade Category"
                placeholder="e.g. Execution"
                maxLength={80}
                helperText="Optional employee trade or work category."
                {...getFieldProps("tradeCategory")}
              />

              <InputField
                label="Joining Date"
                type="date"
                {...getFieldProps("joiningDate")}
              />
            </div>
          </FormSection>

          {/* Contact Details */}
          <FormSection
            title="Contact & Emergency Details"
            description="Add the employee's contact information and emergency contact details."
            icon={IconPhone}
          >
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <InputField
                  label="Contact Phone"
                  placeholder="e.g. +919811122233"
                  maxLength={20}
                  {...getFieldProps("contactPhone")}
                />

                <InputField
                  label="Contact Email"
                  type="email"
                  placeholder="e.g. vikram@acmeinfra.com"
                  {...getFieldProps("contactEmail")}
                />
              </div>

              <div className="border-t border-border pt-5">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Emergency Contact
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Provide both the contact name and phone number, or
                    leave both fields empty.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <InputField
                    label="Emergency Contact Name"
                    placeholder="e.g. Sunita Singh"
                    maxLength={200}
                    {...getFieldProps("emergencyContactName")}
                  />

                  <InputField
                    label="Emergency Contact Phone"
                    placeholder="e.g. +919811122234"
                    maxLength={20}
                    {...getFieldProps("emergencyContactPhone")}
                  />
                </div>
              </div>
            </div>
          </FormSection>

          {/* Form Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => navigate(ROUTES.EMPLOYEES.ROOT)}
              className="btn btn-outline"
              disabled={isCreatingEmployee}
            >
              <IconArrowLeft size={17} stroke={1.8} />
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreatingEmployee}
            >
              <IconDeviceFloppy size={17} stroke={1.8} />
              {isCreatingEmployee
                ? "Creating Employee..."
                : "Create Employee"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
};

export default CreateEmployeePage;
