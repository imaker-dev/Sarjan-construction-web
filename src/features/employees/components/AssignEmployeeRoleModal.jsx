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
  projects = [],
  loading = false,
  headOfficesLoading = false,
  projectsLoading = false,
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
      roles
        .map((role) => ({
          label: role.name || role.label || role.roleKey || "Unnamed Role",
          value: role.roleKey || role.value,
        }))
        .filter((option) => option.value),
    [roles],
  );

  const headOfficeOptions = useMemo(
    () =>
      (Array.isArray(headOffices) ? headOffices : [])
        .filter((office) => office.status === "ACTIVE")
        .map((office) => ({
          label:
            office.name || office.code || `Head Office #${office.id || "N/A"}`,
          value: office.id ?? office.code,
        }))
        .filter((option) => option.value != null),
    [headOffices],
  );

  const projectOptions = useMemo(
    () =>
      (Array.isArray(projects) ? projects : [])
        .filter((project) => project.status === "ACTIVE")
        .map((project) => ({
          label:
            project.name ||
            project.projectName ||
            project.code ||
            `Project #${project.id || "N/A"}`,
          value: project.id ?? project.projectId ?? project.code,
        }))
        .filter((option) => option.value != null),
    [projects],
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

    if (scopeType !== "COMPANY" && !scopeId) {
      nextErrors.scopeId =
        scopeType === "HEAD_OFFICE"
          ? "Please select a head office"
          : "Please select a project";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSubmit?.({
      roleKey,
      scopeType,
      scopeId: scopeType === "COMPANY" ? null : scopeId,
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
              { label: "Project", value: "PROJECT" },
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
              placeholder={
                headOfficesLoading
                  ? "Loading head offices"
                  : "Select head office"
              }
              options={headOfficeOptions}
              value={scopeId}
              onChange={(e) => {
                setScopeId(e.target.value);
                setErrors((prev) => ({ ...prev, scopeId: "" }));
              }}
              loading={headOfficesLoading}
              disabled={headOfficesLoading}
              error={errors.scopeId}
            />
          )}

          {scopeType === "PROJECT" && (
            <SelectField
              label="Project"
              name="scopeId"
              id="scopeId"
              required
              placeholder={
                projectsLoading ? "Loading projects..." : "Select project"
              }
              options={projectOptions}
              value={scopeId}
              onChange={(e) => {
                setScopeId(e.target.value);
                setErrors((prev) => ({ ...prev, scopeId: "" }));
              }}
              loading={projectsLoading}
              disabled={projectsLoading}
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
                : scopeType === "HEAD_OFFICE"
                  ? "This role will apply only to the selected head office."
                  : "This role will apply only to the selected project."
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
