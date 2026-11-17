
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";

import {
  IconBuilding,
  IconBuildingCommunity,
  IconBriefcase,
  IconMapPin,
  IconArrowLeft,
  IconDeviceFloppy,
} from "@tabler/icons-react";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import FormSection from "@components/ui/FormSection";
import ModalAction from "@components/ui/ModalAction";

import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";

import { createDepartment } from "@store/slices/department.slice";
import { listProjects } from "@store/slices/project.slice";
import { listSites } from "@store/slices/site.slice";

import { ROUTES } from "@constants/routes";

const CATEGORY_OPTIONS = [
  { value: "FINANCE", label: "Finance" },
  { value: "ADMINISTRATION", label: "Administration" },
  { value: "HR", label: "Human Resources" },
  { value: "PROCUREMENT", label: "Procurement" },
  { value: "STORE", label: "Store" },
  { value: "MACHINERY", label: "Machinery" },
  { value: "SAFETY", label: "Safety" },
  { value: "QUALITY", label: "Quality" },
  { value: "SITE_ENGINEERING", label: "Site Engineering" },
  { value: "KITCHEN", label: "Kitchen" },
  { value: "OPERATIONS", label: "Operations" },
  { value: "CUSTOM", label: "Custom" },
];

const SCOPE_OPTIONS = [
  {
    value: "COMPANY",
    label: "Company",
    description: "Available across the entire company.",
    icon: IconBuildingCommunity,
  },
  {
    value: "PROJECT",
    label: "Project",
    description: "Belongs to a specific project.",
    icon: IconBriefcase,
  },
  {
    value: "SITE",
    label: "Site",
    description: "Belongs to a specific site.",
    icon: IconMapPin,
  },
];

