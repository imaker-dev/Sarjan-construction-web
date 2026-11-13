import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Pencil, Trash2, Users, MailPlus } from "lucide-react";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import Avatar from "@components/ui/Avatar";
import DataTable from "@components/ui/DataTable";

import {
  listEmployees,
  sendEmployeeInvite,
  clearEmployeeInviteData,
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

const COLUMNS = [
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
    render: (e) => <StatusBadge status={e.status} />,
  },
];

const AllEmployeesPage = ({ onView, onEdit, onDelete }) => {
  const dispatch = useDispatch();

  const { isListingEmployees, employeesData, isSendingEmployeeInvite } =
    useSelector((state) => state.employee);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [inviteResult, setInviteResult] = useState(null);

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

  const handleOpenInvite = (employee) => {
    dispatch(clearEmployeeInviteData());

    setSelectedEmployee(employee);
    setInviteResult(null);
  };

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

  const actions = useMemo(
    () => [
      { label: "View", icon: Eye, onClick: onView },
      { label: "Edit", icon: Pencil, onClick: onEdit },
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

  return (
    <div className="space-y-5">
      <PageHeaderBanner title="All Employees" />

      <DataTable
        title="Employees"
        columns={COLUMNS}
        data={rows}
        actions={actions}
        loading={isListingEmployees}
        empty={{
          icon: Users,
          title: "No employees yet",
          description: "Employees you add will show up here.",
        }}
      />

      <SendInviteModal
        isOpen={selectedEmployee}
        onClose={handleCloseInvite}
        employee={selectedEmployee}
        loading={isSendingEmployeeInvite}
        onSubmit={handleSendInvite}
        inviteResult={inviteResult}
      />
    </div>
  );
};

export default AllEmployeesPage;
