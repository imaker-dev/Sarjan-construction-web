import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import ModalBasic from "@components/ui/ModalBasic";
import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import { onboardDepartmentEmployee } from "@store/slices/department.slice";
import { getTodayIsoDate } from "@utils/date.utils";

const ENGAGEMENT_OPTIONS = [
  { label: "Direct Employee", value: "DIRECT_EMPLOYEE" },
  { label: "Contractor Worker", value: "CONTRACTOR_WORKER" },
  { label: "Daily Wage", value: "DAILY_WAGE" },
  { label: "Apprentice", value: "APPRENTICE" },
  { label: "Consultant", value: "CONSULTANT" },
  { label: "Other", value: "OTHER" },
];

export default function OnboardWorkerModal({
  isOpen,
  onClose,
  departmentId,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const { isMutatingMembers: isMutating } = useSelector((state) => state.department);

  const formik = useFormik({
    initialValues: {
      employeeCode: "",
      displayName: "",
      engagementType: "DAILY_WAGE",
      designation: "",
      tradeCategory: "",
      joiningDate: getTodayIsoDate(),
      contactPhone: "",
      contactEmail: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
    },
    validationSchema: Yup.object({
      employeeCode: Yup.string().trim().max(40, "Max 40 characters").required("Employee code is required"),
      displayName: Yup.string().trim().max(200, "Max 200 characters").required("Full name is required"),
      engagementType: Yup.string().required("Engagement type is required"),
      contactEmail: Yup.string().trim().email("Invalid email format").nullable(),
      emergencyContactName: Yup.string().test(
        "pair-name",
        "Emergency contact name is required when phone is provided",
        function (val) {
          if (this.parent.emergencyContactPhone?.trim() && !val?.trim()) return false;
          return true;
        }
      ),
      emergencyContactPhone: Yup.string().test(
        "pair-phone",
        "Emergency contact phone is required when name is provided",
        function (val) {
          if (this.parent.emergencyContactName?.trim() && !val?.trim()) return false;
          return true;
        }
      ),
    }),
    onSubmit: async (values, { resetForm }) => {
      const payload = {
        employeeCode: values.employeeCode.trim(),
        displayName: values.displayName.trim(),
        engagementType: values.engagementType,
        ...(values.designation.trim() ? { designation: values.designation.trim() } : {}),
        ...(values.tradeCategory.trim() ? { tradeCategory: values.tradeCategory.trim() } : {}),
        ...(values.joiningDate ? { joiningDate: values.joiningDate } : {}),
        ...(values.contactPhone.trim() ? { contactPhone: values.contactPhone.trim() } : {}),
        ...(values.contactEmail.trim() ? { contactEmail: values.contactEmail.trim() } : {}),
        ...(values.emergencyContactName.trim() && values.emergencyContactPhone.trim()
          ? {
              emergencyContactName: values.emergencyContactName.trim(),
              emergencyContactPhone: values.emergencyContactPhone.trim(),
            }
          : {}),
      };

      try {
        await dispatch(
          onboardDepartmentEmployee({
            departmentId,
            values: payload,
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
      title="Onboard Worker to Department"
      description="Create a worker profile and attach an active membership in this department."
      size="lg"
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4 p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InputField
            id="employeeCode"
            name="employeeCode"
            label="Employee Code"
            required
            placeholder="e.g. WRK-104"
            value={formik.values.employeeCode}
            onChange={formik.handleChange}
            error={formik.touched.employeeCode && formik.errors.employeeCode}
          />
          <InputField
            id="displayName"
            name="displayName"
            label="Full Name"
            required
            placeholder="e.g. Suresh Kumar"
            value={formik.values.displayName}
            onChange={formik.handleChange}
            error={formik.touched.displayName && formik.errors.displayName}
          />
          <SelectField
            id="engagementType"
            name="engagementType"
            label="Engagement Type"
            required
            options={ENGAGEMENT_OPTIONS}
            value={formik.values.engagementType}
            onChange={formik.handleChange}
            error={formik.touched.engagementType && formik.errors.engagementType}
          />
          <InputField
            id="joiningDate"
            name="joiningDate"
            type="date"
            label="Joining Date"
            value={formik.values.joiningDate}
            onChange={formik.handleChange}
          />
          <InputField
            id="designation"
            name="designation"
            label="Designation"
            placeholder="e.g. Senior Mason"
            value={formik.values.designation}
            onChange={formik.handleChange}
          />
          <InputField
            id="tradeCategory"
            name="tradeCategory"
            label="Trade Category"
            placeholder="e.g. Masonry"
            value={formik.values.tradeCategory}
            onChange={formik.handleChange}
          />
          <InputField
            id="contactPhone"
            name="contactPhone"
            label="Contact Phone"
            placeholder="Optional"
            value={formik.values.contactPhone}
            onChange={formik.handleChange}
          />
          <InputField
            id="contactEmail"
            name="contactEmail"
            type="email"
            label="Contact Email"
            placeholder="Optional"
            value={formik.values.contactEmail}
            onChange={formik.handleChange}
            error={formik.touched.contactEmail && formik.errors.contactEmail}
          />
          <InputField
            id="emergencyContactName"
            name="emergencyContactName"
            label="Emergency Contact Name"
            placeholder="Optional (pair with phone)"
            value={formik.values.emergencyContactName}
            onChange={formik.handleChange}
            error={formik.touched.emergencyContactName && formik.errors.emergencyContactName}
          />
          <InputField
            id="emergencyContactPhone"
            name="emergencyContactPhone"
            label="Emergency Contact Phone"
            placeholder="Optional (pair with name)"
            value={formik.values.emergencyContactPhone}
            onChange={formik.handleChange}
            error={formik.touched.emergencyContactPhone && formik.errors.emergencyContactPhone}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={isMutating}>
            {isMutating ? "Onboarding..." : "Onboard Worker"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}