const validationSchema = Yup.object({
  scopeType: Yup.string()
    .oneOf(["COMPANY", "PROJECT", "SITE"])
    .required("Please select a department scope"),

  scopeId: Yup.string().when("scopeType", {
    is: (value) => value === "PROJECT" || value === "SITE",
    then: (schema) =>
      schema.uuid("Enter a valid UUID").required("Please select a scope"),
    otherwise: (schema) => schema.notRequired(),
  }),

  code: Yup.string()
    .trim()
    .uppercase()
    .matches(
      /^[A-Z0-9_-]+$/,
      "Only uppercase letters, numbers, hyphens and underscores are allowed",
    )
    .min(1, "Department code is required")
    .max(40, "Maximum 40 characters allowed")
    .required("Department code is required"),

  name: Yup.string()
    .trim()
    .min(1, "Department name is required")
    .max(200, "Maximum 200 characters allowed")
    .required("Department name is required"),

  category: Yup.string()
    .oneOf(CATEGORY_OPTIONS.map((item) => item.value))
    .required("Please select a department category"),

  categoryLabel: Yup.string().when("category", {
    is: "CUSTOM",
    then: (schema) =>
      schema
        .trim()
        .max(80, "Maximum 80 characters allowed")
        .required("Custom category name is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const initialValues = {
  scopeType: "COMPANY",
  scopeId: "",
  code: "",
  name: "",
  category: "",
  categoryLabel: "",
};

const CreateDepartmentPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const { isCreatingDepartment } = useSelector((state) => state.department);

  const { isListingProjects, projectsData } = useSelector(
    (state) => state.project,
  );

  const { isListingSites, sitesData } = useSelector(
    (state) => state.site,
  );

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: () => {
      setIsConfirmationOpen(true);
    },
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldTouched,
  } = formik;

  const getFieldProps = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] && errors[name],
  });

  const isScoped = values.scopeType !== "COMPANY";
  const isCustomCategory = values.category === "CUSTOM";

  const getListData = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const projects = getListData(projectsData);
  const sites = getListData(sitesData);

  const scopeOptions =
    values.scopeType === "PROJECT"
      ? projects.map((project) => ({
          value: project.id,
          label: `${project.name || "Untitled Project"}${
            project.code ? ` (${project.code})` : ""
          }`,
        }))
      : sites.map((site) => ({
          value: site.id,
          label: `${site.name || "Untitled Site"}${
            site.code ? ` (${site.code})` : ""
          }`,
        }));

  const isLoadingScope =
    values.scopeType === "PROJECT" ? isListingProjects : isListingSites;

  const handleScopeChange = (scopeType) => {
    setFieldValue("scopeType", scopeType);
    setFieldValue("scopeId", "");
    setFieldTouched("scopeId", false);

    if (scopeType === "PROJECT" && !projectsData && !isListingProjects) {
      dispatch(listProjects());
    }

    if (scopeType === "SITE" && !sitesData && !isListingSites) {
      dispatch(listSites());
    }
  };

  const handleCloseConfirmation = () => {
    if (isCreatingDepartment) return;
    setIsConfirmationOpen(false);
  };

  const handleConfirm = async () => {
    const currentValues = formik.values;

    const payload = {
      scopeType: currentValues.scopeType,
      code: currentValues.code.trim().toUpperCase(),
      name: currentValues.name.trim(),
      category: currentValues.category,
    };

    if (currentValues.scopeType !== "COMPANY") {
      payload.scopeId = currentValues.scopeId.trim();
    }

    if (currentValues.category === "CUSTOM") {
      payload.categoryLabel = currentValues.categoryLabel.trim();
    }

    try {
      await dispatch(createDepartment(payload)).unwrap();

      setIsConfirmationOpen(false);
      navigate(ROUTES.DEPARTMENTS.ROOT);
    } catch (error) {
      // Error notification is handled by the Redux slice.
    }
  };

  return (
    <main className="min-h-screen space-y-6">
      <PageHeaderBanner title="Create Department" />

      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="space-y-5">
          {/* Department Scope */}
          <FormSection
            title="Department Scope"
            description="Choose the organizational level where this department will operate."
            icon={IconBuildingCommunity}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {SCOPE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const selected = values.scopeType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleScopeChange(option.value)}
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                      selected
                        ? "border-primary-500 bg-primary-500/5 ring-1 ring-primary-500/20"
                        : "border-border bg-background hover:border-primary-300 hover:bg-muted/30"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        selected
                          ? "bg-primary-500/10 text-primary-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon size={19} stroke={1.8} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {option.label}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {option.description}
                      </p>
                    </div>

                    <span
                      className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        selected ? "border-primary-500" : "border-border"
                      }`}
                    >
                      {selected && (
                        <span className="h-2 w-2 rounded-full bg-primary-500" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {isScoped && (
              <div className="mt-5 w-full">
                <SelectField
                  label={values.scopeType === "PROJECT" ? "Project" : "Site"}
                  name="scopeId"
                  required
                  placeholder={
                    isLoadingScope
                      ? `Loading ${values.scopeType.toLowerCase()}s...`
                      : `Select ${values.scopeType.toLowerCase()}`
                  }
                  options={scopeOptions}
                  value={values.scopeId}
                  onChange={(event) =>
                    setFieldValue("scopeId", event.target.value)
                  }
                  onBlur={() => setFieldTouched("scopeId", true)}
                  error={touched.scopeId && errors.scopeId}
                  loading={isLoadingScope}
                  emptyText={`No ${values.scopeType.toLowerCase()}s available`}
                />
              </div>
            )}
          </FormSection>

          {/* Department Information */}
          <FormSection
            title="Department Information"
            description="Provide the department's identification and classification."
            icon={IconBuilding}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <InputField
                label="Department Code"
                placeholder="e.g. SITE-ENG"
                required
                maxLength={40}
                helperText="Use uppercase letters, numbers, hyphens or underscores."
                {...getFieldProps("code")}
                onChange={(event) =>
                  setFieldValue("code", event.target.value.toUpperCase())
                }
              />

              <InputField
                label="Department Name"
                placeholder="e.g. Site Engineering"
                required
                maxLength={200}
                {...getFieldProps("name")}
              />

              <div className="md:col-span-2">
                <SelectField
                  label="Department Category"
                  name="category"
                  required
                  placeholder="Select department category"
                  options={CATEGORY_OPTIONS}
                  value={values.category}
                  onChange={(event) => {
                    handleChange(event);

                    if (event.target.value !== "CUSTOM") {
                      setFieldValue("categoryLabel", "");
                      setFieldTouched("categoryLabel", false);
                    }
                  }}
                  onBlur={handleBlur}
                  error={touched.category && errors.category}
                />
              </div>

              {isCustomCategory && (
                <div className="md:col-span-2">
                  <InputField
                    label="Custom Category Name"
                    placeholder="Enter your department category"
                    required
                    maxLength={80}
                    {...getFieldProps("categoryLabel")}
                  />
                </div>
              )}
            </div>
          </FormSection>

          {/* Form Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => navigate(ROUTES.DEPARTMENTS.ROOT)}
              className="btn btn-outline"
              disabled={isCreatingDepartment}
            >
              <IconArrowLeft size={17} stroke={1.8} />
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreatingDepartment}
            >
              <IconDeviceFloppy size={17} stroke={1.8} />
              Create Department
            </button>
          </div>
        </div>
      </form>

      {/* Create Department Confirmation */}
      <ModalAction
        id="create-department-confirmation"
        isOpen={isConfirmationOpen}
        onClose={handleCloseConfirmation}
        onSubmit={handleConfirm}
        title="Create Department?"
        desc="Are you sure you want to create this department?"
        icon={IconBuilding}
        theme="primary"
        submitText="Confirm & Create"
        loadingText="Creating..."
        cancelText="Go Back"
        loading={isCreatingDepartment}
        closeOnBackdrop={!isCreatingDepartment}
        closeOnEscape={!isCreatingDepartment}
        showCancel
      />
    </main>
  );
};

export default CreateDepartmentPage;
