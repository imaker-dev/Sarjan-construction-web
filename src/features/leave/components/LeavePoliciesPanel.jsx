import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  IconPlus,
  IconVersions,
  IconSettings,
  IconArchive,
  IconSearch,
  IconTrash,
  IconShieldCheck,
} from "@tabler/icons-react";
import DataTable from "@components/ui/DataTable";
import ModalBasic from "@components/ui/ModalBasic";
import StatusBadge, { getStatusTone } from "@components/ui/StatusBadge";
import RefreshButton from "@components/ui/RefreshButton";
import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import {
  listLeaveTypes,
  listLeavePolicies,
  createLeavePolicy,
  updateLeavePolicy,
  archiveLeavePolicy,
  listLeavePolicyVersions,
  addLeavePolicyVersion,
  cancelLeavePolicyVersion,
  getEffectiveLeavePolicy,
  clearEffectiveLeavePolicy,
} from "@store/slices/leave.slice";
import { listDepartments } from "@store/slices/department.slice";
import { listEmployees } from "@store/slices/employee.slice";
import { extractList } from "@utils/api.utils";
import { formatDate, getTodayIsoDate } from "@utils/date.utils";
import { formatText } from "@utils/text.utils";
import { useAccess } from "@hooks/useAccess";

const ACCRUAL_MODES = [
  { label: "None (Admin-allocated)", value: "NONE" },
  { label: "Monthly Credit", value: "MONTHLY_CREDIT" },
  { label: "Worked Days Ratio", value: "WORKED_DAYS_RATIO" },
];

