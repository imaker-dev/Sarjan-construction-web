import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import ModalBasic from "@components/ui/ModalBasic";
import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import { allocateLeave } from "@store/slices/leave.slice";
import { listEmployees } from "@store/slices/employee.slice";
import { extractList } from "@utils/api.utils";
import { LEAVE_TYPE_OPTIONS } from "./ApplyLeaveModal";

const ALLOCATABLE_TYPES = LEAVE_TYPE_OPTIONS.filter((o) => o.value !== "LOSS_OF_PAY");

export default function LeaveAllocationsModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { isMutatingLeave } = useSelector((state) => state.leave);
  const { employeesData } = useSelector((state) => state.employee);

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
    initialValues: {
      employeeId: "",
      leaveType: "CASUAL",
      year: new Date().getFullYear(),
      allocatedDays: 12,
      carriedOverDays: 0,
    },
    validationSchema: Yup.object({
      employeeId: Yup.string().required("Employee is required"),
      leaveType: Yup.string().required("Leave type is required"),
      year: Yup.number().min(2000).max(2100).required("Year is required"),
      allocatedDays: Yup.number().min(0).max(365).required("Allocated days required"),
      carriedOverDays: Yup.number().min(0).max(90).nullable(),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await dispatch(
          allocateLeave({
            employeeId: values.employeeId,
            leaveType: values.leaveType,
            year: Number(values.year),
            allocatedDays: Number(values.allocatedDays),
            carriedOverDays: Number(values.carriedOverDays || 0),
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
      title="Allocate Leave Balance"
      description="Upsert annual leave allocation and carry-over days for an employee."
      size="md"
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4 p-6">
        <SelectField
          id="allocEmployeeId"
          name="employeeId"
          label="Employee"
          required
          placeholder="Select employee"
          options={employeeOptions}
          value={formik.values.employeeId}
          onChange={formik.handleChange}
          error={formik.touched.employeeId && formik.errors.employeeId}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectField
            id="allocLeaveType"
            name="leaveType"
            label="Leave Type"
            required
            options={ALLOCATABLE_TYPES}
            value={formik.values.leaveType}
            onChange={formik.handleChange}
          />
          <InputField
            id="allocYear"
            name="year"
            type="number"
            label="Year"
            required
            value={formik.values.year}
            onChange={formik.handleChange}
            error={formik.touched.year && formik.errors.year}
          />
          <InputField
            id="allocatedDays"
            name="allocatedDays"
            type="number"
            label="Allocated Days"
            required
            value={formik.values.allocatedDays}
            onChange={formik.handleChange}
            error={formik.touched.allocatedDays && formik.errors.allocatedDays}
          />
          <InputField
            id="carriedOverDays"
            name="carriedOverDays"
            type="number"
            label="Carried Over Days"
            value={formik.values.carriedOverDays}
            onChange={formik.handleChange}
            error={formik.touched.carriedOverDays && formik.errors.carriedOverDays}
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={isMutatingLeave}>
            {isMutatingLeave ? "Saving..." : "Save Allocation"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}
