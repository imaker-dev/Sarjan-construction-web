import DataTable from "@components/ui/Datatable";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import { useQueryParams } from "@hooks/useQueryParams";

import {
  listEmployeeRoles,
  assignEmployeeRole,
} from "@store/slices/employeeRole.slice";

import { getAllHeadOffices } from "@store/slices/head-office.slice";

import { Plus, ShieldCheck } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { handleResponse } from "@utils/async.utils";
import AssignEmployeeRoleModal from "../components/AssignEmployeeRoleModal";

export const EMPLOYEE_ROLES = [
  //   { label: "Company Admin", value: "COMPANY_ADMIN" },
  { label: "Head Office Admin", value: "HO_ADMIN" },
  { label: "Manager", value: "MANAGER" },
  { label: "Project Manager", value: "PROJECT_MANAGER" },
  { label: "Supervisor", value: "SUPERVISOR" },
  { label: "Team Lead", value: "TEAM_LEAD" },
  { label: "HR Manager", value: "HR_MANAGER" },
  { label: "Finance Manager", value: "FINANCE_MANAGER" },
  { label: "Employee", value: "EMPLOYEE" },
];

const EmployeeRoleAssignmentPage = () => {
  const dispatch = useDispatch();
  const { get } = useQueryParams();
  const employeeId = get("employeeId");

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const { isListingEmployeeRoles, isAssigningEmployeeRole, employeeRolesData } =
    useSelector((state) => state.employeeRole);

  const { headOfficesData, isListingHeadOffices } = useSelector(
    (state) => state.headOffice,
  );

  // --------------------------------------------------
  // Fetch Employee Roles
  // --------------------------------------------------

  useEffect(() => {
    if (!employeeId) return;

    dispatch(listEmployeeRoles(employeeId));
  }, [dispatch, employeeId]);

  // --------------------------------------------------
  // Fetch Head Offices
  // --------------------------------------------------

  useEffect(() => {
    dispatch(getAllHeadOffices());
  }, [dispatch]);

  const headOffices = useMemo(() => {
    const offices = Array.isArray(headOfficesData)
      ? headOfficesData
      : headOfficesData?.headOffices || [];

    return offices.filter((office) => office.status === "ACTIVE");
  }, [headOfficesData]);

  // --------------------------------------------------
  // Refresh
  // --------------------------------------------------

  const handleRefresh = useCallback(() => {
    if (employeeId) {
      dispatch(listEmployeeRoles(employeeId));
    }
  }, [dispatch, employeeId]);

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
        setIsAssignModalOpen(false);
        handleRefresh();
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeaderBanner title="Employee Role Assignments" />

      <DataTable
        title="Assigned Roles"
        // Add columns and actions once the assignment response shape is confirmed.
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
        headOffices={headOffices}
        loading={isAssigningEmployeeRole}
        headOfficesLoading={isListingHeadOffices}
        onSubmit={handleAssignRole}
      />
    </div>
  );
};

export default EmployeeRoleAssignmentPage;
