import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FieldArray, Formik, getIn } from "formik";
import * as Yup from "yup";

import {
  IconArrowLeft,
  IconClock,
  IconCoffee,
  IconDeviceFloppy,
  IconMapPin,
  IconPlus,
  IconSettings,
  IconShieldCheck,
  IconTrash,
  IconWallet,
} from "@tabler/icons-react";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import FormSection from "@components/ui/FormSection";
import ModalAction from "@components/ui/ModalAction";

import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import { TextareaField } from "@components/fields/TextareaField";

import {
  createAttendancePolicy,
  getAttendancePolicy,
  updateAttendancePolicy,
} from "@store/slices/attendance.slice";
import { ROUTES } from "@constants/routes";
import { handleResponse } from "@utils/async.utils";
import { useQueryParams } from "@hooks/useQueryParams";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const SCOPE_OPTIONS = [
  { value: "COMPANY", label: "Company" },
  { value: "PROJECT", label: "Project" },
  { value: "SITE", label: "Site" },
  { value: "EMPLOYEE", label: "Employee" },
];

const BREAK_MODE_OPTIONS = [
  { value: "FIXED", label: "Fixed Break" },
  { value: "DYNAMIC", label: "Dynamic Break" },
];

const OVERTIME_MODE_OPTIONS = [
  { value: "HOURLY", label: "Hourly" },
  { value: "P_MULTIPLIER", label: "P-Multiplier" },
];

const TVT_ACTION_OPTIONS = [
  { value: "BLOCK", label: "Block Attendance" },
  { value: "FLAG", label: "Flag Attendance" },
];

/* -------------------------------------------------------------------------- */
/* Initial Values                                                             */
/* -------------------------------------------------------------------------- */

const initialValues = {
  name: "",
  description: "",

  scope: "COMPANY",
  projectId: "",
  siteId: "",
  employeeId: "",

  dayStartHour: 8,
  dayStartMinute: 0,
  shiftDurationMins: 480,
  halfDayThresholdMins: 240,
  fullDayThresholdMins: 480,

  breakMode: "FIXED",
  fixedBreakMins: 60,
  minWorkForBreakMins: 240,
  maxDynamicBreakMins: 90,

  overtimeMode: "HOURLY",
  minOvertimeMins: 30,
  otSlabMins: 30,

  pMultiplierSlabs: [
    { minExtraMins: 120, pUnit: 0.5 },
    { minExtraMins: 240, pUnit: 1 },
    { minExtraMins: 480, pUnit: 2 },
  ],

  geofenceStrict: true,
  allowMobilePunch: true,
  allowKioskPunch: true,
  allowBiometric: true,

  requireTvtGate: false,
  tvtGateAction: "FLAG",
};

const getInitialValues = (data = {}) => ({
  ...initialValues,

  name: data.name ?? initialValues.name,
  description: data.description ?? initialValues.description,

  scope: data.scope ?? initialValues.scope,
  projectId: data.projectId ?? initialValues.projectId,
  siteId: data.siteId ?? initialValues.siteId,
  employeeId: data.employeeId ?? initialValues.employeeId,

  dayStartHour: data.dayStartHour ?? initialValues.dayStartHour,
  dayStartMinute: data.dayStartMinute ?? initialValues.dayStartMinute,
  shiftDurationMins: data.shiftDurationMins ?? initialValues.shiftDurationMins,
  halfDayThresholdMins:
    data.halfDayThresholdMins ?? initialValues.halfDayThresholdMins,
  fullDayThresholdMins:
    data.fullDayThresholdMins ?? initialValues.fullDayThresholdMins,

  breakMode: data.breakMode ?? initialValues.breakMode,
  fixedBreakMins: data.fixedBreakMins ?? initialValues.fixedBreakMins,
  minWorkForBreakMins:
    data.minWorkForBreakMins ?? initialValues.minWorkForBreakMins,
  maxDynamicBreakMins:
    data.maxDynamicBreakMins ?? initialValues.maxDynamicBreakMins,

  overtimeMode: data.overtimeMode ?? initialValues.overtimeMode,
  minOvertimeMins: data.minOvertimeMins ?? initialValues.minOvertimeMins,
  otSlabMins: data.otSlabMins ?? initialValues.otSlabMins,

  pMultiplierSlabs:
    data.pMultiplierSlabs?.length > 0
      ? data.pMultiplierSlabs.map((slab) => ({
          minExtraMins: slab.minExtraMins ?? "",
          pUnit: slab.pUnit ?? "",
        }))
      : initialValues.pMultiplierSlabs.map((slab) => ({ ...slab })),

  geofenceStrict: data.geofenceStrict ?? initialValues.geofenceStrict,
  allowMobilePunch: data.allowMobilePunch ?? initialValues.allowMobilePunch,
  allowKioskPunch: data.allowKioskPunch ?? initialValues.allowKioskPunch,
  allowBiometric: data.allowBiometric ?? initialValues.allowBiometric,

  requireTvtGate: data.requireTvtGate ?? initialValues.requireTvtGate,
  tvtGateAction: data.tvtGateAction ?? initialValues.tvtGateAction,
});

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

