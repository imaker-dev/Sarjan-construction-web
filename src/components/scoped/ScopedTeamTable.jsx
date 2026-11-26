import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconUsers, IconPlayerPause, IconPlayerPlay, IconUserX, IconSearch } from "@tabler/icons-react";
import DataTable from "@components/ui/DataTable";
import StatusBadge, { getStatusTone } from "@components/ui/StatusBadge";
import RefreshButton from "@components/ui/RefreshButton";
import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import WorkforceLifecycleModal from "./WorkforceLifecycleModal";
import { getScopeHandler } from "./scope.config";

const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "All Statuses", value: "ALL" },
];

export default function ScopedTeamTable({
  scopeType,
  scopeId,
  canSuspend = false,
  canExit = false,
}) {
  const dispatch = useDispatch();
  const handler = getScopeHandler(scopeType);
  const scopeState = useSelector((state) => state[handler.sliceKey]);
  const teamItems = scopeState[handler.teamKey];
  const isLoadingTeam = scopeState[handler.teamLoadingKey];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [lifecycleTarget, setLifecycleTarget] = useState(null);

  const loadTeam = useCallback(() => {
    if (!scopeId) return;
    const params = {};
    if (statusFilter && statusFilter !== "ALL") params.status = statusFilter;
    if (search.trim()) params.q = search.trim();
    dispatch(handler.fetchTeam({ [handler.idKey]: scopeId, params }));
  }, [dispatch, handler, scopeId, statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTeam();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadTeam]);

  const columns = useMemo(
    () => [
      {
        key: "displayName",
        header: "Worker",
        render: (w) => (
          <div>
            <span className="font-semibold text-xs block text-slate-800 dark:text-slate-100">
              {w.displayName}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {w.employeeCode || "—"}
            </span>
          </div>
        ),
      },
      {
        key: "department",
        header: "Department",
        render: (w) => (
          <span className="text-xs text-slate-600 dark:text-slate-300">
            {w.department?.name || w.departmentName || "—"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (w) => (
          <StatusBadge
            label={w.membershipStatus || w.status || "ACTIVE"}
            tone={getStatusTone(w.membershipStatus || w.status || "ACTIVE")}
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
        label: "Suspend",
        icon: IconPlayerPause,
        hidden: (w) => !canSuspend || (w.membershipStatus || w.status) === "SUSPENDED",
        onClick: (w) => setLifecycleTarget({ employee: w, action: "suspend" }),
      },
      {
        label: "Reinstate",
        icon: IconPlayerPlay,
        hidden: (w) => !canSuspend || (w.membershipStatus || w.status) !== "SUSPENDED",
        onClick: (w) => setLifecycleTarget({ employee: w, action: "reinstate" }),
      },
      {
        label: "Permanent Exit",
        icon: IconUserX,
        hidden: () => !canExit,
        onClick: (w) => setLifecycleTarget({ employee: w, action: "exit" }),
      },
    ],
    [canSuspend, canExit]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] p-3 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadTeam();
          }}
          className="flex flex-wrap items-center gap-2.5 flex-1"
        >
          <div className="w-full sm:w-64">
            <InputField
              id="teamSearch"
              name="teamSearch"
              placeholder="Search name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-40">
            <SelectField
              id="teamStatus"
              name="teamStatus"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-sm h-10 px-4 inline-flex items-center gap-1.5"
          >
            <IconSearch size={15} />
            <span>Filter</span>
          </button>
        </form>

        <RefreshButton
          onClick={loadTeam}
          loading={isLoadingTeam}
          title="Refresh team"
          className="h-10 w-10 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700/60"
        />
      </div>

      <DataTable
        columns={columns}
        data={teamItems}
        actions={actions}
        loading={isLoadingTeam}
        empty={{
          icon: IconUsers,
          title: "No Team Members",
          description: "No workers found in this scope for the selected filter.",
        }}
      />

      {lifecycleTarget && (
        <WorkforceLifecycleModal
          isOpen={!!lifecycleTarget}
          onClose={() => setLifecycleTarget(null)}
          scopeType={scopeType}
          scopeId={scopeId}
          employee={lifecycleTarget.employee}
          action={lifecycleTarget.action}
          onSuccess={loadTeam}
        />
      )}
    </div>
  );
}
