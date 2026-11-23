import React from "react";
import ModalBasic from "@components/ui/ModalBasic";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateDailyReportHeader } from "@store/slices/dailyReport.slice";
import {
  IconSun,
  IconCloudRain,
  IconClock,
  IconAlertTriangle,
  IconShieldCheck,
  IconCheck,
} from "@tabler/icons-react";

const WEATHER_OPTIONS = [
  { value: "CLEAR", label: "Clear & Sunny" },
  { value: "OVERCAST", label: "Overcast / Cloudy" },
  { value: "LIGHT_RAIN", label: "Light Rain" },
  { value: "HEAVY_RAIN", label: "Heavy Rain (Monsoon)" },
  { value: "STORMY", label: "Stormy / High Winds" },
  { value: "EXTREME_HEAT", label: "Extreme Heat" },
];

const validationSchema = Yup.object({
  weather: Yup.string()
    .oneOf(
      ["CLEAR", "OVERCAST", "LIGHT_RAIN", "HEAVY_RAIN", "STORMY", "EXTREME_HEAT"],
      "Select a valid weather condition"
    )
    .required("Weather condition is required"),

  weatherStoppageHours: Yup.number()
    .min(0, "Stoppage hours cannot be negative")
    .max(24, "Stoppage cannot exceed 24 hours")
    .required("Stoppage hours is required"),

  workProgressNotes: Yup.string().max(2000, "Maximum 2000 characters"),
  siteObstaclesRemarks: Yup.string().max(2000, "Maximum 2000 characters"),
  safetyIncidentReported: Yup.boolean(),
  safetyNotes: Yup.string().when("safetyIncidentReported", {
    is: true,
    then: (schema) =>
      schema
        .trim()
        .min(5, "Please describe the safety incident (at least 5 characters)")
        .required("Incident description is mandatory when safety incident is flagged"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export default function EditDailyReportHeaderModal({
  isOpen,
  onClose,
  report,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const { isUpdatingHeader } = useSelector((state) => state.dailyReport);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      weather: report?.weather || "CLEAR",
      weatherStoppageHours: report?.weatherStoppageHours ?? 0,
      workProgressNotes: report?.workProgressNotes || "",
      siteObstaclesRemarks: report?.siteObstaclesRemarks || "",
      safetyIncidentReported: Boolean(report?.safetyIncidentReported),
      safetyNotes: report?.safetyNotes || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!report?.id) return;
      try {
        const payload = {
          weather: values.weather,
          weatherStoppageHours: Number(values.weatherStoppageHours),
          workProgressNotes: values.workProgressNotes.trim() || undefined,
          siteObstaclesRemarks: values.siteObstaclesRemarks.trim() || undefined,
          safetyIncidentReported: values.safetyIncidentReported,
          safetyNotes: values.safetyIncidentReported
            ? values.safetyNotes.trim()
            : undefined,
        };

        await dispatch(
          updateDailyReportHeader({
            id: report.id,
            values: payload,
          })
        ).unwrap();
        onClose();
        if (onSuccess) onSuccess();
      } catch {
        // toast error handled in slice
      }
    },
  });

  if (!report) return null;

  return (
    <ModalBasic
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Weather & Daily Site Diary"
      description={`Site: ${report.site?.name || report.site?.code || "—"} • Date: ${report.businessDate}`}
      size="lg"
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4 p-6">
        {/* Weather Conditions & Stoppage Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Weather Condition <span className="text-rose-500">*</span>
            </label>
            <select
              name="weather"
              value={formik.values.weather}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="form-select w-full text-xs"
            >
              {WEATHER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {formik.touched.weather && formik.errors.weather && (
              <p className="text-[11px] font-medium text-rose-500">
                {formik.errors.weather}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Rain / Weather Stoppage (Hours)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              name="weatherStoppageHours"
              value={formik.values.weatherStoppageHours}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="form-input w-full text-xs"
              placeholder="0.0"
            />
            {formik.touched.weatherStoppageHours && formik.errors.weatherStoppageHours && (
              <p className="text-[11px] font-medium text-rose-500">
                {formik.errors.weatherStoppageHours}
              </p>
            )}
          </div>
        </div>

        {/* Work Progress Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Work Progress & Site Diary Notes
          </label>
          <textarea
            rows={3}
            name="workProgressNotes"
            value={formik.values.workProgressNotes}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. Tower B 4th floor slab casting completed (140 m3). Rebar reinforcement started for Tower C columns."
            className="form-textarea w-full text-xs"
          />
          {formik.touched.workProgressNotes && formik.errors.workProgressNotes && (
            <p className="text-[11px] font-medium text-rose-500">
              {formik.errors.workProgressNotes}
            </p>
          )}
        </div>

        {/* Site Obstacles & Hindrances */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Site Obstacles & Bottlenecks (Optional)
          </label>
          <textarea
            rows={2}
            name="siteObstaclesRemarks"
            value={formik.values.siteObstaclesRemarks}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. Ready-mix transit mixer delayed by 1.5h due to city traffic diversion. Power trip between 11 AM - 12 PM."
            className="form-textarea w-full text-xs"
          />
          {formik.touched.siteObstaclesRemarks && formik.errors.siteObstaclesRemarks && (
            <p className="text-[11px] font-medium text-rose-500">
              {formik.errors.siteObstaclesRemarks}
            </p>
          )}
        </div>

        {/* Safety Section */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              name="safetyIncidentReported"
              checked={formik.values.safetyIncidentReported}
              onChange={(e) => {
                formik.setFieldValue("safetyIncidentReported", e.target.checked);
                if (!e.target.checked) formik.setFieldValue("safetyNotes", "");
              }}
              className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Safety incident occurred or reported on site today
            </span>
          </label>

          {formik.values.safetyIncidentReported ? (
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Safety Incident Brief & Corrective Action Taken <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                name="safetyNotes"
                value={formik.values.safetyNotes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Describe what occurred, persons involved, first-aid/hospitalization, and site supervisor corrective measure..."
                className={`form-textarea w-full text-xs ${
                  formik.touched.safetyNotes && formik.errors.safetyNotes
                    ? "border-rose-500 focus:border-rose-500"
                    : ""
                }`}
              />
              {formik.touched.safetyNotes && formik.errors.safetyNotes && (
                <p className="text-[11px] font-medium text-rose-500">
                  {formik.errors.safetyNotes}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <IconShieldCheck size={16} />
              <span>Zero accidents/incidents reported. Site safety protocols in full compliance.</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
            disabled={isUpdatingHeader}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
            disabled={isUpdatingHeader || !formik.isValid}
          >
            {isUpdatingHeader ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <IconCheck size={15} />
            )}
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}
