import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Pencil, Trash2, Users, MailPlus } from "lucide-react";
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
import { formatDate } from "@utils/date.utils";

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

const toTitle = (value) =>
  value
    ? value
        .toString()
        .toLowerCase()
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "—";

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex rounded px-2.5 py-1 text-[12px] font-medium ${
      STATUS_STYLES[status] || DEFAULT_STATUS_STYLE
    }`}
  >
    {toTitle(status)}
  </span>
);

const Muted = ({ children }) => (
  <span className="text-slate-400 dark:text-slate-500">{children}</span>
);

const AllEmployeesPage = ({ onView, onEdit, onDelete }) => {
  const dispatch = useDispatch();

  const {
    isListingEmployees,
    employeesData,
    isSendingEmployeeInvite,
    isUpdatingEmployeeStatus,
  } = useSelector((state) => state.employee);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [inviteResult, setInviteResult] = useState(null);
  const [statusConfirmation, setStatusConfirmation] = useState(null);

  // Fetch employees.
  useEffect(() => {
    dispatch(listEmployees());
  }, [dispatch]);

  // Supports { employees: [...] } and a plain array.
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
                  {toTitle(e.tradeCategory)}
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
          e.engagementType ? toTitle(e.engagementType) : <Muted>—</Muted>,
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
              {toTitle(e.status)}
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
        label: "Send Invite",
        icon: MailPlus,
        onClick: handleOpenInvite,
      },
      {
        label: "Delete",
        icon: Trash2,
        onClick: onDelete,
        danger: true,
      },
    ],
    [onView, onEdit, onDelete, handleOpenInvite],
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
        empty={{
          icon: Users,
          title: "No employees yet",
          description: "Employees you add will show up here.",
        }}
      />

      {/* Send Invitation Modal */}
      <SendInviteModal
        isOpen={!!selectedEmployee}
        onClose={handleCloseInvite}
        employee={selectedEmployee}
        loading={isSendingEmployeeInvite}
        onSubmit={handleSendInvite}
        inviteResult={inviteResult}
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
