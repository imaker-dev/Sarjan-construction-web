import React, { useEffect, useState } from "react";
import ModalBasic from "@components/ui/ModalBasic";
import { SelectField } from "@components/fields/SelectField";
import Alert from "@components/ui/Alert";
import { Loader2 } from "lucide-react";

const AddEmployeeMembershipModal = ({
  isOpen,
  onClose,
  departments = [],
  loading = false,
  onSubmit,
}) => {
  const [departmentId, setDepartmentId] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDepartmentId("");
      setIsPrimary(false);
      setError("");
    }
  }, [isOpen]);

  const departmentOptions = (departments || [])
    .filter((department) => department.status === "ACTIVE")
    .map((department) => ({
      label: department.name || "Unnamed Department",
      value: department.id,
    }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!departmentId) {
      setError("Please select a department");
      return;
    }

    onSubmit?.({
      departmentId,
      isPrimary,
    });
  };

  return (
    <ModalBasic
      isOpen={isOpen}
      onClose={onClose}
      title="Add Department Membership"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-5 p-5">
          <SelectField
            label="Department"
            name="departmentId"
            id="departmentId"
            required
            placeholder="Select department"
            options={departmentOptions}
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setError("");
            }}
            error={error}
          />

          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="form-checkbox"
            />

            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Set as primary department
            </span>
          </label>

          <Alert
            type="info"
            variant="flat"
            size="sm"
            description="Department membership defines the employee's department assignment. It does not grant any additional roles or permissions."
          />
        </div>

        <div className="flex justify-end gap-3 border-t p-5 border-gray-200 pt-4 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-outline"
          >
            Cancel
          </button>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Adding..." : "Add Membership"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
};

export default AddEmployeeMembershipModal;
