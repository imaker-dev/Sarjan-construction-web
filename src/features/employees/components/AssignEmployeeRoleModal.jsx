import React, { useEffect, useMemo, useState } from "react";
import ModalBasic from "@components/ui/ModalBasic";
import { SelectField } from "@components/fields/SelectField";
import Alert from "@components/ui/Alert";
import { Loader2 } from "lucide-react";

const AssignEmployeeRoleModal = ({
  isOpen,
  onClose,
  roles = [],
  headOffices = [],
  loading = false,
  onSubmit,
}) => {
  const [roleKey, setRoleKey] = useState("");
  const [scopeType, setScopeType] = useState("COMPANY");
  const [scopeId, setScopeId] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setRoleKey("");
      setScopeType("COMPANY");
      setScopeId("");
      setErrors({});
    }
  }, [isOpen]);

  const roleOptions = useMemo(
    () =>
      roles.map((role) => ({
        label: role.name || role.label || role.roleKey,
        value: role.roleKey,
      })),
    [roles],
  );

  const headOfficeOptions = useMemo(
    () =>
      headOffices
        .filter((office) => office.status === "ACTIVE")
        .map((office) => ({
          label: office.name || office.code,
          value: office.id,
        })),
    [headOffices],
  );

  const handleScopeChange = (e) => {
    const value = e.target.value;
    setScopeType(value);
    setScopeId("");
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {};

    if (!roleKey) {
      nextErrors.roleKey = "Please select a role";
    }

    if (scopeType === "HEAD_OFFICE" && !scopeId) {
      nextErrors.scopeId = "Please select a head office";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSubmit?.({
      roleKey,
      scopeType,
      scopeId: scopeType === "HEAD_OFFICE" ? scopeId : null,
    });
  };

  return (
    <ModalBasic isOpen={isOpen} onClose={onClose} title="Assign Employee Role">
      <form onSubmit={handleSubmit}>
        <div className="space-y-5 p-5">
          <SelectField
            label="Role"
            name="roleKey"
            id="roleKey"
            required
            placeholder="Select a role"
            options={roleOptions}
            value={roleKey}
            onChange={(e) => {
              setRoleKey(e.target.value);
              setErrors((prev) => ({ ...prev, roleKey: "" }));
            }}
            error={errors.roleKey}
          />

          <SelectField
            label="Scope Type"
            name="scopeType"
            id="scopeType"
            required
            options={[
              { label: "Company", value: "COMPANY" },
              { label: "Head Office", value: "HEAD_OFFICE" },
            ]}
            value={scopeType}
            onChange={handleScopeChange}
          />

          {scopeType === "HEAD_OFFICE" && (
            <SelectField
              label="Head Office"
              name="scopeId"
              id="scopeId"
              required
              placeholder="Select head office"
              options={headOfficeOptions}
              value={scopeId}
              onChange={(e) => {
                setScopeId(e.target.value);
                setErrors((prev) => ({ ...prev, scopeId: "" }));
              }}
              error={errors.scopeId}
            />
          )}

          <Alert
            type="info"
            variant="flat"
            size="sm"
            description={
              scopeType === "COMPANY"
                ? "This role will apply at the company level."
                : "This role will apply only to the selected head office."
            }
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 p-5 pt-4 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-outline"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Assigning..." : "Assign Role"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
};

export default AssignEmployeeRoleModal;
