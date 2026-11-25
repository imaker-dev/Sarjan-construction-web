import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import ModalBasic from "@components/ui/ModalBasic";
import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import { TextareaField } from "@components/fields/TextareaField";
import { createManualSession } from "@store/slices/attendance.slice";
import { listEmployees } from "@store/slices/employee.slice";
import { extractList } from "@store/slices/schedule.slice";

/**
 * Formik + Yup modal for POST /attendance/sessions (manual missed-session correction).
 * Never sends `source` — server sets `MANUAL_CORRECTION`.
 */
export default function CreateManualSessionModal({
  isOpen,
  onClose,
  siteId,
  headOfficeId,
  businessDate,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const { isCreatingManualSession } = useSelector((state) => state.attendance);
  const { employeesData } = useSelector((state) => state.employee);
  const defaultDate = businessDate || new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (isOpen && !employeesData) {
      dispatch(listEmployees());
    }
  }, [isOpen, employeesData, dispatch]);

  const employeeOptions = useMemo(
    () =>
      extractList(employeesData, "employees").map((e) => ({
        label: e.employeeCode ? `${e.displayName} (${e.employeeCode})` : e.displayName,
        value: e.id,
      })),
    [employeesData]
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      employeeId: "",
      punchInTime: "08:30",
      punchOutTime: "17:30",
      remarks: "",
    },
    validationSchema: Yup.object({
      employeeId: Yup.string().trim().required("Employee is required"),
      punchInTime: Yup.string().required("Punch-in time is required"),
      punchOutTime: Yup.string().test(
        "after-in",
        "Punch-out time must be after punch-in time",
        function (val) {
          if (!val || !this.parent.punchInTime) return true;
          return val > this.parent.punchInTime;
        }
      ),
      remarks: Yup.string()
        .trim()
        .min(3, "Remarks must be at least 3 characters")
        .required("Remarks are required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const punchInAt = new Date(`${defaultDate}T${values.punchInTime}:00`).toISOString();
      const punchOutAt = values.punchOutTime
        ? new Date(`${defaultDate}T${values.punchOutTime}:00`).toISOString()
        : undefined;

      const payload = {
        employeeId: values.employeeId.trim(),
        ...(siteId ? { siteId } : {}),
        ...(headOfficeId ? { headOfficeId } : {}),
        punchInAt,
        ...(punchOutAt ? { punchOutAt } : {}),
        remarks: values.remarks.trim(),
      };

      try {
        await dispatch(createManualSession(payload)).unwrap();
        resetForm();
        onClose();
        onSuccess?.();
      } catch {
        // toast handled in slice
      }
    },
  });

  return (
    <ModalBasic
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Missed Session (${defaultDate})`}
      description="Create a manual attendance session (server-labeled MANUAL_CORRECTION) for a missed day or kiosk outage."
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4 p-6">
        <SelectField
          id="employeeId"
          name="employeeId"
          label="Employee"
          required
          placeholder="Select employee..."
          options={employeeOptions}
          value={formik.values.employeeId}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.employeeId && formik.errors.employeeId}
        />

        <div className="grid grid-cols-2 gap-3">
          <InputField
            id="punchInTime"
            name="punchInTime"
            type="time"
            label="Punch In Time"
            required
            value={formik.values.punchInTime}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.punchInTime && formik.errors.punchInTime}
          />
          <InputField
            id="punchOutTime"
            name="punchOutTime"
            type="time"
            label="Punch Out Time (Optional)"
            value={formik.values.punchOutTime}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.punchOutTime && formik.errors.punchOutTime}
          />
        </div>

        <TextareaField
          id="remarks"
          name="remarks"
          label="Audit Remarks"
          required
          placeholder="e.g. Kiosk outage; gate register verified"
          value={formik.values.remarks}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.remarks && formik.errors.remarks}
        />

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
            disabled={isCreatingManualSession}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isCreatingManualSession}
          >
            {isCreatingManualSession ? "Recording..." : "Record Session"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}
