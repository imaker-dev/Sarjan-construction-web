import DataTable from "@components/ui/DataTable";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import { useQueryParams } from "@hooks/useQueryParams";
import {
  addEmployeeMembership,
  endEmployeeMembership,
  listEmployeeMemberships,
} from "@store/slices/employeeMembership.slice";
import { listDepartments } from "@store/slices/department.slice";
import { Plus, Trash2, Users2 } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddEmployeeMembershipModal from "../components/AddEmployeeMembershipModal";
import { handleResponse } from "@utils/async.utils";
import { formatDate } from "@utils/date.utils";
import { formatText } from "@utils/text.utils";
import ModalAction from "@components/ui/ModalAction";

const EmployeeMembershipPage = () => {
  const dispatch = useDispatch();
  const { get } = useQueryParams();
  const employeeId = get("employeeId");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);

  const {
    isListingMemberships,
    isAddingMembership,
    membershipsData,
    isEndingMembership,
  } = useSelector((state) => state.employeeMembership);

  // Replace these state keys with the exact names in your department slice.
  const { departmentsData } = useSelector((state) => state.department);

  const handleRefresh = useCallback(() => {
    if (employeeId) {
      dispatch(listEmployeeMemberships(employeeId));
    }
  }, [dispatch, employeeId]);

  useEffect(() => {
    if (!employeeId) return;

    dispatch(listEmployeeMemberships(employeeId));
  }, [dispatch, employeeId]);

  useEffect(() => {
    dispatch(listDepartments());
  }, [dispatch]);

  const handleAddMembership = async (values) => {
    await handleResponse(
      dispatch(
        addEmployeeMembership({
          employeeId,
          values,
        }),
      ),
      () => {
        setIsAddModalOpen(false);
        handleRefresh();
      },
    );
  };

  const handleEndMembership = async () => {
    if (!selectedMembership) return;

    await handleResponse(
      dispatch(
        endEmployeeMembership({
          employeeId,
          membershipId: selectedMembership.id,
          values: {
            expectedVersion: selectedMembership.version,
          },
        }),
      ),
      () => {
        setIsEndModalOpen(false);
        setSelectedMembership(null);
        handleRefresh();
      },
    );
  };

  const handleOpenEndModal = (membership) => {
    setSelectedMembership(membership);
    setIsEndModalOpen(true);
  };

  const Muted = ({ children }) => (
    <span className="text-slate-400 dark:text-slate-500">{children}</span>
  );

  const columns = useMemo(
    () => [
      {
        key: "employee",
        header: "Employee",
        render: (m) => (
          <div className="leading-tight">
            <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">
              {m.employee?.displayName || "—"}
            </div>
            <div className="text-[12.5px] text-slate-400 dark:text-slate-500">
              {m.employee?.employeeCode || "—"}
            </div>
          </div>
        ),
      },
      {
        key: "department",
        header: "Department",
        render: (m) => (
          <div className="leading-tight">
            <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">
              {m.department?.name || "—"}
            </div>
            <div className="text-[12.5px] text-slate-400 dark:text-slate-500">
              {m.department?.code || "—"}
            </div>
          </div>
        ),
      },
      {
        key: "membershipType",
        header: "Membership",
        render: (m) => (
          <span
            className={`inline-flex rounded-md px-2 py-1 text-[11.5px] font-medium ${
              m.isPrimary
                ? "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
                : "bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400"
            }`}
          >
            {m.isPrimary ? "Primary" : "Secondary"}
          </span>
        ),
      },
      {
        key: "startedAt",
        header: "Started On",
        className: "whitespace-nowrap",
        render: (m) => (
          <span className="text-[13px]">
            {m.startedAt ? formatDate(m.startedAt) : <Muted>—</Muted>}
          </span>
        ),
      },
      {
        key: "endedAt",
        header: "Ended On",
        className: "whitespace-nowrap",
        render: (m) => (m.endedAt ? formatDate(m.endedAt) : <Muted>—</Muted>),
      },
      {
        key: "status",
        header: "Status",
        render: (m) => {
          const status = m.endedAt ? "ENDED" : "ACTIVE";

          return (
            <span
              className={`inline-flex rounded-md px-2 py-1 text-[11.5px] font-medium ${
                status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400"
              }`}
            >
              {formatText(status)}
            </span>
          );
        },
      },
    ],
    [],
  );

  const actions = useMemo(
    () => [
      {
        label: "End Membership",
        icon: Trash2,
        danger: true,
        hidden: (membership) => !!membership.endedAt,
        onClick: handleOpenEndModal,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeaderBanner title="Employee Memberships" />

      <DataTable
        title="Employee Memberships"
        columns={columns}
        actions={actions}
        data={membershipsData || []}
        loading={isListingMemberships}
        headerActions={[
          {
            label: "Add Membership",
            icon: Plus,
            variant: "primary",
            onClick: () => setIsAddModalOpen(true),
          },
        ]}
        empty={{
          icon: Users2,
          title: "No memberships found",
          description: "Assign this employee to a department to get started.",
        }}
      />

      <AddEmployeeMembershipModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        departments={departmentsData}
        loading={isAddingMembership}
        onSubmit={handleAddMembership}
      />

      <ModalAction
        isOpen={isEndModalOpen}
        onClose={() => {
          if (isEndingMembership) return;
          setIsEndModalOpen(false);
          setSelectedMembership(null);
        }}
        id={selectedMembership?.id}
        title="End Department Membership"
        desc={`Are you sure you want to end the membership in ${
          selectedMembership?.department?.name || "this department"
        }? This action will retain the membership in history.`}
        icon={Trash2}
        theme="danger"
        submitText="End Membership"
        loadingText="Ending..."
        loading={isEndingMembership}
        onSubmit={handleEndMembership}
        // size="sm"
      />
    </div>
  );
};

export default EmployeeMembershipPage;
