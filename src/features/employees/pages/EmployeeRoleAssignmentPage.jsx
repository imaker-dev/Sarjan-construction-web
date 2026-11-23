import DataTable from "@components/ui/Datatable";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import { useQueryParams } from "@hooks/useQueryParams";

import {
  listEmployeeRoles,
  assignEmployeeRole,
  revokeEmployeeRole,
} from "@store/slices/employeeRole.slice";

import { getAllHeadOffices } from "@store/slices/head-office.slice";

import { Plus, ShieldCheck, UserX } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { handleResponse } from "@utils/async.utils";
import AssignEmployeeRoleModal from "../components/AssignEmployeeRoleModal";
import { listProjects } from "@store/slices/project.slice";
import { formatText } from "@utils/text.utils";
import { formatDate } from "@utils/date.utils";
import ModalAction from "@components/ui/ModalAction";

export const EMPLOYEE_ROLES = [
  { label: "Company Owner", value: "COMPANY_OWNER" },
  { label: "Head Office Admin", value: "HO_ADMIN" },
  { label: "Project Director", value: "PROJECT_DIRECTOR" },
  { label: "Project Incharge", value: "PROJECT_INCHARGE" },
  { label: "Project Manager", value: "PROJECT_MANAGER" },
  { label: "Site Engineer", value: "SITE_ENGINEER" },
  { label: "Department Head", value: "DEPT_HEAD" },
  { label: "Employee", value: "EMPLOYEE" },
];

