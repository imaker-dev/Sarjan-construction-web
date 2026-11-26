import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IconArrowLeft, IconCalendarTime, IconClock, IconCoffee } from "@tabler/icons-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import FormSection from "@components/ui/FormSection";
import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import { createSchedule } from "@store/slices/schedule.slice";
import { extractList } from "@utils/api.utils";
import { listProjects } from "@store/slices/project.slice";
import { listSites } from "@store/slices/site.slice";
import { listDepartments } from "@store/slices/department.slice";
import { listEmployees } from "@store/slices/employee.slice";
import { fetchProjectTeam } from "@store/slices/project.slice";
import { useAccess } from "@hooks/useAccess";
import { ROUTES } from "@constants/routes";

const toMins = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const SCOPE_OPTIONS = [
  { label: "Company", value: "COMPANY" },
  { label: "Project", value: "PROJECT" },
  { label: "Site", value: "SITE" },
  { label: "Department", value: "DEPARTMENT" },
  { label: "Employee", value: "EMPLOYEE" },
];

const BREAK_MODE_OPTIONS = [
  { label: "Fixed Window (auto-deduct)", value: "FIXED_WINDOW" },
  { label: "Dynamic (self-punched)", value: "DYNAMIC" },
];

const AUTO_CLOSE_OPTIONS = [
  { label: "At Scheduled End", value: "AT_SCHEDULED_END" },
  { label: "After Grace Period", value: "AFTER_GRACE" },
  { label: "Disabled", value: "DISABLED" },
];

