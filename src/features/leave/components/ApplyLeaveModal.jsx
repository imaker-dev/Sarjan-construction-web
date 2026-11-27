import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import ModalBasic from "@components/ui/ModalBasic";
import DragDropUploader from "@components/fields/DragDropUploader";
import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import { TextareaField } from "@components/fields/TextareaField";
import { applyLeave, resubmitLeaveRequest } from "@store/slices/leave.slice";
import { uploadDocument } from "@store/slices/profile.slice";
import { getTodayIsoDate } from "@utils/date.utils";

export const LEAVE_TYPE_OPTIONS = [
  { label: "Casual Leave (CL)", value: "CASUAL" },
  { label: "Sick Leave (SL)", value: "SICK" },
  { label: "Earned / Privilege Leave (EL)", value: "PRIVILEGE" },
  { label: "Comp Off (CO)", value: "COMP_OFF" },
  { label: "Loss of Pay (LOP)", value: "LOSS_OF_PAY" },
  { label: "Special / Maternity Leave", value: "SPECIAL" },
];

const HALF_DAY_PORTIONS = [
  { label: "First Half", value: "FIRST_HALF" },
  { label: "Second Half", value: "SECOND_HALF" },
];

export default function ApplyLeaveModal({
  isOpen,
  onClose,
  onSuccess,
  resubmitTarget = null,
}) {
  const dispatch = useDispatch();
  const { isMutatingLeave } = useSelector((state) => state.leave);
  const { isUploadingDocument } = useSelector((state) => state.profile);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const today = getTodayIsoDate();
  const isResubmit = Boolean(resubmitTarget);
  const isSaving = isMutatingLeave || isUploadingDocument;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      leaveType: resubmitTarget?.leaveType || "CASUAL",
      startDate: resubmitTarget?.startDate?.slice(0, 10) || today,
      endDate: resubmitTarget?.endDate?.slice(0, 10) || today,
      isHalfDay: Boolean(resubmitTarget?.isHalfDay),
      halfDayPortion: resubmitTarget?.halfDayPortion || "FIRST_HALF",
      reason: resubmitTarget?.reason || "",
    },
    validationSchema: Yup.object({
      leaveType: Yup.string().required("Leave type is required"),
      startDate: Yup.string().required("Start date is required"),
      endDate: Yup.string()
        .required("End date is required")
        .test("after-start", "End date must be on or after Start date", function (val) {
          if (!val || !this.parent.startDate) return true;
          return val >= this.parent.startDate;
        }),
      reason: Yup.string().trim().min(3, "Reason must be at least 3 characters").required("Reason is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        let documentId = resubmitTarget?.documentId || undefined;
        if (selectedFiles.length > 0) {
          const formData = new FormData();
          formData.append("file", selectedFiles[0]);
          formData.append("documentType", "OTHER");
          formData.append("title", `Leave supporting doc (${values.leaveType})`);
          const uploaded = await dispatch(uploadDocument(formData)).unwrap();
          const u = uploaded?.data || uploaded;
          documentId = u?.id || u?.documentId || u?.fileId || undefined;
        }

        if (isResubmit) {
          await dispatch(
            resubmitLeaveRequest({
              id: resubmitTarget.id,
              values: {
                startDate: values.startDate,
                endDate: values.isHalfDay ? values.startDate : values.endDate,
                reason: values.reason.trim(),
                ...(documentId ? { documentId } : {}),
                expectedVersion: resubmitTarget.version ?? 0,
              },
            })
          ).unwrap();
        } else {
          await dispatch(
            applyLeave({
              leaveType: values.leaveType,
              startDate: values.startDate,
              endDate: values.isHalfDay ? values.startDate : values.endDate,
              ...(values.isHalfDay
                ? { isHalfDay: true, halfDayPortion: values.halfDayPortion }
                : {}),
              reason: values.reason.trim(),
              ...(documentId ? { documentId } : {}),
            })
          ).unwrap();
        }
        resetForm();
        setSelectedFiles([]);
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
      onClose={() => {
        setSelectedFiles([]);
        onClose();
      }}
      title={isResubmit ? "Resubmit Returned Leave Request" : "Apply for Leave"}
      description={
        isResubmit
          ? "Update dates or reason and resubmit your returned leave request."
          : "Submit a leave request for review."
      }
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4 p-6">
        {!isResubmit && (
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
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InputField
            id="startDate"
            name="startDate"
            type="date"
            label="Start Date"
            required
            value={formik.values.startDate}
            onChange={(e) => {
              formik.handleChange(e);
              if (formik.values.isHalfDay) {
                formik.setFieldValue("endDate", e.target.value);
              }
            }}
            error={formik.touched.startDate && formik.errors.startDate}
          />
          <InputField
            id="endDate"
            name="endDate"
            type="date"
            label="End Date"
            required
            disabled={formik.values.isHalfDay}
            value={formik.values.isHalfDay ? formik.values.startDate : formik.values.endDate}
            onChange={formik.handleChange}
            error={formik.touched.endDate && formik.errors.endDate}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-700/60 p-3">
          <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={formik.values.isHalfDay}
              onChange={(e) => {
                const checked = e.target.checked;
                formik.setFieldValue("isHalfDay", checked);
                if (checked) formik.setFieldValue("endDate", formik.values.startDate);
              }}
            />
            <span>Half-day leave (0.5 day)</span>
          </label>
          {formik.values.isHalfDay && (
            <div className="w-40">
              <SelectField
                id="halfDayPortion"
                name="halfDayPortion"
                options={HALF_DAY_PORTIONS}
                value={formik.values.halfDayPortion}
                onChange={formik.handleChange}
              />
            </div>
          )}
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

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-200">
            Supporting Document (Optional — required when policy exceeds threshold)
          </label>
          <DragDropUploader
            value={selectedFiles}
            onChange={(files) => setSelectedFiles(files)}
            multiple={false}
            accept="application/pdf,image/jpeg,image/png"
            maxFiles={1}
            maxSize={10 * 1024 * 1024}
            size="sm"
            disabled={isSaving}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => {
              setSelectedFiles([]);
              onClose();
            }}
            className="btn btn-outline btn-sm"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
            {isSaving ? "Submitting..." : isResubmit ? "Resubmit Request" : "Submit Request"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}