export default function LeavePoliciesPanel() {
  const dispatch = useDispatch();
  const { user } = useAccess();
  const isCompanyAdmin = Boolean(user?.isCompanyScoped);

  const {
    leaveTypes,
    leavePolicies,
    policyVersions,
    effectiveLeavePolicy,
    isLoadingLeavePolicies,
    isLoadingPolicyVersions,
    isLoadingEffectivePolicy,
    isMutatingLeave,
  } = useSelector((state) => state.leave);
  const { departmentsData } = useSelector((state) => state.department);
  const { employeesData } = useSelector((state) => state.employee);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [rulesTarget, setRulesTarget] = useState(null);
  const [versionsTarget, setVersionsTarget] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const loadPolicies = useCallback(() => {
    dispatch(listLeavePolicies());
    dispatch(listLeaveTypes({ status: "ACTIVE" }));
    dispatch(listDepartments());
    if (isCompanyAdmin) dispatch(listEmployees());
  }, [dispatch, isCompanyAdmin]);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  const typeDefOptions = useMemo(
    () => leaveTypes.map((t) => ({ label: `${t.name} (${t.code})`, value: t.id })),
    [leaveTypes]
  );

  const deptOptions = useMemo(
    () =>
      extractList(departmentsData).map((d) => ({
        label: d.code ? `${d.name} (${d.code})` : d.name,
        value: d.id,
      })),
    [departmentsData]
  );

  const employeeOptions = useMemo(
    () =>
      extractList(employeesData, "employees").map((e) => ({
        label: e.employeeCode ? `${e.displayName} (${e.employeeCode})` : e.displayName,
        value: e.id,
      })),
    [employeesData]
  );

  const scopeOptions = useMemo(
    () =>
      isCompanyAdmin
        ? [
            { label: "Company Baseline", value: "COMPANY" },
            { label: "Department", value: "DEPARTMENT" },
            { label: "Employee Override", value: "EMPLOYEE" },
          ]
        : [{ label: "Department (Site / Project)", value: "DEPARTMENT" }],
    [isCompanyAdmin]
  );

  // Create Policy + Initial Version
  const createFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      scopeType: isCompanyAdmin ? "COMPANY" : "DEPARTMENT",
      departmentId: "",
      employeeId: "",
      typeDefId: typeDefOptions[0]?.value || "",
      name: "",
      effectiveFrom: getTodayIsoDate(),
      mode: "NONE",
      monthlyCreditAmount: 1,
      ratioThresholdDays: 20,
      ratioEarnedAmount: 1,
      note: "",
    },
    validationSchema: Yup.object({
      typeDefId: Yup.string().required("Leave type is required"),
      name: Yup.string().trim().required("Policy name is required"),
      effectiveFrom: Yup.string().required("Effective from date is required"),
      departmentId: Yup.string().when("scopeType", {
        is: "DEPARTMENT",
        then: (s) => s.required("Department is required"),
      }),
      employeeId: Yup.string().when("scopeType", {
        is: "EMPLOYEE",
        then: (s) => s.required("Employee is required"),
      }),
    }),
    onSubmit: async (values, { resetForm }) => {
      const version = {
        effectiveFrom: values.effectiveFrom,
        mode: values.mode,
        ...(values.note.trim() ? { note: values.note.trim() } : {}),
        ...(values.mode === "MONTHLY_CREDIT"
          ? { monthlyCreditAmount: Number(values.monthlyCreditAmount) }
          : {}),
        ...(values.mode === "WORKED_DAYS_RATIO"
          ? {
              ratioThresholdDays: Number(values.ratioThresholdDays),
              ratioEarnedAmount: Number(values.ratioEarnedAmount),
            }
          : {}),
      };
      try {
        await dispatch(
          createLeavePolicy({
            scopeType: values.scopeType,
            ...(values.scopeType === "DEPARTMENT" ? { departmentId: values.departmentId } : {}),
            ...(values.scopeType === "EMPLOYEE" ? { employeeId: values.employeeId } : {}),
            typeDefId: values.typeDefId,
            name: values.name.trim(),
            version,
          })
        ).unwrap();
        resetForm();
        setIsCreateOpen(false);
        loadPolicies();
      } catch {
        // handled in slice
      }
    },
  });

  // Tune Rules Modal
  const rulesFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: rulesTarget?.name || "",
      maxConsecutiveDays: rulesTarget?.maxConsecutiveDays ?? "",
      minNoticeDays: rulesTarget?.minNoticeDays ?? "",
      requiresDocAboveDays: rulesTarget?.requiresDocAboveDays ?? "",
      sandwichRule: Boolean(rulesTarget?.sandwichRule),
      allowHalfDay: Boolean(rulesTarget?.allowHalfDay),
    },
    onSubmit: async (values) => {
      if (!rulesTarget) return;
      try {
        await dispatch(
          updateLeavePolicy({
            id: rulesTarget.id,
            values: {
              name: values.name.trim(),
              ...(values.maxConsecutiveDays !== ""
                ? { maxConsecutiveDays: Number(values.maxConsecutiveDays) }
                : {}),
              ...(values.minNoticeDays !== ""
                ? { minNoticeDays: Number(values.minNoticeDays) }
                : {}),
              ...(values.requiresDocAboveDays !== ""
                ? { requiresDocAboveDays: Number(values.requiresDocAboveDays) }
                : {}),
              sandwichRule: Boolean(values.sandwichRule),
              allowHalfDay: Boolean(values.allowHalfDay),
              expectedVersion: rulesTarget.version ?? 0,
            },
          })
        ).unwrap();
        setRulesTarget(null);
        loadPolicies();
      } catch {
        // handled
      }
    },
  });

  // Add Immutable Version Modal
  const versionFormik = useFormik({
    initialValues: {
      effectiveFrom: getTodayIsoDate(),
      mode: "NONE",
      monthlyCreditAmount: 1,
      ratioThresholdDays: 20,
      ratioEarnedAmount: 1,
      note: "",
    },
    validationSchema: Yup.object({
      effectiveFrom: Yup.string().required("Effective date required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (!versionsTarget) return;
      const payload = {
        effectiveFrom: values.effectiveFrom,
        mode: values.mode,
        ...(values.note.trim() ? { note: values.note.trim() } : {}),
        ...(values.mode === "MONTHLY_CREDIT"
          ? { monthlyCreditAmount: Number(values.monthlyCreditAmount) }
          : {}),
        ...(values.mode === "WORKED_DAYS_RATIO"
          ? {
              ratioThresholdDays: Number(values.ratioThresholdDays),
              ratioEarnedAmount: Number(values.ratioEarnedAmount),
            }
          : {}),
        expectedVersion: versionsTarget.version ?? 0,
      };
      try {
        await dispatch(addLeavePolicyVersion({ id: versionsTarget.id, values: payload })).unwrap();
        resetForm();
        dispatch(listLeavePolicyVersions(versionsTarget.id));
        loadPolicies();
      } catch {
        // handled
      }
    },
  });

  // Effective Preview Modal
  const previewFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      typeDefId: typeDefOptions[0]?.value || "",
      employeeId: user?.employee?.id || "",
      asOf: getTodayIsoDate(),
    },
    onSubmit: (values) => {
      const params = { asOf: values.asOf };
      if (values.typeDefId) params.typeDefId = values.typeDefId;
      if (values.employeeId) params.employeeId = values.employeeId;
      dispatch(getEffectiveLeavePolicy(params));
    },
  });

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Policy",
        render: (p) => (
          <div>
            <span className="font-semibold text-xs block text-slate-800 dark:text-slate-100">
              {p.name}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {p.typeDef?.code || p.leaveType || "—"}
            </span>
          </div>
        ),
      },
      {
        key: "scopeType",
        header: "Scope",
        render: (p) => (
          <StatusBadge label={formatText(p.scopeType || "COMPANY")} tone="indigo" size="xs" />
        ),
      },
      {
        key: "rules",
        header: "Rules",
        render: (p) => (
          <span className="text-xs text-slate-500 tabular-nums">
            Notice: {p.minNoticeDays ?? 0}d • Max: {p.maxConsecutiveDays ?? "∞"}d • Doc &gt;{" "}
            {p.requiresDocAboveDays ?? "∞"}d
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (p) => (
          <StatusBadge
            label={p.isActive === false ? "ARCHIVED" : "ACTIVE"}
            tone={getStatusTone(p.isActive === false ? "ARCHIVED" : "ACTIVE")}
            size="xs"
          />
        ),
      },
    ],
    []
  );

  const actions = useMemo(
    () => [
      {
        label: "Versions",
        icon: IconVersions,
        onClick: (p) => {
          setVersionsTarget(p);
          dispatch(listLeavePolicyVersions(p.id));
        },
      },
      {
        label: "Tune Rules",
        icon: IconSettings,
        onClick: (p) => setRulesTarget(p),
      },
      {
        label: "Archive",
        icon: IconArchive,
        hidden: (p) => p.isActive === false,
        onClick: async (p) => {
          try {
            await dispatch(
              archiveLeavePolicy({ id: p.id, values: { expectedVersion: p.version ?? 0 } })
            ).unwrap();
            loadPolicies();
          } catch {
            // handled
          }
        },
      },
    ],
    [dispatch, loadPolicies]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            dispatch(clearEffectiveLeavePolicy());
            setIsPreviewOpen(true);
          }}
          className="btn btn-outline btn-sm h-9 inline-flex items-center gap-1.5"
        >
          <IconSearch size={15} />
          <span>Effective Preview</span>
        </button>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="btn btn-primary btn-sm h-9 inline-flex items-center gap-1.5"
        >
          <IconPlus size={15} />
          <span>Create Policy</span>
        </button>
        <RefreshButton
          onClick={loadPolicies}
          loading={isLoadingLeavePolicies}
          className="h-9 w-9 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700/60"
        />
      </div>

      <DataTable
        columns={columns}
        data={leavePolicies}
        actions={actions}
        loading={isLoadingLeavePolicies}
        empty={{
          icon: IconShieldCheck,
          title: "No Leave Policies",
          description: "Create a company baseline or department-scoped leave policy.",
        }}
      />

      {/* Create Policy Modal */}
      <ModalBasic
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Leave Policy"
        description="Define policy scope and its initial effective-dated accrual version."
        size="lg"
      >
        <form onSubmit={createFormik.handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              id="polScope"
              name="scopeType"
              label="Scope"
              required
              options={scopeOptions}
              value={createFormik.values.scopeType}
              onChange={createFormik.handleChange}
            />
            <SelectField
              id="polTypeDef"
              name="typeDefId"
              label="Leave Type"
              required
              options={typeDefOptions}
              value={createFormik.values.typeDefId}
              onChange={createFormik.handleChange}
              error={createFormik.touched.typeDefId && createFormik.errors.typeDefId}
            />
          </div>

          {createFormik.values.scopeType === "DEPARTMENT" && (
            <SelectField
              id="polDept"
              name="departmentId"
              label="Department"
              required
              placeholder="Select department"
              options={deptOptions}
              value={createFormik.values.departmentId}
              onChange={createFormik.handleChange}
              error={createFormik.touched.departmentId && createFormik.errors.departmentId}
            />
          )}

          {createFormik.values.scopeType === "EMPLOYEE" && (
            <SelectField
              id="polEmp"
              name="employeeId"
              label="Employee"
              required
              placeholder="Select employee"
              options={employeeOptions}
              value={createFormik.values.employeeId}
              onChange={createFormik.handleChange}
              error={createFormik.touched.employeeId && createFormik.errors.employeeId}
            />
          )}

          <InputField
            id="polName"
            name="name"
            label="Policy Name"
            required
            placeholder="e.g. Casual Leave — Site Structure Crew"
            value={createFormik.values.name}
            onChange={createFormik.handleChange}
            error={createFormik.touched.name && createFormik.errors.name}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border pt-3">
            <InputField
              id="polEffFrom"
              name="effectiveFrom"
              type="date"
              label="Effective From"
              required
              value={createFormik.values.effectiveFrom}
              onChange={createFormik.handleChange}
            />
            <SelectField
              id="polMode"
              name="mode"
              label="Accrual Mode"
              options={ACCRUAL_MODES}
              value={createFormik.values.mode}
              onChange={createFormik.handleChange}
            />
          </div>

          {createFormik.values.mode === "MONTHLY_CREDIT" && (
            <InputField
              id="polMonthly"
              name="monthlyCreditAmount"
              type="number"
              label="Monthly Credit Amount (days/month)"
              value={createFormik.values.monthlyCreditAmount}
              onChange={createFormik.handleChange}
            />
          )}

          {createFormik.values.mode === "WORKED_DAYS_RATIO" && (
            <div className="grid grid-cols-2 gap-3">
              <InputField
                id="polRatioDays"
                name="ratioThresholdDays"
                type="number"
                label="Worked Days Threshold"
                value={createFormik.values.ratioThresholdDays}
                onChange={createFormik.handleChange}
              />
              <InputField
                id="polRatioEarned"
                name="ratioEarnedAmount"
                type="number"
                label="Earned Leave Days"
                value={createFormik.values.ratioEarnedAmount}
                onChange={createFormik.handleChange}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isMutatingLeave}>
              {isMutatingLeave ? "Creating..." : "Create Policy"}
            </button>
          </div>
        </form>
      </ModalBasic>

      {/* Tune Rules Modal */}
      <ModalBasic
        isOpen={Boolean(rulesTarget)}
        onClose={() => setRulesTarget(null)}
        title={`Tune Rules — ${rulesTarget?.name || ""}`}
        size="md"
      >
        <form onSubmit={rulesFormik.handleSubmit} className="space-y-4 p-6">
          <InputField
            id="ruleName"
            name="name"
            label="Policy Name"
            required
            value={rulesFormik.values.name}
            onChange={rulesFormik.handleChange}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InputField
              id="minNoticeDays"
              name="minNoticeDays"
              type="number"
              label="Min Notice (days)"
              value={rulesFormik.values.minNoticeDays}
              onChange={rulesFormik.handleChange}
            />
            <InputField
              id="maxConsecutiveDays"
              name="maxConsecutiveDays"
              type="number"
              label="Max Consecutive"
              value={rulesFormik.values.maxConsecutiveDays}
              onChange={rulesFormik.handleChange}
            />
            <InputField
              id="requiresDocAboveDays"
              name="requiresDocAboveDays"
              type="number"
              label="Doc Required >"
              value={rulesFormik.values.requiresDocAboveDays}
              onChange={rulesFormik.handleChange}
            />
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rulesFormik.values.sandwichRule}
                onChange={(e) => rulesFormik.setFieldValue("sandwichRule", e.target.checked)}
              />
              <span>Sandwich rule (count Sundays inside window)</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rulesFormik.values.allowHalfDay}
                onChange={(e) => rulesFormik.setFieldValue("allowHalfDay", e.target.checked)}
              />
              <span>Allow half-day</span>
            </label>
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={() => setRulesTarget(null)} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isMutatingLeave}>
              {isMutatingLeave ? "Saving..." : "Save Rules"}
            </button>
          </div>
        </form>
      </ModalBasic>

      {/* Versions Modal */}
      <ModalBasic
        isOpen={Boolean(versionsTarget)}
        onClose={() => setVersionsTarget(null)}
        title={`Policy Versions — ${versionsTarget?.name || ""}`}
        size="lg"
      >
        <div className="space-y-5 p-6">
          <form
            onSubmit={versionFormik.handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end rounded-xl border border-slate-200 dark:border-slate-700/60 p-3"
          >
            <InputField
              id="verEffFrom"
              name="effectiveFrom"
              type="date"
              label="Effective From"
              required
              value={versionFormik.values.effectiveFrom}
              onChange={versionFormik.handleChange}
            />
            <SelectField
              id="verMode"
              name="mode"
              label="Accrual Mode"
              options={ACCRUAL_MODES}
              value={versionFormik.values.mode}
              onChange={versionFormik.handleChange}
            />
            {versionFormik.values.mode === "MONTHLY_CREDIT" && (
              <InputField
                id="verMonthly"
                name="monthlyCreditAmount"
                type="number"
                label="Monthly Credit"
                value={versionFormik.values.monthlyCreditAmount}
                onChange={versionFormik.handleChange}
              />
            )}
            <button
              type="submit"
              disabled={isMutatingLeave}
              className="btn btn-primary btn-sm h-10"
            >
              Add Version
            </button>
          </form>

          <DataTable
            columns={[
              {
                key: "version",
                header: "Version",
                render: (v) => <span className="font-mono font-semibold text-xs">v{v.version}</span>,
              },
              {
                key: "effectiveFrom",
                header: "Effective From",
                render: (v) => <span className="text-xs">{formatDate(v.effectiveFrom)}</span>,
              },
              {
                key: "mode",
                header: "Accrual",
                render: (v) => <span className="text-xs">{formatText(v.mode)}</span>,
              },
              {
                key: "status",
                header: "Status",
                render: (v) => (
                  <StatusBadge
                    label={v.status || "ACTIVE"}
                    tone={getStatusTone(v.status || "ACTIVE")}
                    size="xs"
                  />
                ),
              },
            ]}
            data={policyVersions}
            loading={isLoadingPolicyVersions}
            actions={[
              {
                label: "Cancel Version",
                icon: IconTrash,
                hidden: (v) => v.status === "ARCHIVED" || v.status === "CANCELLED",
                onClick: async (v) => {
                  try {
                    await dispatch(
                      cancelLeavePolicyVersion({
                        id: versionsTarget.id,
                        versionId: v.id,
                        values: { expectedVersion: versionsTarget.version ?? 0 },
                      })
                    ).unwrap();
                    dispatch(listLeavePolicyVersions(versionsTarget.id));
                    loadPolicies();
                  } catch {
                    // handled
                  }
                },
              },
            ]}
          />
        </div>
      </ModalBasic>

      {/* Effective Preview Modal */}
      <ModalBasic
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Effective Leave Policy Preview"
        description="Resolve which policy and version governs an employee on a specific date."
        size="md"
      >
        <form onSubmit={previewFormik.handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              id="prevTypeDef"
              name="typeDefId"
              label="Leave Type"
              options={typeDefOptions}
              value={previewFormik.values.typeDefId}
              onChange={previewFormik.handleChange}
            />
            <InputField
              id="prevAsOf"
              name="asOf"
              type="date"
              label="As Of Date"
              value={previewFormik.values.asOf}
              onChange={previewFormik.handleChange}
            />
          </div>
          {isCompanyAdmin && (
            <SelectField
              id="prevEmp"
              name="employeeId"
              label="Employee (Optional)"
              placeholder="Self / Selected employee"
              options={employeeOptions}
              value={previewFormik.values.employeeId}
              onChange={previewFormik.handleChange}
            />
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsPreviewOpen(false)} className="btn btn-outline btn-sm">
              Close
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isLoadingEffectivePolicy}>
              {isLoadingEffectivePolicy ? "Resolving..." : "Resolve Policy"}
            </button>
          </div>
          {effectiveLeavePolicy && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <strong className="text-sm text-slate-800 dark:text-white">
                  {effectiveLeavePolicy.policy?.name || "Resolved Policy"}
                </strong>
                <StatusBadge
                  label={`Via ${effectiveLeavePolicy.resolvedVia || "COMPANY"}`}
                  tone="indigo"
                  size="xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 tabular-nums">
                <div>
                  <span className="text-slate-400 block">Accrual Mode</span>
                  <strong>{formatText(effectiveLeavePolicy.version?.mode || "NONE")}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Effective From</span>
                  <strong>{formatDate(effectiveLeavePolicy.version?.effectiveFrom)}</strong>
                </div>
              </div>
            </div>
          )}
        </form>
      </ModalBasic>
    </div>
  );
}