export default function CreateSchedulePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, assignments } = useAccess();
  const isCompanyAdmin = Boolean(user?.isCompanyScoped);

  const { isMutatingSchedule } = useSelector((state) => state.schedule);
  const { projectsData, projectTeam: teamItems } = useSelector((state) => state.project);
  const { sitesData } = useSelector((state) => state.site);
  const { departmentsData } = useSelector((state) => state.department);
  const { employeesData } = useSelector((state) => state.employee);

  const formik = useFormik({
    initialValues: {
      scopeType: "COMPANY",
      targetId: "",
      name: "",
      effectiveFrom: new Date().toISOString().split("T")[0],
      scheduledStart: "08:00",
      scheduledEnd: "17:00",
      graceInMins: 10,
      graceOutMins: 10,
      breakWindowMode: "FIXED_WINDOW",
      breakStart: "13:00",
      breakEnd: "14:00",
      breakDurationMins: 60,
      autoClockOutMode: "AT_SCHEDULED_END",
    },
    validationSchema: Yup.object({
      scopeType: Yup.string().required("Scope is required"),
      targetId: Yup.string().when("scopeType", {
        is: (v) => v && v !== "COMPANY",
        then: (s) => s.trim().required("Please select a target"),
      }),
      name: Yup.string().trim().required("Schedule name is required"),
      effectiveFrom: Yup.string().required("Effective date is required"),
    }),
    onSubmit: async (values) => {
      const targetKeyMap = {
        PROJECT: "projectId",
        SITE: "siteId",
        DEPARTMENT: "departmentId",
        EMPLOYEE: "employeeId",
      };
      const targetKey = targetKeyMap[values.scopeType];

      const payload = {
        scopeType: values.scopeType,
        ...(targetKey && values.targetId ? { [targetKey]: values.targetId.trim() } : {}),
        name: values.name.trim(),
        effectiveFrom: values.effectiveFrom,
        revision: {
          effectiveFrom: values.effectiveFrom,
          timezone: "Asia/Kolkata",
          workingWeekdays: [1, 2, 3, 4, 5, 6],
          intraday: {
            scheduledStartMins: toMins(values.scheduledStart),
            scheduledEndMins: toMins(values.scheduledEnd),
            graceInMins: Number(values.graceInMins || 0),
            graceOutMins: Number(values.graceOutMins || 0),
            breakWindowMode: values.breakWindowMode,
            ...(values.breakWindowMode === "FIXED_WINDOW"
              ? {
                breakWindowStartMins: toMins(values.breakStart),
                breakWindowEndMins: toMins(values.breakEnd),
              }
              : {}),
            breakDurationMins: Number(values.breakDurationMins || 0),
            autoClockOutMode: values.autoClockOutMode,
          },
        },
      };

      try {
        await dispatch(createSchedule(payload)).unwrap();
        navigate(ROUTES.SCHEDULES.ROOT);
      } catch {
        // handled in slice
      }
    },
  });

  const activeScope = formik.values.scopeType;
  const firstProjId = assignments.find((a) => a.projectId)?.projectId;

  useEffect(() => {
    if (activeScope === "PROJECT" && !projectsData) {
      dispatch(listProjects());
    } else if (activeScope === "SITE" && !sitesData) {
      dispatch(listSites());
    } else if (activeScope === "DEPARTMENT" && !departmentsData) {
      dispatch(listDepartments());
    } else if (activeScope === "EMPLOYEE") {
      if (isCompanyAdmin && !employeesData) dispatch(listEmployees());
      else if (!isCompanyAdmin && firstProjId && teamItems.length === 0) {
        dispatch(fetchProjectTeam({ projectId: firstProjId }));
      }
    }
  }, [
    activeScope,
    isCompanyAdmin,
    firstProjId,
    projectsData,
    sitesData,
    departmentsData,
    employeesData,
    teamItems.length,
    dispatch,
  ]);

  const targetOptions = useMemo(() => {
    if (activeScope === "PROJECT") {
      return extractList(projectsData).map((p) => ({
        label: p.code ? `${p.name} (${p.code})` : p.name,
        value: p.id,
      }));
    }
    if (activeScope === "SITE") {
      return extractList(sitesData).map((s) => ({
        label: s.code ? `${s.name} (${s.code})` : s.name,
        value: s.id,
      }));
    }
    if (activeScope === "DEPARTMENT") {
      return extractList(departmentsData).map((d) => ({
        label: d.code ? `${d.name} (${d.code})` : d.name,
        value: d.id,
      }));
    }
    if (activeScope === "EMPLOYEE") {
      const list = isCompanyAdmin ? extractList(employeesData, "employees") : teamItems;
      return list.map((e) => ({
        label: e.employeeCode ? `${e.displayName} (${e.employeeCode})` : e.displayName,
        value: e.id,
      }));
    }
    return [];
  }, [
    activeScope,
    isCompanyAdmin,
    projectsData,
    sitesData,
    departmentsData,
    employeesData,
    teamItems,
  ]);

  return (
    <div className="space-y-6 pb-12">
      <button
        type="button"
        onClick={() => navigate(ROUTES.SCHEDULES.ROOT)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft size={16} />
        <span>Back to Work Schedules</span>
      </button>

      <PageHeaderBanner
        title="Create Work Schedule"
        description="Define shift timings, grace periods, break window mode, and auto clock-out rules."
      />

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <FormSection
          title="Scope & Identity"
          description="Choose which organization tier this work schedule applies to and when it takes effect."
          icon={IconCalendarTime}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              id="scopeType"
              name="scopeType"
              label="Scope Type"
              required
              options={SCOPE_OPTIONS}
              value={formik.values.scopeType}
              onChange={(e) => {
                formik.setFieldValue("scopeType", e.target.value);
                formik.setFieldValue("targetId", "");
              }}
            />
            {formik.values.scopeType !== "COMPANY" && (
              <SelectField
                id="targetId"
                name="targetId"
                label={`Select ${formik.values.scopeType}`}
                required
                placeholder={`Choose ${formik.values.scopeType.toLowerCase()}...`}
                options={targetOptions}
                value={formik.values.targetId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.targetId && formik.errors.targetId}
              />
            )}
            <InputField
              id="name"
              name="name"
              label="Schedule Name"
              required
              placeholder="e.g. Site Shift 8-17"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && formik.errors.name}
            />
            <InputField
              id="effectiveFrom"
              name="effectiveFrom"
              type="date"
              label="Effective From"
              required
              value={formik.values.effectiveFrom}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.effectiveFrom && formik.errors.effectiveFrom}
            />
          </div>
        </FormSection>

        <FormSection
          title="Shift Timings & Grace"
          description="Configure scheduled start/end times and allowed clock-in/out grace minutes."
          icon={IconClock}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InputField
              id="scheduledStart"
              name="scheduledStart"
              type="time"
              label="Shift Start"
              value={formik.values.scheduledStart}
              onChange={formik.handleChange}
            />
            <InputField
              id="scheduledEnd"
              name="scheduledEnd"
              type="time"
              label="Shift End"
              value={formik.values.scheduledEnd}
              onChange={formik.handleChange}
            />
            <InputField
              id="graceInMins"
              name="graceInMins"
              type="number"
              label="Grace In (mins)"
              value={formik.values.graceInMins}
              onChange={formik.handleChange}
            />
            <InputField
              id="graceOutMins"
              name="graceOutMins"
              type="number"
              label="Grace Out (mins)"
              value={formik.values.graceOutMins}
              onChange={formik.handleChange}
            />
          </div>
        </FormSection>

        <FormSection
          title="Break Window & Auto Clock-Out"
          description="Align break mode with your company's Attendance Policy (FIXED ↔ FIXED_WINDOW, DYNAMIC ↔ DYNAMIC)."
          icon={IconCoffee}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField
              id="breakWindowMode"
              name="breakWindowMode"
              label="Break Window Mode"
              options={BREAK_MODE_OPTIONS}
              value={formik.values.breakWindowMode}
              onChange={formik.handleChange}
            />
            <InputField
              id="breakDurationMins"
              name="breakDurationMins"
              type="number"
              label="Break Duration (mins)"
              value={formik.values.breakDurationMins}
              onChange={formik.handleChange}
            />
            <SelectField
              id="autoClockOutMode"
              name="autoClockOutMode"
              label="Auto Clock-Out"
              options={AUTO_CLOSE_OPTIONS}
              value={formik.values.autoClockOutMode}
              onChange={formik.handleChange}
            />
            {formik.values.breakWindowMode === "FIXED_WINDOW" && (
              <>
                <InputField
                  id="breakStart"
                  name="breakStart"
                  type="time"
                  label="Break Window Start"
                  value={formik.values.breakStart}
                  onChange={formik.handleChange}
                />
                <InputField
                  id="breakEnd"
                  name="breakEnd"
                  type="time"
                  label="Break Window End"
                  value={formik.values.breakEnd}
                  onChange={formik.handleChange}
                />
              </>
            )}
          </div>
        </FormSection>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(ROUTES.SCHEDULES.ROOT)}
            className="btn btn-outline btn-sm"
            disabled={isMutatingSchedule}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isMutatingSchedule}
          >
            {isMutatingSchedule ? "Creating..." : "Create Schedule"}
          </button>
        </div>
      </form>
    </div>
  );
}
