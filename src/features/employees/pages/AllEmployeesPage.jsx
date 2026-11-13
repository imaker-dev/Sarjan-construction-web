// import React, { useEffect, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Eye, Pencil, Trash2, Users } from "lucide-react";
// import PageHeaderBanner from "@components/ui/PageHeaderBanner";
// import Avatar from "@components/ui/Avatar";
// import DataTable from "@components/ui/DataTable";
// import { listEmployees } from "@store/slices/employee.slice";

// const STATUS_STYLES = {
//   ACTIVE: "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400",
//   DRAFT: "bg-amber-50 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400",
//   ON_LEAVE: "bg-amber-50 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400",
//   INACTIVE: "bg-rose-50 text-rose-400 dark:bg-rose-500/15 dark:text-rose-400",
//   TERMINATED: "bg-rose-50 text-rose-400 dark:bg-rose-500/15 dark:text-rose-400",
//   ARCHIVED: "bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-400",
// };
// const DEFAULT_STATUS_STYLE = "bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400";

// const toTitle = (value) =>
//   value
//     ? value
//         .toString()
//         .toLowerCase()
//         .split("_")
//         .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
//         .join(" ")
//     : "—";

// const formatDate = (iso) => {
//   const d = iso ? new Date(iso) : null;
//   if (!d || Number.isNaN(d.getTime())) return "—";
//   return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
// };

// const StatusBadge = ({ status }) => (
//   <span className={`inline-flex rounded px-2.5 py-1 text-[12px] font-medium ${STATUS_STYLES[status] || DEFAULT_STATUS_STYLE}`}>
//     {toTitle(status)}
//   </span>
// );

// const Muted = ({ children }) => <span className="text-slate-400 dark:text-slate-500">{children}</span>;

// const COLUMNS = [
//   {
//     key: "displayName",
//     header: "Employee",
//     render: (e) => (
//       <div className="flex items-center gap-3">
//         <Avatar name={e.displayName} size={34} />
//         <div className="leading-tight">
//           <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">{e.displayName}</div>
//           <div className="text-[12.5px] text-slate-400 dark:text-slate-500">{e.employeeCode}</div>
//         </div>
//       </div>
//     ),
//   },
//   {
//     key: "designation",
//     header: "Designation",
//     render: (e) =>
//       e.designation || e.tradeCategory ? (
//         <div className="leading-tight">
//           <div>{e.designation || "—"}</div>
//           {e.tradeCategory && <div className="text-[12.5px] text-slate-400 dark:text-slate-500">{toTitle(e.tradeCategory)}</div>}
//         </div>
//       ) : (
//         <Muted>—</Muted>
//       ),
//   },
//   {
//     key: "contact",
//     header: "Contact",
//     render: (e) =>
//       e.contactEmail || e.contactPhone ? (
//         <div className="leading-tight">
//           <div>{e.contactEmail || "—"}</div>
//           {e.contactPhone && <div className="text-[12.5px] text-slate-400 dark:text-slate-500">{e.contactPhone}</div>}
//         </div>
//       ) : (
//         <Muted>—</Muted>
//       ),
//   },
//   {
//     key: "engagementType",
//     header: "Engagement",
//     render: (e) => (e.engagementType ? toTitle(e.engagementType) : <Muted>—</Muted>),
//   },
//   {
//     key: "joiningDate",
//     header: "Joined",
//     className: "whitespace-nowrap",
//     render: (e) => formatDate(e.joiningDate),
//   },
//   { key: "status", header: "Status", mobilePosition: "header", render: (e) => <StatusBadge status={e.status} /> },
// ];

// const AllEmployeesPage = ({ onView, onEdit, onDelete }) => {
//   const dispatch = useDispatch();
//   const { isListingEmployees, employeesData } = useSelector((state) => state.employee);

//   useEffect(() => {
//     dispatch(listEmployees());
//   }, [dispatch]);

//   // Supports `{ employees: [...] }` and a plain array
//   const rows = useMemo(() => {
//     if (Array.isArray(employeesData?.employees)) return employeesData.employees;
//     if (Array.isArray(employeesData)) return employeesData;
//     return [];
//   }, [employeesData]);

//   const actions = useMemo(
//     () => [
//       { label: "View", icon: Eye, onClick: onView },
//       { label: "Edit", icon: Pencil, onClick: onEdit },
//       { label: "Delete", icon: Trash2, onClick: onDelete, danger: true },
//     ],
//     [onView, onEdit, onDelete]
//   );

//   return (
//     <div className="space-y-5">
//       <PageHeaderBanner title="All Employees" />
//       <DataTable
//         title="Employees"
//         columns={COLUMNS}
//         data={rows}
//         actions={actions}
//         loading={isListingEmployees}
//         empty={{ icon: Users, title: "No employees yet", description: "Employees you add will show up here." }}
//       />
//     </div>
//   );
// };

// export default AllEmployeesPage;



import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Eye,
  Pencil,
  Trash2,
  Users,
  MailPlus,
  Copy,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import Avatar from "@components/ui/Avatar";
import DataTable from "@components/ui/DataTable";

import {
  listEmployees,
  sendEmployeeInvite,
  clearEmployeeInviteData,
} from "@store/slices/employee.slice";