const validationSchema = Yup.object({
  name: Yup.string().trim().required("Policy name is required"),

  description: Yup.string().max(
    1000,
    "Description cannot exceed 1000 characters",
  ),

  scope: Yup.string()
    .oneOf(["COMPANY", "PROJECT", "SITE", "EMPLOYEE"])
    .required("Scope is required"),

  projectId: Yup.string().when("scope", {
    is: "PROJECT",
    then: (schema) => schema.required("Project is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  siteId: Yup.string().when("scope", {
    is: "SITE",
    then: (schema) => schema.required("Site is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  employeeId: Yup.string().when("scope", {
    is: "EMPLOYEE",
    then: (schema) => schema.required("Employee is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  dayStartHour: Yup.number()
    .typeError("Start hour must be a number")
    .integer("Start hour must be a whole number")
    .min(0, "Hour must be between 0 and 23")
    .max(23, "Hour must be between 0 and 23")
    .required("Start hour is required"),

  dayStartMinute: Yup.number()
    .typeError("Start minute must be a number")
    .integer("Start minute must be a whole number")
    .min(0, "Minute must be between 0 and 59")
    .max(59, "Minute must be between 0 and 59")
    .required("Start minute is required"),

  shiftDurationMins: Yup.number()
    .typeError("Shift duration must be a number")
    .positive("Shift duration must be greater than zero")
    .required("Shift duration is required"),

  halfDayThresholdMins: Yup.number()
    .typeError("Half-day threshold must be a number")
    .positive("Half-day threshold must be greater than zero")
    .required("Half-day threshold is required"),

  fullDayThresholdMins: Yup.number()
    .typeError("Full-day threshold must be a number")
    .positive("Full-day threshold must be greater than zero")
    .required("Full-day threshold is required")
    .moreThan(
      Yup.ref("halfDayThresholdMins"),
      "Full-day threshold must be greater than half-day threshold",
    ),

  breakMode: Yup.string()
    .oneOf(["FIXED", "DYNAMIC"])
    .required("Break mode is required"),

  fixedBreakMins: Yup.number().when("breakMode", {
    is: "FIXED",
    then: (schema) =>
      schema
        .typeError("Break duration must be a number")
        .min(0, "Break duration cannot be negative")
        .required("Fixed break duration is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  minWorkForBreakMins: Yup.number()
    .typeError("Minimum work duration must be a number")
    .min(0, "Minimum work duration cannot be negative")
    .required("Minimum work duration is required"),

  maxDynamicBreakMins: Yup.number().when("breakMode", {
    is: "DYNAMIC",
    then: (schema) =>
      schema
        .typeError("Maximum break duration must be a number")
        .positive("Maximum break duration must be greater than zero")
        .required("Maximum break duration is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  overtimeMode: Yup.string()
    .oneOf(["HOURLY", "P_MULTIPLIER"])
    .required("Overtime mode is required"),

  minOvertimeMins: Yup.number()
    .typeError("Minimum overtime must be a number")
    .min(0, "Minimum overtime cannot be negative")
    .required("Minimum overtime duration is required"),

  otSlabMins: Yup.number().when("overtimeMode", {
    is: "HOURLY",
    then: (schema) =>
      schema
        .typeError("Overtime slab must be a number")
        .positive("Overtime slab must be greater than zero")
        .required("Overtime slab is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  pMultiplierSlabs: Yup.array().when("overtimeMode", {
    is: "P_MULTIPLIER",
    then: (schema) =>
      schema
        .of(
          Yup.object({
            minExtraMins: Yup.number()
              .typeError("Extra minutes must be a number")
              .min(0, "Extra minutes cannot be negative")
              .required("Extra minutes are required"),

            pUnit: Yup.number()
              .typeError("P-unit must be a number")
              .min(0, "P-unit cannot be negative")
              .required("P-unit is required"),
          }),
        )
        .min(1, "At least one multiplier slab is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  geofenceStrict: Yup.boolean(),
  allowMobilePunch: Yup.boolean(),
  allowKioskPunch: Yup.boolean(),
  allowBiometric: Yup.boolean(),

  requireTvtGate: Yup.boolean(),

  tvtGateAction: Yup.string().when("requireTvtGate", {
    is: true,
    then: (schema) =>
      schema
        .oneOf(["BLOCK", "FLAG"])
        .required("Verification failure action is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

/* -------------------------------------------------------------------------- */
/* Formik Field Helpers                                                       */
/* -------------------------------------------------------------------------- */

const getFieldError = (formik, name) =>
  getIn(formik.touched, name) ? getIn(formik.errors, name) : "";

const FormikInput = ({ formik, name, ...props }) => (
  <InputField
    {...props}
    {...formik.getFieldProps(name)}
    name={name}
    error={getFieldError(formik, name)}
  />
);

const FormikSelect = ({ formik, name, ...props }) => (
  <SelectField
    {...props}
    {...formik.getFieldProps(name)}
    name={name}
    error={getFieldError(formik, name)}
  />
);

const FormikTextarea = ({ formik, name, ...props }) => (
  <TextareaField
    {...props}
    {...formik.getFieldProps(name)}
    name={name}
    error={getFieldError(formik, name)}
  />
);

/* -------------------------------------------------------------------------- */
/* Payload Builder                                                            */
/* -------------------------------------------------------------------------- */

const buildPayload = (values) => {
  const payload = {
    name: values.name.trim(),
    description: values.description.trim(),
    scope: values.scope,

    dayStartHour: Number(values.dayStartHour),
    dayStartMinute: Number(values.dayStartMinute),
    shiftDurationMins: Number(values.shiftDurationMins),
    halfDayThresholdMins: Number(values.halfDayThresholdMins),
    fullDayThresholdMins: Number(values.fullDayThresholdMins),

    breakMode: values.breakMode,
    minWorkForBreakMins: Number(values.minWorkForBreakMins),

    overtimeMode: values.overtimeMode,
    minOvertimeMins: Number(values.minOvertimeMins),

    geofenceStrict: values.geofenceStrict,
    allowMobilePunch: values.allowMobilePunch,
    allowKioskPunch: values.allowKioskPunch,
    allowBiometric: values.allowBiometric,

    requireTvtGate: values.requireTvtGate,
    tvtGateAction: values.tvtGateAction,
  };

  if (values.scope === "PROJECT") {
    payload.projectId = values.projectId;
  }

  if (values.scope === "SITE") {
    payload.siteId = values.siteId;
  }

  if (values.scope === "EMPLOYEE") {
    payload.employeeId = values.employeeId;
  }

  if (values.breakMode === "FIXED") {
    payload.fixedBreakMins = Number(values.fixedBreakMins);
  }

  if (values.breakMode === "DYNAMIC") {
    payload.maxDynamicBreakMins = Number(values.maxDynamicBreakMins);
  }

  if (values.overtimeMode === "HOURLY") {
    payload.otSlabMins = Number(values.otSlabMins);
  }

  if (values.overtimeMode === "P_MULTIPLIER") {
    payload.pMultiplierSlabs = values.pMultiplierSlabs.map((slab) => ({
      minExtraMins: Number(slab.minExtraMins),
      pUnit: Number(slab.pUnit),
    }));
  }

  return payload;
};

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

const CreateAttendancePolicyPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { get } = useQueryParams();
  const policyId = get("policyId");
  const isEditMode = Boolean(policyId);

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const {
    isCreatingPolicy,
    isFetchingPolicy,
    attendancePolicy,
    isUpdatingPolicy,
  } = useSelector((state) => state.attendance);

  const isSubmitting = isCreatingPolicy || isUpdatingPolicy;

  useEffect(() => {
    if (policyId) dispatch(getAttendancePolicy(policyId));
  }, [dispatch, policyId]);

  const handleCloseConfirmation = () => {
    if (isSubmitting) return;
    setIsConfirmationOpen(false);
  };

  const handleConfirm = async (formik) => {
    try {
      const payload = buildPayload(formik.values);

      const action = isEditMode
        ? updateAttendancePolicy({
            id: policyId,
            values: payload,
          })
        : createAttendancePolicy(payload);

      await handleResponse(dispatch(action), () => {
        setIsConfirmationOpen(false);
        navigate(ROUTES.ATTENDANCE.POLICIES);
      });
    } catch (error) {
      // Error notification is handled by the Redux slice.
    }
  };

  if (isEditMode && isFetchingPolicy) {
    return (
      <main className="min-h-screen space-y-6">
        <PageHeaderBanner
          title="Edit Attendance Policy"
          description="Update working hours, breaks, overtime and attendance rules."
        />

        <div className="rounded-xl border border-border bg-card px-5 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Loading attendance policy...
          </p>
        </div>
      </main>
    );
  }

  if (isEditMode && !attendancePolicy) {
    return (
      <main className="min-h-screen space-y-6">
        <PageHeaderBanner
          title="Edit Attendance Policy"
          description="Update working hours, breaks, overtime and attendance rules."
        />

        <div className="rounded-xl border border-border bg-card px-5 py-12 text-center">
          <p className="text-sm font-medium text-foreground">
            Attendance policy not found.
          </p>

          <button
            type="button"
            onClick={() => navigate(ROUTES.ATTENDANCE.POLICIES)}
            className="btn btn-outline mt-4"
          >
            <IconArrowLeft size={17} />
            Back to Policies
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen space-y-6">
      <PageHeaderBanner
        title={
          isEditMode ? "Edit Attendance Policy" : "Create Attendance Policy"
        }
        description={
          isEditMode
            ? "Update working hours, breaks, overtime and attendance rules."
            : "Configure working hours, breaks, overtime and attendance rules."
        }
      />

      <Formik
        // initialValues={initialValues}
        initialValues={getInitialValues(
          isEditMode ? attendancePolicy : undefined,
        )}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={() => {
          setIsConfirmationOpen(true);
        }}
      >
        {(formik) => (
          <>
            <form onSubmit={formik.handleSubmit} noValidate>
              <div className="space-y-5">
                {/* Basic Information */}
                <FormSection
                  title="Basic Information"
                  description="Define the policy name, description and where it applies."
                  icon={IconSettings}
                  defaultOpen
                >
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FormikInput
                      formik={formik}
                      name="name"
                      label="Policy Name"
                      placeholder="e.g. Head Office Default"
                      required
                    />

                    <FormikSelect
                      formik={formik}
                      name="scope"
                      label="Policy Scope"
                      options={SCOPE_OPTIONS}
                      required
                    />

                    {formik.values.scope === "PROJECT" && (
                      <FormikInput
                        formik={formik}
                        name="projectId"
                        label="Project ID"
                        placeholder="Enter project ID"
                        required
                      />
                    )}

                    {formik.values.scope === "SITE" && (
                      <FormikInput
                        formik={formik}
                        name="siteId"
                        label="Site ID"
                        placeholder="Enter site ID"
                        required
                      />
                    )}

                    {formik.values.scope === "EMPLOYEE" && (
                      <FormikInput
                        formik={formik}
                        name="employeeId"
                        label="Employee ID"
                        placeholder="Enter employee ID"
                        required
                      />
                    )}

                    <div className="md:col-span-2">
                      <FormikTextarea
                        formik={formik}
                        name="description"
                        label="Description"
                        placeholder="Describe the purpose of this attendance policy..."
                        rows={3}
                        maxLength={1000}
                      />
                    </div>
                  </div>
                </FormSection>

                {/* Working Hours */}
                <FormSection
                  title="Working Hours"
                  description="Set the business-day start time, shift duration and attendance thresholds."
                  icon={IconClock}
                  defaultOpen
                >
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <FormikInput
                      formik={formik}
                      name="dayStartHour"
                      label="Day Start Hour"
                      type="number"
                      min="0"
                      max="23"
                      required
                      helperText="Use 24-hour format (0–23)."
                    />

                    <FormikInput
                      formik={formik}
                      name="dayStartMinute"
                      label="Day Start Minute"
                      type="number"
                      min="0"
                      max="59"
                      required
                    />

                    <FormikInput
                      formik={formik}
                      name="shiftDurationMins"
                      label="Shift Duration (Minutes)"
                      type="number"
                      min="1"
                      required
                    />

                    <FormikInput
                      formik={formik}
                      name="halfDayThresholdMins"
                      label="Half-day Threshold (Minutes)"
                      type="number"
                      min="1"
                      required
                    />

                    <FormikInput
                      formik={formik}
                      name="fullDayThresholdMins"
                      label="Full-day Threshold (Minutes)"
                      type="number"
                      min="1"
                      required
                    />
                  </div>
                </FormSection>

                {/* Break Settings */}
                <FormSection
                  title="Break Settings"
                  description="Configure break deduction rules and permitted break durations."
                  icon={IconCoffee}
                  defaultOpen
                >
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FormikSelect
                      formik={formik}
                      name="breakMode"
                      label="Break Mode"
                      options={BREAK_MODE_OPTIONS}
                      required
                    />

                    {formik.values.breakMode === "FIXED" && (
                      <FormikInput
                        formik={formik}
                        name="fixedBreakMins"
                        label="Fixed Break Duration (Minutes)"
                        type="number"
                        min="0"
                        required
                      />
                    )}

                    <FormikInput
                      formik={formik}
                      name="minWorkForBreakMins"
                      label="Minimum Work Before Break (Minutes)"
                      type="number"
                      min="0"
                      required
                    />

                    {formik.values.breakMode === "DYNAMIC" && (
                      <FormikInput
                        formik={formik}
                        name="maxDynamicBreakMins"
                        label="Maximum Dynamic Break (Minutes)"
                        type="number"
                        min="1"
                        required
                      />
                    )}
                  </div>
                </FormSection>

                {/* Overtime Settings */}
                <FormSection
                  title="Overtime Settings"
                  description="Configure overtime eligibility and calculation rules."
                  icon={IconWallet}
                  defaultOpen
                >
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FormikSelect
                      formik={formik}
                      name="overtimeMode"
                      label="Overtime Mode"
                      options={OVERTIME_MODE_OPTIONS}
                      required
                    />

                    <FormikInput
                      formik={formik}
                      name="minOvertimeMins"
                      label="Minimum Overtime (Minutes)"
                      type="number"
                      min="0"
                      required
                    />

                    {formik.values.overtimeMode === "HOURLY" && (
                      <FormikInput
                        formik={formik}
                        name="otSlabMins"
                        label="Overtime Slab (Minutes)"
                        type="number"
                        min="1"
                        required
                      />
                    )}
                  </div>

                  {formik.values.overtimeMode === "P_MULTIPLIER" && (
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">
                            P-Multiplier Slabs
                          </h4>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Define the P-unit applied at different overtime
                            thresholds.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            formik.setFieldValue("pMultiplierSlabs", [
                              ...formik.values.pMultiplierSlabs,
                              { minExtraMins: "", pUnit: "" },
                            ])
                          }
                          className="btn btn-outline"
                        >
                          <IconPlus size={16} stroke={1.8} />
                          Add Slab
                        </button>
                      </div>

                      <FieldArray name="pMultiplierSlabs">
                        {({ remove }) => (
                          <div className="space-y-3">
                            {formik.values.pMultiplierSlabs.map(
                              (slab, index) => (
                                <div
                                  key={index}
                                  className="grid grid-cols-1 items-start gap-4 rounded-xl border border-border p-4 md:grid-cols-[1fr_1fr_auto]"
                                >
                                  <FormikInput
                                    formik={formik}
                                    name={`pMultiplierSlabs.${index}.minExtraMins`}
                                    label="Minimum Extra Minutes"
                                    type="number"
                                    min="0"
                                    required
                                  />

                                  <FormikInput
                                    formik={formik}
                                    name={`pMultiplierSlabs.${index}.pUnit`}
                                    label="P-Unit"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    placeholder="e.g. 0.5"
                                    required
                                  />

                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    disabled={
                                      formik.values.pMultiplierSlabs.length ===
                                      1
                                    }
                                    className="mt-7 rounded-lg p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-950/30"
                                    aria-label="Remove multiplier slab"
                                  >
                                    <IconTrash size={17} stroke={1.8} />
                                  </button>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </FieldArray>
                    </div>
                  )}
                </FormSection>

                {/* Punch Settings */}
                <FormSection
                  title="Punch Settings"
                  description="Configure permitted attendance methods and location-based punch restrictions."
                  icon={IconMapPin}
                  defaultOpen
                >
                  <div className="flex flex-col">
                    {[
                      {
                        name: "geofenceStrict",
                        label: "Strict Geofence",
                        description:
                          "Prevent punch-in outside the site's permitted geofence.",
                      },
                      {
                        name: "allowMobilePunch",
                        label: "Mobile Punch",
                        description:
                          "Allow employees to record attendance using the mobile app.",
                      },
                      {
                        name: "allowKioskPunch",
                        label: "Kiosk Punch",
                        description:
                          "Allow employees to record attendance through a site kiosk.",
                      },
                      {
                        name: "allowBiometric",
                        label: "Biometric Punch",
                        description:
                          "Allow attendance recording through biometric devices.",
                      },
                    ].map((item, index, items) => (
                      <label
                        key={item.name}
                        className={`flex cursor-pointer items-center gap-3 py-3 ${
                          index !== items.length - 1
                            ? "border-b border-border"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          name={item.name}
                          checked={Boolean(formik.values[item.name])}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="form-checkbox shrink-0"
                        />

                        <span className="min-w-0 text-sm">
                          <span className="font-medium text-foreground">
                            {item.label}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            - {item.description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </FormSection>

                {/* TVT Verification */}
                <FormSection
                  title="TVT Verification"
                  description="Configure TVT verification requirements for employee attendance."
                  icon={IconShieldCheck}
                  defaultOpen
                >
                  <div className="space-y-4">
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                      <input
                        type="checkbox"
                        name="requireTvtGate"
                        checked={Boolean(formik.values.requireTvtGate)}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="form-checkbox mt-0.5 h-4 w-4 shrink-0 cursor-pointer"
                      />

                      <span className="text-sm font-medium leading-5 text-foreground">
                        Require employees to complete TVT verification before
                        their attendance is recorded.
                      </span>
                    </label>

                    {formik.values.requireTvtGate && (
                      <div className="max-w-sm">
                        <FormikSelect
                          formik={formik}
                          name="tvtGateAction"
                          label="When Verification Fails"
                          options={TVT_ACTION_OPTIONS}
                          required
                        />
                      </div>
                    )}
                  </div>
                </FormSection>

                {/* Form Actions */}
                <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.ATTENDANCE.POLICIES)}
                    className="btn btn-outline"
                    disabled={isSubmitting}
                  >
                    <IconArrowLeft size={17} stroke={1.8} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    <IconDeviceFloppy size={17} stroke={1.8} />
                    {isEditMode ? "Update Policy" : "Create Policy"}
                  </button>
                </div>
              </div>
            </form>

            <ModalAction
              id="attendance-policy-confirmation"
              isOpen={isConfirmationOpen}
              onClose={handleCloseConfirmation}
              onSubmit={() => handleConfirm(formik)}
              title={
                isEditMode
                  ? "Update Attendance Policy?"
                  : "Create Attendance Policy?"
              }
              desc={
                isEditMode
                  ? `Are you sure you want to update the "${formik.values.name.trim() || "Untitled Policy"}" attendance policy? The updated rules will be saved.`
                  : `Are you sure you want to create the "${formik.values.name.trim() || "Untitled Policy"}" attendance policy? Please review the configured attendance rules before proceeding.`
              }
              icon={IconClock}
              theme="primary"
              submitText={isEditMode ? "Confirm & Update" : "Confirm & Create"}
              loadingText={isEditMode ? "Updating..." : "Creating..."}
              cancelText="Go Back"
              loading={isSubmitting}
              closeOnBackdrop={!isSubmitting}
              closeOnEscape={!isSubmitting}
              showCancel
            />
          </>
        )}
      </Formik>
    </div>
  );
};

export default CreateAttendancePolicyPage;