const EmployeeRoleAssignmentPage = () => {
  const dispatch = useDispatch();
  const { get } = useQueryParams();
  const employeeId = get("employeeId");

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [revokeConfirmation, setRevokeConfirmation] = useState(null);

  const {
    isListingEmployeeRoles,
    isAssigningEmployeeRole,
    employeeRolesData,
    isRevokingEmployeeRole,
  } = useSelector((state) => state.employeeRole);

  const { headOfficesData, isListingHeadOffices } = useSelector(
    (state) => state.headOffice,
  );
  const { projectsData, isListingProjects } = useSelector(
    (state) => state.project,
  );

  // --------------------------------------------------
  // Fetch Employee Roles
  // --------------------------------------------------

  const fetchEmployeeRoles = () => {
    dispatch(listEmployeeRoles(employeeId));
  };
  useEffect(() => {
    if (!employeeId) return;

    fetchEmployeeRoles();
  }, [dispatch, employeeId]);

  // --------------------------------------------------
  // Fetch Head Offices
  // --------------------------------------------------

  useEffect(() => {
    dispatch(getAllHeadOffices());
    dispatch(listProjects());
  }, [dispatch]);

  // --------------------------------------------------
  // Assign Role
  // --------------------------------------------------

  const handleAssignRole = async (values) => {
    await handleResponse(
      dispatch(
        assignEmployeeRole({
          employeeId,
          values,
        }),
      ),
      () => {
        fetchEmployeeRoles();
        setIsAssignModalOpen(false);
      },
    );
  };

  const handleOpenRevokeConfirmation = useCallback((assignment) => {
    setRevokeConfirmation(assignment);
  }, []);

  const handleCloseRevokeConfirmation = () => {
    if (isRevokingEmployeeRole) return;
    setRevokeConfirmation(null);
  };

  const handleRevokeRole = async () => {
    if (!revokeConfirmation?.id || !employeeId) return;

    await handleResponse(
      dispatch(
        revokeEmployeeRole({
          employeeId,
          assignmentId: revokeConfirmation.id,
        }),
      ),
      () => {
        fetchEmployeeRoles();
        setRevokeConfirmation(null);
      },
    );
  };

  const columns = useMemo(
    () => [
      {
        key: "role",
        header: "Role",
        render: (row) => (
          <div className="min-w-[160px] leading-tight">
            <p className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">
              {row.role?.name || row.role?.key || "Unknown Role"}
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {row.role?.key || "—"}
            </p>
          </div>
        ),
      },
      {
        key: "scope",
        header: "Scope",
        render: (row) => {
          const scopeLabels = {
            COMPANY: "Company",
            HEAD_OFFICE: "Head Office",
            PROJECT: "Project",
            SITE: "Site",
          };

          const scopeName =
            row.scopeType === "HEAD_OFFICE"
              ? row.headOffice?.name || row.headOfficeId
              : row.scopeType === "PROJECT"
                ? row.project?.name || row.projectId
                : row.scopeType === "SITE"
                  ? row.site?.name || row.siteId
                  : null;

          return (
            <div className="leading-tight">
              <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                {scopeLabels[row.scopeType] || formatText(row.scopeType || "—")}
              </p>
              {scopeName && (
                <p className="mt-1 max-w-[180px] truncate text-xs text-slate-400 dark:text-slate-500">
                  {scopeName}
                </p>
              )}
            </div>
          );
        },
      },
      {
        key: "effectiveFrom",
        header: "Effective From",
        render: (row) => (
          <span className="whitespace-nowrap text-[13px] text-slate-600 dark:text-slate-400">
            {row.effectiveFrom ? formatDate(row.effectiveFrom) : "—"}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: "Assigned On",
        render: (row) => (
          <span className="whitespace-nowrap text-[13px] text-slate-600 dark:text-slate-400">
            {formatDate(row.createdAt)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => {
          const isRevoked = !!row.revokedAt;
          const isExpired =
            row.effectiveTo && new Date(row.effectiveTo) < new Date();

          const status = isRevoked
            ? "REVOKED"
            : isExpired
              ? "EXPIRED"
              : "ACTIVE";

          const styles = {
            ACTIVE:
              "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
            REVOKED:
              "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
            EXPIRED:
              "bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400",
          };

          return (
            <span
              className={`inline-flex rounded px-2.5 py-1 text-xs font-medium ${styles[status]}`}
            >
              {formatText(status)}
            </span>
          );
        },
      },
    ],
    [],
  );

  const actions = [
    {
      label: "Revoke Role",
      icon: UserX,
      danger: true,
      onClick: handleOpenRevokeConfirmation,
      hidden: (row) => !!row.revokedAt,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeaderBanner title="Employee Role Assignments" />

      <DataTable
        title="Assigned Roles"
        columns={columns}
        actions={actions}
        data={employeeRolesData || []}
        loading={isListingEmployeeRoles}
        headerActions={[
          {
            label: "Assign Role",
            icon: Plus,
            variant: "primary",
            onClick: () => setIsAssignModalOpen(true),
          },
        ]}
        empty={{
          icon: ShieldCheck,
          title: "No roles assigned",
          description:
            "Assign a role to this employee to provide the required access.",
        }}
      />

      <AssignEmployeeRoleModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        roles={EMPLOYEE_ROLES}
        headOffices={headOfficesData}
        projects={projectsData}
        loading={isAssigningEmployeeRole}
        headOfficesLoading={isListingHeadOffices}
        projectsLoading={isListingProjects}
        onSubmit={handleAssignRole}
      />

      <ModalAction
        id="revoke-employee-role-confirmation"
        isOpen={!!revokeConfirmation}
        onClose={handleCloseRevokeConfirmation}
        onSubmit={handleRevokeRole}
        title="Revoke Employee Role"
        desc="Are you sure you want to revoke this role assignment? The employee will lose the access granted through this assignment."
        icon={UserX}
        theme="danger"
        submitText="Revoke Role"
        loadingText="Revoking Role..."
        loading={isRevokingEmployeeRole}
        submitDisabled={!revokeConfirmation?.id}
        cancelText="Cancel"
        size="sm"
      >
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {revokeConfirmation?.role?.name ||
              revokeConfirmation?.role?.key ||
              "Unknown Role"}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {formatText(revokeConfirmation?.scopeType || "Unknown Scope")}
          </p>
        </div>
      </ModalAction>
    </div>
  );
};

export default EmployeeRoleAssignmentPage;
