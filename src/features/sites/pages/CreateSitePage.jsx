
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";

import {
  IconMapPin,
  IconBuilding,
  IconMap,
} from "@tabler/icons-react";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import FormSection from "@components/ui/FormSection";
import ModalAction from "@components/ui/ModalAction";

import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";

import { createSite } from "@store/slices/site.slice";
import { listProjects } from "@store/slices/project.slice";

import { ROUTES } from "@constants/routes";
import { ArrowLeft, Check, LoaderCircle } from "lucide-react";

const validationSchema = Yup.object({
  projectId: Yup.string().required("Please select a project"),

  code: Yup.string()
    .trim()
    .max(30, "Site code cannot exceed 30 characters")
    .required("Site code is required"),

  name: Yup.string()
    .trim()
    .max(150, "Site name cannot exceed 150 characters")
    .required("Site name is required"),

  addressLine1: Yup.string()
    .trim()
    .required("Address is required"),

  city: Yup.string()
    .trim()
    .required("City is required"),

  state: Yup.string()
    .trim()
    .required("State is required"),

  pinCode: Yup.string()
    .trim()
    .required("PIN code is required")
    .max(20, "PIN code cannot exceed 20 characters"),

  geoLatitude: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .typeError("Latitude must be a valid number")
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .required("Latitude is required"),

  geoLongitude: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .typeError("Longitude must be a valid number")
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .required("Longitude is required"),

  geoFenceRadiusM: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .typeError("Geofence radius must be a valid number")
    .min(10, "Minimum geofence radius is 10 metres")
    .max(5000, "Maximum geofence radius is 5000 metres")
    .required("Geofence radius is required"),
});

const INITIAL_VALUES = {
  projectId: "",
  code: "",
  name: "",
  addressLine1: "",
  city: "",
  state: "",
  pinCode: "",
  geoLatitude: "",
  geoLongitude: "",
  geoFenceRadiusM: "250",
};

const CreateSitePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isListingProjects, projectsData } = useSelector(
    (state) => state.project,
  );

  const { isCreatingSite } = useSelector((state) => state.site);

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Fetch projects
  useEffect(() => {
    dispatch(listProjects());
  }, [dispatch]);

  // Normalize project list
  const projects = useMemo(() => {
    if (Array.isArray(projectsData)) return projectsData;
    if (Array.isArray(projectsData?.data)) return projectsData.data;
    return [];
  }, [projectsData]);

  // Project dropdown options
  const projectOptions = useMemo(
    () =>
      projects.map((project) => ({
        label: `${project.name} (${project.code})`,
        value: project.id,
      })),
    [projects],
  );

  // Formik
  const formik = useFormik({
    initialValues: INITIAL_VALUES,
    validationSchema,

    onSubmit: () => {
      setIsConfirmationOpen(true);
    },
  });

  // Selected project
  const selectedProject = projects.find(
    (project) => project.id === formik.values.projectId,
  );

  // Shared field props
  const getFieldProps = (name) => ({
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.touched[name] && formik.errors[name],
  });

  // Confirm and create site
  const handleConfirm = async () => {
    try {
      const payload = {
        projectId: formik.values.projectId,
        code: formik.values.code.trim().toUpperCase(),
        name: formik.values.name.trim(),
        addressLine1: formik.values.addressLine1.trim(),
        city: formik.values.city.trim(),
        state: formik.values.state.trim(),
        pinCode: formik.values.pinCode.trim(),
        geoLatitude: Number(formik.values.geoLatitude),
        geoLongitude: Number(formik.values.geoLongitude),
        geoFenceRadiusM: Number(formik.values.geoFenceRadiusM),
      };

      await dispatch(createSite(payload)).unwrap();

      setIsConfirmationOpen(false);
      navigate(ROUTES.SITES.ROOT);
    } catch (error) {
      // Error notification is handled by Redux.
    }
  };

  const handleCloseConfirmation = () => {
    if (isCreatingSite) return;

    setIsConfirmationOpen(false);
  };

  return (
    <div className="space-y-5">
      <PageHeaderBanner title="Create Site" />

      <form onSubmit={formik.handleSubmit} className="space-y-5">

        {/* Project & Site Details */}
        <FormSection
          title="Site Details"
          description="Select the project and enter the basic site information."
          icon={IconBuilding}
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <SelectField
              label="Project"
              name="projectId"
              required
              options={projectOptions}
              placeholder={
                isListingProjects
                  ? "Loading projects..."
                  : "Select project"
              }
              loading={isListingProjects}
              emptyText="No projects available"
              {...getFieldProps("projectId")}
            />

            <InputField
              label="Site Name"
              name="name"
              placeholder="Enter site name"
              required
              {...getFieldProps("name")}
            />

            <InputField
              label="Site Code"
              name="code"
              placeholder="e.g. S-BLOCK-A"
              required
              uppercase
              {...getFieldProps("code")}
            />

          </div>
        </FormSection>

        {/* Site Address */}
        <FormSection
          title="Site Address"
          description="Provide the address details of the construction site."
          icon={IconMapPin}
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <InputField
              label="Address Line 1"
              name="addressLine1"
              placeholder="e.g. Plot 12, Sector 150"
              required
              {...getFieldProps("addressLine1")}
            />

            <InputField
              label="City"
              name="city"
              placeholder="Enter city"
              required
              {...getFieldProps("city")}
            />

            <InputField
              label="State"
              name="state"
              placeholder="Enter state"
              required
              {...getFieldProps("state")}
            />

            <InputField
              label="PIN Code"
              name="pinCode"
              placeholder="Enter PIN code"
              required
              {...getFieldProps("pinCode")}
            />

          </div>
        </FormSection>

        {/* Geographical Settings */}
        <FormSection
          title="Geographical Settings"
          description="Configure the geographical coordinates and geofence radius for this site."
          icon={IconMap}
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <InputField
              label="Latitude"
              name="geoLatitude"
              type="number"
              placeholder="e.g. 28.3957"
              required
              {...getFieldProps("geoLatitude")}
            />

            <InputField
              label="Longitude"
              name="geoLongitude"
              type="number"
              placeholder="e.g. 77.3219"
              required
              {...getFieldProps("geoLongitude")}
            />

            <InputField
              label="Geofence Radius (Meters)"
              name="geoFenceRadiusM"
              type="number"
              placeholder="10 - 5000"
              required
              {...getFieldProps("geoFenceRadiusM")}
            />

          </div>

          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Allowed geofence radius: 10 to 5,000 metres.
          </p>
        </FormSection>

        {/* Form Actions */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-700">
          <button
            type="button"
            onClick={() => navigate(ROUTES.SITES.ROOT)}
            disabled={isCreatingSite}
            className="btn btn-outline"
          >
            <ArrowLeft size={17} strokeWidth={1.8} />
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              isCreatingSite ||
              isListingProjects ||
              !projects.length
            }
            className="btn btn-primary"
          >
            {isCreatingSite ? (
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
        id="create-site-confirmation"
        isOpen={isConfirmationOpen}
        onClose={handleCloseConfirmation}
        onSubmit={handleConfirm}
        title="Create Site?"
        desc="Are you sure you want to create this site?"
        icon={IconMapPin}
        theme="primary"
        submitText="Confirm & Create"
        loadingText="Creating..."
        cancelText="Go Back"
        loading={isCreatingSite}
        closeOnBackdrop={!isCreatingSite}
        closeOnEscape={!isCreatingSite}
        showCancel
      >
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {formik.values.name || "Untitled Site"}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Site Code: {formik.values.code || "—"}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Project: {selectedProject?.name || "—"}
          </p>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
          This will create a new site under the selected project.
        </p>
      </ModalAction>
    </div>
  );
};

export default CreateSitePage;
