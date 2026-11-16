import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";

import { IconBriefcase, IconMapPin, IconCalendar } from "@tabler/icons-react";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import FormSection from "@components/ui/FormSection";
import ModalAction from "@components/ui/ModalAction";

import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import { TextareaField } from "@components/fields/TextareaField";

import { createProject } from "@store/slices/project.slice";
import { ROUTES } from "@constants/routes";
import { ArrowLeft, Check, LoaderCircle } from "lucide-react";

const PROJECT_TYPES = [
  { label: "Residential", value: "RESIDENTIAL" },
  { label: "Commercial", value: "COMMERCIAL" },
  { label: "Industrial", value: "INDUSTRIAL" },
  { label: "Infrastructure", value: "INFRASTRUCTURE" },
  { label: "Institutional", value: "INSTITUTIONAL" },
  { label: "Mixed Use", value: "MIXED_USE" },
  { label: "Renovation", value: "RENOVATION" },
  { label: "Other", value: "OTHER" },
];

const TIMEZONE_OPTIONS = [
  { label: "India Standard Time (UTC+05:30)", value: "Asia/Kolkata" },
  { label: "Dubai (UTC+04:00)", value: "Asia/Dubai" },
  { label: "Singapore (UTC+08:00)", value: "Asia/Singapore" },
  { label: "London", value: "Europe/London" },
  { label: "Central European Time", value: "Europe/Berlin" },
  { label: "Eastern Time (US)", value: "America/New_York" },
  { label: "Central Time (US)", value: "America/Chicago" },
  { label: "Pacific Time (US)", value: "America/Los_Angeles" },
  { label: "Australia Eastern Time", value: "Australia/Sydney" },
  { label: "Japan Standard Time (UTC+09:00)", value: "Asia/Tokyo" },
];

const validationSchema = Yup.object({
  code: Yup.string()
    .trim()
    .max(30, "Project code cannot exceed 30 characters")
    .required("Project code is required"),

  name: Yup.string()
    .trim()
    .max(150, "Project name cannot exceed 150 characters")
    .required("Project name is required"),

  projectType: Yup.string()
    .oneOf(PROJECT_TYPES.map((type) => type.value))
    .required("Project type is required"),

  clientName: Yup.string()
    .trim()
    .max(150, "Client name cannot exceed 150 characters")
    .required("Client name is required"),

  contractRef: Yup.string()
    .trim()
    .max(100, "Contract reference cannot exceed 100 characters")
    .nullable(),

  locationCity: Yup.string().trim().required("City is required"),

  locationDistrict: Yup.string().trim().required("District is required"),

  locationState: Yup.string().trim().required("State is required"),

  locationPin: Yup.string()
    .trim()
    .required("PIN code is required")
    .max(20, "PIN code cannot exceed 20 characters"),

  timezone: Yup.string()
    .oneOf(
      TIMEZONE_OPTIONS.map((timezone) => timezone.value),
      "Please select a valid timezone",
    )
    .required("Timezone is required"),

  description: Yup.string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .nullable(),

  startDate: Yup.string().required("Start date is required"),

  endDate: Yup.string()
    .required("End date is required")
    .test(
      "end-date-after-start",
      "End date cannot be earlier than start date",
      function (value) {
        const { startDate } = this.parent;

        if (!value || !startDate) return true;

        return value >= startDate;
      },
    ),
});

const INITIAL_VALUES = {
  code: "",
  name: "",
  projectType: "RESIDENTIAL",
  clientName: "",
  contractRef: "",
  locationCity: "",
  locationDistrict: "",
  locationState: "",
  locationPin: "",
  timezone: "Asia/Kolkata",
  description: "",
  startDate: "",
  endDate: "",
};

const CreateProjectPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isCreatingProject } = useSelector((state) => state.project);

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const formik = useFormik({
    initialValues: INITIAL_VALUES,
    validationSchema,

    onSubmit: () => {
      setIsConfirmationOpen(true);
    },
  });

  const getFieldProps = (name) => ({
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.touched[name] && formik.errors[name],
  });

  const handleConfirm = async () => {
    try {
      const payload = {
        code: formik.values.code.trim(),
        name: formik.values.name.trim(),
        projectType: formik.values.projectType,
        clientName: formik.values.clientName.trim(),
        contractRef: formik.values.contractRef.trim(),
        locationCity: formik.values.locationCity.trim(),
        locationDistrict: formik.values.locationDistrict.trim(),
        locationState: formik.values.locationState.trim(),
        locationPin: formik.values.locationPin.trim(),
        timezone: formik.values.timezone.trim(),
        description: formik.values.description.trim(),
        startDate: formik.values.startDate,
        endDate: formik.values.endDate,
      };

      await dispatch(createProject(payload)).unwrap();

      setIsConfirmationOpen(false);
      navigate(ROUTES.PROJECTS.ROOT);
    } catch (error) {
      // Error notification is handled by Redux.
    }
  };

  const handleCloseConfirmation = () => {
    if (isCreatingProject) return;

    setIsConfirmationOpen(false);
  };

  return (
    <div className="space-y-5">
      <PageHeaderBanner title="Create Project" />

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        {/* Project Details */}
        <FormSection
          title="Project Details"
          description="Enter the basic information and client details for this project."
          icon={IconBriefcase}
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <InputField
              label="Project Name"
              name="name"
              placeholder="Enter project name"
              required
              {...getFieldProps("name")}
            />

            <InputField
              label="Project Code"
              name="code"
              placeholder="e.g. PRJ-001"
              required
              uppercase
              {...getFieldProps("code")}
            />

            <SelectField
              label="Project Type"
              name="projectType"
              required
              options={PROJECT_TYPES}
              placeholder="Select project type"
              {...getFieldProps("projectType")}
            />

            <InputField
              label="Client Name"
              name="clientName"
              placeholder="Enter client name"
              required
              {...getFieldProps("clientName")}
            />

            <InputField
              label="Contract Reference"
              name="contractRef"
              placeholder="Enter contract reference"
              {...getFieldProps("contractRef")}
            />
          </div>
        </FormSection>

        {/* Project Location */}
        <FormSection
          title="Project Location"
          description="Specify where the project is located and timezone"
          icon={IconMapPin}
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <InputField
              label="City"
              name="locationCity"
              placeholder="Enter city"
              required
              {...getFieldProps("locationCity")}
            />

            <InputField
              label="District"
              name="locationDistrict"
              placeholder="Enter district"
              required
              {...getFieldProps("locationDistrict")}
            />

            <InputField
              label="State"
              name="locationState"
              placeholder="Enter state"
              required
              {...getFieldProps("locationState")}
            />

            <InputField
              label="PIN Code"
              name="locationPin"
              placeholder="Enter PIN code"
              required
              {...getFieldProps("locationPin")}
            />
            <SelectField
              label="Timezone"
              name="timezone"
              required
              options={TIMEZONE_OPTIONS}
              placeholder="Select timezone"
              {...getFieldProps("timezone")}
            />
          </div>
        </FormSection>

        {/* Project Timeline */}
        <FormSection
          title="Project Timeline & Description"
          description="Define the project schedule and provide additional information."
          icon={IconCalendar}
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <InputField
              label="Start Date"
              name="startDate"
              type="date"
              required
              {...getFieldProps("startDate")}
            />

            <InputField
              label="End Date"
              name="endDate"
              type="date"
              required
              {...getFieldProps("endDate")}
            />

            <div className="md:col-span-2">
              <TextareaField
                label="Project Description"
                name="description"
                placeholder="Enter project description..."
                rows={4}
                maxLength={1000}
                {...getFieldProps("description")}
              />
            </div>
          </div>
        </FormSection>

        {/* Form Actions */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
          <button
            type="button"
            onClick={() => navigate(ROUTES.PROJECTS.ROOT)}
            disabled={isCreatingProject}
            className="btn btn-outline"
          >
            <ArrowLeft size={17} strokeWidth={1.8} />
            Cancel
          </button>

          <button
            type="submit"
            disabled={isCreatingProject}
            className="btn btn-primary"
          >
            {isCreatingProject ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check size={18} strokeWidth={2} />
                Review & Create
              </>
            )}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <ModalAction
        id="create-project-confirmation"
        isOpen={isConfirmationOpen}
        onClose={handleCloseConfirmation}
        onSubmit={handleConfirm}
        title="Create Project?"
        desc="Are you sure you want to create this project?"
        icon={IconBriefcase}
        theme="primary"
        submitText="Confirm & Create"
        loadingText="Creating..."
        cancelText="Go Back"
        loading={isCreatingProject}
        closeOnBackdrop={!isCreatingProject}
        closeOnEscape={!isCreatingProject}
        showCancel
      >
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {formik.values.name || "Untitled Project"}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Project Code: {formik.values.code || "—"}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Client: {formik.values.clientName || "—"}
          </p>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
          This will create a new project in your organization.
        </p>
      </ModalAction>
    </div>
  );
};

export default CreateProjectPage;
