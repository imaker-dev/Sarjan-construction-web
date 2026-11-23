import React from "react";
import ModalBasic from "@components/ui/ModalBasic";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateLabourSummary } from "@store/slices/dailyReport.slice";
import { InputField } from "@components/fields/InputField";
import { TextareaField } from "@components/fields/TextareaField";
import { IconAlertTriangle, IconPencil } from "@tabler/icons-react";

const validationSchema = Yup.object({
  headcount: Yup.number()
    .integer("Must be a whole number")
    .min(0, "Headcount cannot be negative")
    .required("Headcount is required"),

  presentUnits: Yup.number()
    .min(0, "Present units cannot be negative")
    .required("Present hazri units is required"),

  overtimeHours: Yup.number()
    .min(0, "Overtime hours cannot be negative")
    .required("Overtime hours is required"),

  reason: Yup.string()
    .trim()
    .min(3, "Audit reason must be at least 3 characters")
    .max(500, "Maximum 500 characters")
    .required("Mandatory justification reason is required for administrative audit log"),
});

export default function EditLabourSummaryModal({
  isOpen,
  onClose,
  reportId,
  labourSummary,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const { isUpdatingLabour } = useSelector((state) => state.dailyReport);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      headcount: labourSummary?.headcount ?? 0,
      presentUnits: labourSummary?.presentUnits ?? 0,
      overtimeHours: labourSummary?.overtimeHours ?? 0,
      reason: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!reportId || !labourSummary?.id) return;

      const payload = {
        headcount: Number(values.headcount),
        presentUnits: Number(values.presentUnits),
        overtimeHours: Number(values.overtimeHours),
        reason: values.reason.trim(),
      };

      try {
        await dispatch(
          updateLabourSummary({
            reportId,
            summaryId: labourSummary.id,
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

  const { values, errors, touched, handleChange, handleBlur } = formik;

  const getFieldProps = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] && errors[name],
  });

  if (!labourSummary) return null;

  return (
    <ModalBasic
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Labour Muster Entry"
      description={`Trade: ${labourSummary.tradeCategory} • ${
        labourSummary.subcontractorName || labourSummary.category
      }`}
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4 p-6" noValidate>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
          <div className="flex items-center gap-1.5 font-semibold">
            <IconAlertTriangle size={15} />
            HO Admin Override Logging
          </div>
          <p className="mt-1">
            Any modification will automatically recalculate total workforce units and log a permanent entry in the compliance audit trail.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InputField
            label="Headcount"
            type="number"
            min={0}
            required
            {...getFieldProps("headcount")}
          />

          <InputField
            label="Present Units"
            type="number"
            step="0.5"
            min={0}
            required
            {...getFieldProps("presentUnits")}
          />

          <InputField
            label="OT Hours"
            type="number"
            step="0.5"
            min={0}
            required
            {...getFieldProps("overtimeHours")}
          />
        </div>

        <TextareaField
          label="Mandatory Audit Justification"
          placeholder="State the reason (e.g. Adjusted after verifying turnstile biometric log with contractor supervisor)"
          rows={3}
          required
          maxLength={500}
          helperText="Min. 3 characters. Required for internal and statutory audit log."
          {...getFieldProps("reason")}
        />

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            disabled={isUpdatingLabour}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isUpdatingLabour}
          >
            <IconPencil size={16} />
            <span>{isUpdatingLabour ? "Saving..." : "Apply Adjustment"}</span>
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}
