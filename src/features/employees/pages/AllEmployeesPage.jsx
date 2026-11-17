import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Eye,
  Pencil,
  Trash2,
  Users,
  MailPlus,
  ShieldCheck,
  KeyRound,
  Download,
  FileSpreadsheet,
  Plus,
} from "lucide-react";
import { IconUserCheck, IconUserX } from "@tabler/icons-react";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import Avatar from "@components/ui/Avatar";
import DataTable from "@components/ui/DataTable";
import ModalAction from "@components/ui/ModalAction";

import {
  listEmployees,
  sendEmployeeInvite,
  clearEmployeeInviteData,
  updateEmployeeStatus,
} from "@store/slices/employee.slice";

import SendInviteModal from "../components/SendInviteModal";
import EmployeeRolesModal from "../components/EmployeeRolesModal";
import EmployeeOperationsModal from "../components/EmployeeOperationsModal";

import { formatDate } from "@utils/date.utils";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@constants/routes";
import { formatText } from "@utils/text.utils";

// --------------------------------------------------
// Constants
// --------------------------------------------------

const STATUS_STYLES = {
  ACTIVE:
    "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400",
  DRAFT: "bg-amber-50 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400",
  ON_LEAVE:
    "bg-amber-50 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400",
  INACTIVE: "bg-rose-50 text-rose-400 dark:bg-rose-500/15 dark:text-rose-400",
  TERMINATED: "bg-rose-50 text-rose-400 dark:bg-rose-500/15 dark:text-rose-400",
  ARCHIVED:
    "bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-400",
};

const DEFAULT_STATUS_STYLE =
  "bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const Muted = ({ children }) => (
  <span className="text-slate-400 dark:text-slate-500">{children}</span>
);

// --------------------------------------------------
// All Employees Page
// --------------------------------------------------

