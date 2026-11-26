import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import ModalBasic from "@components/ui/ModalBasic";
import { InputField } from "@components/fields/InputField";
import { TextareaField } from "@components/fields/TextareaField";
import { getScopeHandler } from "./scope.config";

export default function WorkforceLifecycleModal({
  isOpen,
  onClose,
  scopeType,
  scopeId,
  employee,
  action,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const handler = getScopeHandler(scopeType);
  const isMutating = useSelector((state) => state[handler.sliceKey][handler.mutatingKey]);
  const [confirmExit, setConfirmExit] = useState(false);

  const isReinstate = action === "reinstate";
  const isSuspend = action === "suspend";
  const isExit = action === "exit";

  const actionMeta = {
    suspend: {
      title: `Suspend ${employee?.displayName || "Worker"}`,
      desc: "Ends active in-scope memberships as SUSPENDED and blocks punch-in at this scope. Can be reinstated later.",
      btn: "Confirm Suspend",
    },
    reinstate: {
      title: `Reinstate ${employee?.displayName || "Worker"}`,
      desc: "Restores previously SUSPENDED memberships at this scope.",
      btn: "Confirm Reinstate",
    },
    exit: {
      title: `Permanent Exit — ${employee?.displayName || "Worker"}`,
      desc: "Creates a permanent SiteWorkforceExit marker. Future reinstatement or membership at this scope is blocked.",
      btn: "Confirm Permanent Exit",
    },
  }[action || "suspend"];

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      reason: "",
      expectedReturnDate: "",
      note: "",
    },
    validationSchema: Yup.object({
      reason: isReinstate
        ? Yup.string().notRequired()
        : Yup.string().trim().min(3, "Reason is required").required("Reason is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (isExit && !confirmExit) return;

      const payload = isReinstate
        ? { ...(values.note.trim() ? { note: values.note.trim() } : {}) }
        : isSuspend
          ? {
              reason: values.reason.trim(),
              ...(values.expectedReturnDate ? { expectedReturnDate: values.expectedReturnDate } : {}),
            }
          : { reason: values.reason.trim() };

      try {
        await dispatch(
          handler.workforceAction({
            [handler.idKey]: scopeId,
            employeeId: employee.id,
            action,
            values: payload,
          })
        ).unwrap();
        resetForm();
        setConfirmExit(false);
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
      title={actionMeta.title}
      description={actionMeta.desc}
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4 p-6">
        {isReinstate ? (
          <TextareaField
            id="note"
            name="note"
            label="Reinstatement Note (Optional)"
            placeholder="e.g. Cleared to resume"
            value={formik.values.note}
            onChange={formik.handleChange}
          />
        ) : (
          <TextareaField
            id="reason"
            name="reason"
            label="Audit Reason"
            required
            placeholder="Provide reason for workforce status change..."
            value={formik.values.reason}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.reason && formik.errors.reason}
          />
        )}

        {isSuspend && (
          <InputField
            id="expectedReturnDate"
            name="expectedReturnDate"
            type="date"
            label="Expected Return Date (Optional)"
            value={formik.values.expectedReturnDate}
            onChange={formik.handleChange}
          />
        )}

        {isExit && (
          <label className="flex items-start gap-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmExit}
              onChange={(e) => setConfirmExit(e.target.checked)}
              className="mt-0.5"
            />
            <span>I understand this exit is permanent for this scope and cannot be reinstated.</span>
          </label>
        )}

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm" disabled={isMutating}>
            Cancel
          </button>
          <button
            type="submit"
            className={`btn btn-sm ${isExit ? "bg-rose-600 text-white hover:bg-rose-700" : "btn-primary"}`}
            disabled={isMutating || (isExit && !confirmExit)}
          >
            {isMutating ? "Processing..." : actionMeta.btn}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}
