import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconUsers, IconUserPlus, IconArrowsExchange, IconUserOff } from "@tabler/icons-react";
import DataTable from "@components/ui/DataTable";
import StatusBadge from "@components/ui/StatusBadge";
import ModalBasic from "@components/ui/ModalBasic";
import RefreshButton from "@components/ui/RefreshButton";
import { SelectField } from "@components/fields/SelectField";
import OnboardWorkerModal from "./OnboardWorkerModal";
import {
  fetchDepartmentMembers,
  manageDepartmentMember,
  listDepartments,
} from "@store/slices/department.slice";
import { extractList } from "@utils/api.utils";

export default function DepartmentMembersPanel({
  departmentId,
  canOnboard = false,
  canManageMembers = false,
  canReadContact = false,
}) {
  const dispatch = useDispatch();
  const {
    departmentMembers,
    isLoadingMembers,
    isMutatingMembers: isMutating,
    departmentsData,
  } = useSelector((state) => state.department);

  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState(null);
  const [targetDeptId, setTargetDeptId] = useState("");

  const loadMembers = () => {
    if (departmentId) dispatch(fetchDepartmentMembers({ departmentId, params: { includeEnded: false } }));
  };

  useEffect(() => {
    loadMembers();
  }, [departmentId]);

  useEffect(() => {
    if (!transferTarget || departmentsData) return;
    dispatch(listDepartments());
  }, [transferTarget, departmentsData, dispatch]);

  const deptOptions = useMemo(
    () =>
      extractList(departmentsData)
        .filter((d) => d.id !== departmentId)
        .map((d) => ({ label: d.code ? `${d.name} (${d.code})` : d.name, value: d.id })),
    [departmentsData, departmentId]
  );

  const columns = useMemo(
    () => [
      {
        key: "employee",
        header: "Member",
        render: (m) => (
          <div>
            <span className="font-semibold text-xs block text-slate-800 dark:text-slate-100">
              {m.employee?.displayName || m.displayName || "—"}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {m.employee?.employeeCode || m.employeeCode || "—"}
            </span>
          </div>
        ),
      },
      ...(canReadContact
        ? [
            {
              key: "contact",
              header: "Contact",
              render: (m) => (
                <span className="text-xs text-slate-500">
                  {m.employee?.phone || m.phone || "—"}
                </span>
              ),
            },
          ]
        : []),
      {
        key: "status",
        header: "Status",
        render: (m) => (
          <StatusBadge
            label={m.status || "ACTIVE"}
            tone={m.status === "ACTIVE" ? "emerald" : "slate"}
            size="xs"
          />
        ),
      },
    ],
    [canReadContact]
  );

  const actions = useMemo(
    () =>
      canManageMembers
        ? [
            {
              label: "Transfer Department",
              icon: IconArrowsExchange,
              onClick: (m) => {
                setTargetDeptId("");
                setTransferTarget(m);
              },
            },
            {
              label: "End Membership",
              icon: IconUserOff,
              onClick: async (m) => {
                try {
                  await dispatch(
                    manageDepartmentMember({
                      departmentId,
                      membershipId: m.id,
                      op: "end",
                    })
                  ).unwrap();
                  loadMembers();
                } catch {
                  // handled
                }
              },
            },
          ]
        : [],
    [canManageMembers, dispatch, departmentId]
  );

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferTarget || !targetDeptId) return;
    try {
      await dispatch(
        manageDepartmentMember({
          departmentId,
          membershipId: transferTarget.id,
          op: "transfer",
          values: { toDepartmentId: targetDeptId },
        })
      ).unwrap();
      setTransferTarget(null);
      loadMembers();
    } catch {
      // handled
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {canOnboard && (
          <button
            type="button"
            onClick={() => setIsOnboardOpen(true)}
            className="btn btn-primary btn-sm h-9 inline-flex items-center gap-1.5"
          >
            <IconUserPlus size={15} />
            <span>Onboard Worker</span>
          </button>
        )}
        <RefreshButton
          onClick={loadMembers}
          loading={isLoadingMembers}
          className="h-9 w-9 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700/60"
        />
      </div>

      <DataTable
        columns={columns}
        data={departmentMembers}
        actions={actions}
        loading={isLoadingMembers}
        empty={{
          icon: IconUsers,
          title: "No Department Members",
          description: "No active members in this department.",
        }}
      />

      {isOnboardOpen && (
        <OnboardWorkerModal
          isOpen={isOnboardOpen}
          onClose={() => setIsOnboardOpen(false)}
          departmentId={departmentId}
          onSuccess={loadMembers}
        />
      )}

      {transferTarget && (
        <ModalBasic
          isOpen={!!transferTarget}
          onClose={() => setTransferTarget(null)}
          title="Transfer Member"
          size="sm"
        >
          <form onSubmit={handleTransfer} className="space-y-4 p-6">
            <SelectField
              id="targetDeptId"
              name="targetDeptId"
              label="Target Department"
              required
              placeholder="Select department..."
              options={deptOptions}
              value={targetDeptId}
              onChange={(e) => setTargetDeptId(e.target.value)}
            />
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <button type="button" onClick={() => setTransferTarget(null)} className="btn btn-outline btn-sm">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={isMutating || !targetDeptId}>
                {isMutating ? "Transferring..." : "Transfer"}
              </button>
            </div>
          </form>
        </ModalBasic>
      )}
    </div>
  );
}