const STATUS_STYLES = {
  ACTIVE:
    "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400",
  DRAFT:
    "bg-amber-50 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400",
  ON_LEAVE:
    "bg-amber-50 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400",
  INACTIVE:
    "bg-rose-50 text-rose-400 dark:bg-rose-500/15 dark:text-rose-400",
  TERMINATED:
    "bg-rose-50 text-rose-400 dark:bg-rose-500/15 dark:text-rose-400",
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

const formatDate = (iso) => {
  const d = iso ? new Date(iso) : null;

  if (!d || Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (iso) => {
  const d = iso ? new Date(iso) : null;

  if (!d || Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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

  const {
    isListingEmployees,
    employeesData,
    isSendingEmployeeInvite,
  } = useSelector((state) => state.employee);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loginId, setLoginId] = useState("");
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

  // Open invitation modal.
  const handleOpenInvite = (employee) => {
    dispatch(clearEmployeeInviteData());

    setSelectedEmployee(employee);
    setLoginId(employee.contactEmail || "");
    setInviteResult(null);
  };

  // Close invitation modal.
  const handleCloseInvite = () => {
    if (isSendingEmployeeInvite) return;

    setSelectedEmployee(null);
    setLoginId("");
    setInviteResult(null);

    dispatch(clearEmployeeInviteData());
  };

  // Send invitation.
  const handleSendInvite = async () => {
    if (!selectedEmployee?.id || !loginId.trim()) return;

    try {
      const response = await dispatch(
        sendEmployeeInvite({
          id: selectedEmployee.id,
          values: {
            loginId: loginId.trim(),
            loginIdType: "EMAIL",
          },
        }),
      ).unwrap();

      setInviteResult(response);
    } catch (error) {
      // Error notification is handled by Redux.
    }
  };

  // Build invitation URL.
  const invitationUrl = inviteResult?.claimCode
    ? `${window.location.origin}/verify-user?token=${encodeURIComponent(
        inviteResult.claimCode,
      )}`
    : "";

  // Copy invitation URL.
  const handleCopyInviteLink = async () => {
    if (!invitationUrl) return;

    try {
      await navigator.clipboard.writeText(invitationUrl);
      toast.success("Invitation link copied successfully!");
    } catch {
      toast.error("Unable to copy invitation link");
    }
  };

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginId.trim());

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
    [onView, onEdit, onDelete],
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

      {/* Send Invitation Modal */}
      {selectedEmployee && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseInvite();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-modal-title"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border px-5 py-4">
              <div>
                <h2
                  id="invite-modal-title"
                  className="text-base font-semibold text-foreground"
                >
                  {inviteResult
                    ? "Invitation Created"
                    : "Send Employee Invitation"}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {inviteResult
                    ? "The invitation link is ready to share."
                    : "Review the employee details before sending an invitation."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseInvite}
                disabled={isSendingEmployeeInvite}
                className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 p-5">
              {/* Employee Information */}
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                <Avatar name={selectedEmployee.displayName} size={42} />

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {selectedEmployee.displayName}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {selectedEmployee.employeeCode}
                  </p>
                </div>
              </div>

              {!inviteResult ? (
                <>
                  {/* Login Email */}
                  <div>
                    <label
                      htmlFor="invite-login-email"
                      className="form-label"
                    >
                      Login Email <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="invite-login-email"
                      type="email"
                      className="form-input w-full"
                      placeholder="Enter employee email"
                      value={loginId}
                      onChange={(event) => setLoginId(event.target.value)}
                      disabled={isSendingEmployeeInvite}
                    />

                    <p className="form-hint">
                      The invitation will be generated for this email address.
                    </p>
                  </div>

                  <div className="rounded-lg bg-primary-500/5 p-3">
                    <p className="text-xs leading-5 text-muted-foreground">
                      Once confirmed, an invitation link will be generated.
                      Share the link with the employee so they can verify
                      their account and set their password.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Success */}
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <div className="flex items-center gap-2">
                      <Check
                        size={17}
                        className="text-emerald-600 dark:text-emerald-400"
                      />

                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        Invitation successfully generated
                      </p>
                    </div>

                    <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                      Share this link with {selectedEmployee.displayName}.
                    </p>
                  </div>

                  {/* Invitation URL */}
                  <div>
                    <label className="form-label">Invitation Link</label>

                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={invitationUrl}
                        className="form-input min-w-0 flex-1 text-xs"
                        onFocus={(event) => event.target.select()}
                      />

                      <button
                        type="button"
                        onClick={handleCopyInviteLink}
                        className="btn btn-outline shrink-0"
                      >
                        <Copy size={16} />
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Expiry */}
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-muted-foreground">
                      Invitation expires
                    </span>

                    <span className="font-medium text-foreground">
                      {formatDateTime(inviteResult.expiresAt)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
              {!inviteResult ? (
                <>
                  <button
                    type="button"
                    onClick={handleCloseInvite}
                    disabled={isSendingEmployeeInvite}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSendInvite}
                    disabled={
                      isSendingEmployeeInvite ||
                      !loginId.trim() ||
                      !isValidEmail
                    }
                    className="btn btn-primary"
                  >
                    {isSendingEmployeeInvite ? (
                      "Generating Invitation..."
                    ) : (
                      <>
                        <MailPlus size={17} />
                        Confirm & Send Invite
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleCloseInvite}
                  className="btn btn-primary"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEmployeesPage;
