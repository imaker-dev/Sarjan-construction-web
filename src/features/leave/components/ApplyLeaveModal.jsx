import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import ModalBasic from "@components/ui/ModalBasic";
import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import { TextareaField } from "@components/fields/TextareaField";
import { applyLeave } from "@store/slices/leave.slice";
import { getTodayIsoDate } from "@utils/date.utils";

const LEAVE_TYPE_OPTIONS = [
  { label: "Casual Leave", value: "CASUAL" },
  { label: "Sick Leave", value: "SICK" },
  { label: "Earned Leave", value: "EARNED" },
  { label: "Unpaid Leave", value: "UNPAID" },
];

export default function ApplyLeaveModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { isMutatingLeave } = useSelector((state) => state.leave);
  const today = getTodayIsoDate();

  const formik = useFormik({
    initialValues: {
      leaveType: "CASUAL",
      fromDate: today,
      toDate: today,
      reason: "",
    },
    validationSchema: Yup.object({
      leaveType: Yup.string().required("Leave type is required"),
      fromDate: Yup.string().required("From date is required"),
      toDate: Yup.string()
        .required("To date is required")
        .test("after-from", "To date must be on or after From date", function (val) {
          if (!val || !this.parent.fromDate) return true;
          return val >= this.parent.fromDate;
        }),
      reason: Yup.string().trim().min(3, "Reason is required").required("Reason is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await dispatch(
          applyLeave({
            leaveType: values.leaveType,
            fromDate: values.fromDate,
            toDate: values.toDate,
            reason: values.reason.trim(),
          })
        ).unwrap();
        resetForm();
        onClose();
        onSuccess?.();
      } catch {
        // handled in slice
      }
    },
  });

  return (
    <ModalBasic
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Leave"
      description="Submit a leave request for manager review."
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4 p-6">
        <SelectField
          id="leaveType"
          name="leaveType"
          label="Leave Type"
          required
          options={LEAVE_TYPE_OPTIONS}
          value={formik.values.leaveType}
          onChange={formik.handleChange}
          error={formik.touched.leaveType && formik.errors.leaveType}
        />

        <div className="grid grid-cols-2 gap-3">
          <InputField
            id="fromDate"
            name="fromDate"
            type="date"
            label="From Date"
            required
            value={formik.values.fromDate}
            onChange={formik.handleChange}
            error={formik.touched.fromDate && formik.errors.fromDate}
          />
          <InputField
            id="toDate"
            name="toDate"
            type="date"
            label="To Date"
            required
            value={formik.values.toDate}
            onChange={formik.handleChange}
            error={formik.touched.toDate && formik.errors.toDate}
          />
        </div>

        <TextareaField
          id="reason"
          name="reason"
          label="Reason"
          required
          placeholder="e.g. Family function"
          value={formik.values.reason}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.reason && formik.errors.reason}
        />

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={isMutatingLeave}>
            {isMutatingLeave ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}
