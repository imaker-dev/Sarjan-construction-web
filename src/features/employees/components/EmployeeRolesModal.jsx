
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Shield,
} from "lucide-react";

import Avatar from "@components/ui/Avatar";
import { getEmployeeAssignments } from "@store/slices/employee.slice";

const EmployeeRolesModal = ({ isOpen, onClose, employee }) => {
  const dispatch = useDispatch();

  const {
    employeeAssignments,
    isLoadingAssignments,
  } = useSelector((state) => state.employee);

  // Fetch employee assignments when modal opens
  useEffect(() => {
    if (isOpen && employee?.id) {
      dispatch(getEmployeeAssignments(employee.id));
    }
  }, [isOpen, employee?.id, dispatch]);

  // Normalize API response
  const assignments = useMemo(() => {
    if (Array.isArray(employeeAssignments)) {
      return employeeAssignments;
    }

    if (Array.isArray(employeeAssignments?.assignments)) {
      return employeeAssignments.assignments;
    }

    return [];
  }, [employeeAssignments]);

  if (!isOpen || !employee) return null;

  const handleRefresh = () => {
    dispatch(getEmployeeAssignments(employee.id));
  };

  const getRoleName = (assignment) =>
    assignment.roleName ||
    assignment.role ||
    assignment.roleKey ||
    assignment.tenantRole ||
    assignment.name ||
    "Assigned Role";

  const getAssignmentId = (assignment) =>
    assignment.assignmentId || assignment.id;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Manage Roles
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                View and manage employee role assignments
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close modal"
          >
            <X size={19} />
          </button>
        </div>

        {/* Employee Details */}
        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <Avatar name={employee.displayName} size={42} />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {employee.displayName}
              </p>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {employee.employeeCode}
                {employee.designation && (
                  <> · {employee.designation}</>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[240px] flex-1 overflow-y-auto px-6 py-5">

          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Assigned Roles
              </h3>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Active roles assigned to this employee
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoadingAssignments}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw
                size={13}
                className={isLoadingAssignments ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* Loading */}
          {isLoadingAssignments && (
            <div className="flex min-h-[180px] flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-primary-500" size={26} />

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading role assignments...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingAssignments && assignments.length === 0 && (
            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-5 text-center dark:border-slate-700 dark:bg-slate-800/20">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <Shield size={22} />
              </div>

              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                No roles assigned
              </p>

              <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-400 dark:text-slate-500">
                This employee currently has no active role assignments.
              </p>
            </div>
          )}

          {/* Assignments List */}
          {!isLoadingAssignments && assignments.length > 0 && (
            <div className="space-y-2.5">
              {assignments.map((assignment, index) => (
                <div
                  key={
                    getAssignmentId(assignment) ??
                    `${getRoleName(assignment)}-${index}`
                  }
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-primary-200 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-primary-500/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                      <ShieldCheck size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                        {getRoleName(assignment)}
                      </p>

                      {assignment.tenant && (
                        <p className="mt-1 text-xs text-slate-400">
                          {assignment.tenant}
                        </p>
                      )}

                      {assignment.scope && (
                        <p className="mt-1 text-xs text-slate-400">
                          Scope: {assignment.scope}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRolesModal;