const AllEmployeesPage = ({ onView, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    isListingEmployees,
    employeesData,
    isSendingEmployeeInvite,
    isUpdatingEmployeeStatus,
  } = useSelector((state) => state.employee);

  // --------------------------------------------------
  // Modal States
  // --------------------------------------------------

  const [query, setQuery] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedRoleEmployee, setSelectedRoleEmployee] = useState(null);
  const [selectedOperationEmployee, setSelectedOperationEmployee] =
    useState(null);

  const [inviteResult, setInviteResult] = useState(null);
  const [statusConfirmation, setStatusConfirmation] = useState(null);

  // --------------------------------------------------
  // Fetch Employees
  // --------------------------------------------------

  useEffect(() => {
    dispatch(listEmployees());
  }, [dispatch]);

  const rows = useMemo(() => {
    if (Array.isArray(employeesData?.employees)) {
      return employeesData.employees;
    }

    if (Array.isArray(employeesData)) {
      return employeesData;
    }

    return [];
  }, [employeesData]);

  // --------------------------------------------------
  // Employee Invitation
  // --------------------------------------------------

  const handleOpenInvite = useCallback(
    (employee) => {
      dispatch(clearEmployeeInviteData());

      setSelectedEmployee(employee);
      setInviteResult(null);
    },
    [dispatch],
  );

  const handleCloseInvite = () => {
    if (isSendingEmployeeInvite) return;

    setSelectedEmployee(null);
    setInviteResult(null);

    dispatch(clearEmployeeInviteData());
  };

  const handleSendInvite = async (payload) => {
    try {
      const response = await dispatch(sendEmployeeInvite(payload)).unwrap();

      setInviteResult(response);
    } catch (error) {
      // Error notification is handled by Redux.
    }
  };

  // --------------------------------------------------
  // Employee Status
  // --------------------------------------------------

  const handleStatusToggle = (employee) => {
    const nextStatus = employee.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setStatusConfirmation({
      employee,
      nextStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusConfirmation) return;

    const { employee, nextStatus } = statusConfirmation;

    try {
      await dispatch(
        updateEmployeeStatus({
          id: employee.id,
          values: {
            to: nextStatus,
            expectedVersion: employee.version,
          },
        }),
      ).unwrap();

      setStatusConfirmation(null);
    } catch (error) {
      // Error notification is handled by Redux.
    }
  };

  const handleCloseStatusConfirmation = () => {
    if (isUpdatingEmployeeStatus) return;

    setStatusConfirmation(null);
  };

  // --------------------------------------------------
  // Employee Roles
  // --------------------------------------------------

  const handleOpenRoles = useCallback((employee) => {
    setSelectedRoleEmployee(employee);
  }, []);

  const handleCloseRoles = () => {
    setSelectedRoleEmployee(null);
  };

  // --------------------------------------------------
  // Employee Operations
  // --------------------------------------------------

  const handleOpenOperations = useCallback((employee) => {
    setSelectedOperationEmployee(employee);
  }, []);

  const handleCloseOperations = () => {
    setSelectedOperationEmployee(null);
  };

  // --------------------------------------------------
  // Table Columns
  // --------------------------------------------------

  const columns = useMemo(
    () => [
      {
        key: "displayName",
        header: "Employee",
        render: (e) => (
          <div className="flex items-center gap-3">
            <Avatar name={e.displayName} size={34} />

            <div className="leading-tight">
              <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">
                {e.displayName}
              </div>

              <div className="text-[12.5px] text-slate-400 dark:text-slate-500">
                {e.employeeCode}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "designation",
        header: "Designation",
        render: (e) =>
          e.designation || e.tradeCategory ? (
            <div className="leading-tight">
              <div>{e.designation || "—"}</div>

              {e.tradeCategory && (
                <div className="text-[12.5px] text-slate-400 dark:text-slate-500">
                  {formatText(e.tradeCategory)}
                </div>
              )}
            </div>
          ) : (
            <Muted>—</Muted>
          ),
      },
      {
        key: "contact",
        header: "Contact",
        render: (e) =>
          e.contactEmail || e.contactPhone ? (
            <div className="leading-tight">
              <div>{e.contactEmail || "—"}</div>

              {e.contactPhone && (
                <div className="text-[12.5px] text-slate-400 dark:text-slate-500">
                  {e.contactPhone}
                </div>
              )}
            </div>
          ) : (
            <Muted>—</Muted>
          ),
      },
      {
        key: "engagementType",
        header: "Engagement",
        render: (e) =>
          e.engagementType ? formatText(e.engagementType) : <Muted>—</Muted>,
      },
      {
        key: "joiningDate",
        header: "Joined",
        className: "whitespace-nowrap",
        render: (e) => formatDate(e.joiningDate),
      },
      {
        key: "status",
        header: "Status",
        mobilePosition: "header",
        render: (e) => (
          <div className="flex items-center gap-2.5">
            <div className="form-switch">
              <input
                type="checkbox"
                id={`employee-status-${e.id}`}
                className="sr-only"
                checked={e.status === "ACTIVE"}
                onChange={() => handleStatusToggle(e)}
                disabled={
                  isUpdatingEmployeeStatus ||
                  !["ACTIVE", "INACTIVE"].includes(e.status)
                }
              />

              <label htmlFor={`employee-status-${e.id}`}>
                <span aria-hidden="true" />
                <span className="sr-only">Toggle employee status</span>
              </label>
            </div>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatText(e.status)}
            </span>
          </div>
        ),
      },
    ],
    [isUpdatingEmployeeStatus],
  );

  // --------------------------------------------------
  // Table Actions
  // --------------------------------------------------

  const actions = useMemo(
    () => [
      {
        label: "View",
        icon: Eye,
        onClick: onView,
      },
      {
        label: "Edit",
        icon: Pencil,
        onClick: onEdit,
      },
      {
        label: "Manage Roles",
        icon: ShieldCheck,
        onClick: handleOpenRoles,
      },
      {
        label: "Manage Operations",
        icon: KeyRound,
        onClick: handleOpenOperations,
      },
      {
        label: "Send Invite",
        icon: MailPlus,
        onClick: handleOpenInvite,
        hidden: (employee) => employee.accountStatus != "NOT_INVITED",
      },
      {
        label: "Delete",
        icon: Trash2,
        onClick: onDelete,
        danger: true,
      },
    ],
    [
      onView,
      onEdit,
      onDelete,
      handleOpenRoles,
      handleOpenOperations,
      handleOpenInvite,
    ],
  );

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="space-y-5">
      <PageHeaderBanner title="All Employees" />

      <DataTable
        title="Employees"
        columns={columns}
        data={rows}
        actions={actions}
        loading={isListingEmployees}
        // search={{
        //   value: query,
        //   onChange: setQuery,
        //   placeholder: "Search employees...",
        // }}
        headerActions={[
          // { label: "Download", icon: Download, variant: "icon", onClick: () => {} },
          // { label: "Export", icon: FileSpreadsheet, variant: "outline", onClick: () => {} },
          {
            label: "Add Employee",
            icon: Plus,
            variant: "primary",
            onClick: () => navigate(ROUTES.EMPLOYEES.CREATE),
          },
        ]}
        empty={{
          icon: Users,
          title: "No employees yet",
          description: "Employees you add will show up here.",
        }}
      />

      {/* Employee Invitation Modal */}
      <SendInviteModal
        isOpen={!!selectedEmployee}
        onClose={handleCloseInvite}
        employee={selectedEmployee}
        loading={isSendingEmployeeInvite}
        onSubmit={handleSendInvite}
        inviteResult={inviteResult}
      />

      {/* Employee Roles Modal */}
      <EmployeeRolesModal
        isOpen={!!selectedRoleEmployee}
        onClose={handleCloseRoles}
        employee={selectedRoleEmployee}
      />

      {/* Employee Operations Modal */}
      <EmployeeOperationsModal
        isOpen={!!selectedOperationEmployee}
        onClose={handleCloseOperations}
        employee={selectedOperationEmployee}
      />

      {/* Employee Status Confirmation */}
      <ModalAction
        id="employee-status-confirmation"
        isOpen={!!statusConfirmation}
        onClose={handleCloseStatusConfirmation}
        onSubmit={handleConfirmStatusChange}
        title={
          statusConfirmation?.nextStatus === "ACTIVE"
            ? "Activate Employee"
            : "Deactivate Employee"
        }
        desc="Please review the employee details before confirming this status change."
        icon={
          statusConfirmation?.nextStatus === "ACTIVE"
            ? IconUserCheck
            : IconUserX
        }
        theme={
          statusConfirmation?.nextStatus === "ACTIVE" ? "success" : "warning"
        }
        submitText={
          statusConfirmation?.nextStatus === "ACTIVE"
            ? "Activate Employee"
            : "Deactivate Employee"
        }
        loadingText="Updating Status..."
        loading={isUpdatingEmployeeStatus}
        submitDisabled={!statusConfirmation}
        cancelText="Cancel"
      >
        {/* Employee Details */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <Avatar
              name={statusConfirmation?.employee?.displayName}
              size={42}
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {statusConfirmation?.employee?.displayName}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {statusConfirmation?.employee?.employeeCode}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
          {statusConfirmation?.nextStatus === "ACTIVE"
            ? "This employee will be activated and can access the assigned system features."
            : "This employee will be deactivated and will no longer be considered active."}
        </p>
      </ModalAction>
    </div>
  );
};

export default AllEmployeesPage;
