import DataTable from "@components/ui/Datatable";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import ModalAction from "@components/ui/ModalAction";
import AddEmployeeOperationModal from "../components/AddEmployeeOperationModal";
import { useQueryParams } from "@hooks/useQueryParams";
import {
  getEmployeeOperations,
  assignEmployeeOperation,
  revokeEmployeeOperation,
  updateEmployeeOperationStatus,
} from "@store/slices/employee.slice";
import { Plus, Power, PowerOff, ShieldAlert, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleResponse } from "@utils/async.utils";

const EmployeeOperationsPage = () => {
  const dispatch = useDispatch();
  const { get } = useQueryParams();
  const employeeId = get("employeeId");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [statusConfirmation, setStatusConfirmation] = useState(null);

  const {
    isLoadingOperations,
    isAssigningOperation,
    isRevokingOperation,
    isUpdatingOperationStatus,
    employeeOperations = [],
  } = useSelector((state) => state.employee);

  const fetchEmployeeOperations = useCallback(() => {
    if (!employeeId) return;

    dispatch(getEmployeeOperations(employeeId));
  }, [dispatch, employeeId]);

  useEffect(() => {
    fetchEmployeeOperations();
  }, [fetchEmployeeOperations]);

  const assignedOperationKeys = useMemo(
    () => employeeOperations.map((item) => item.operationKey || item.key),
    [employeeOperations],
  );

  // Assign Operation
  const handleAssignOperation = async (operation) => {
    await handleResponse(
      dispatch(
        assignEmployeeOperation({
          id: employeeId,
          values: {
            operationKey: operation.key,
          },
        }),
      ),
      () => {
        setIsAddModalOpen(false);
        fetchEmployeeOperations();
      },
    );
  };

  // Revoke Operation
  const handleRevokeOperation = async () => {
    if (!selectedOperation) return;

    await handleResponse(
      dispatch(
        revokeEmployeeOperation({
          id: employeeId,
          operationKey: selectedOperation.operationKey || selectedOperation.key,
        }),
      ),
      () => {
        setSelectedOperation(null);
        fetchEmployeeOperations();
      },
    );
  };

  const handleToggleOperationStatus = (operation) => {
    const nextStatus = operation.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setStatusConfirmation({
      operation,
      nextStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusConfirmation) return;

    const { operation, nextStatus } = statusConfirmation;

    await handleResponse(
      dispatch(
        updateEmployeeOperationStatus({
          id: employeeId,
          operationKey: operation.operationKey || operation.key,
          values: { status: nextStatus },
        }),
      ),
      () => {
        setStatusConfirmation(null);
      },
    );
  };

  const handleCloseStatusConfirmation = () => {
    if (isUpdatingOperationStatus) return;
    setStatusConfirmation(null);
  };

  const columns = [
    {
      key: "name",
      header: "Operation",
      render: (row) => (
        <div className="min-w-[220px]">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {row.name || row.operation?.name || "—"}
          </p>

          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {row.operationKey || row.operation?.key || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      mobileStacked: true,
      render: (row) => (
        <div className="min-w-[280px] max-w-[320px] ">
          <p className="text-sm leading-5 text-gray-600 dark:text-gray-300">
            {row.operation?.description || row.description || "—"}
          </p>
        </div>
      ),
    },
    {
      key: "domain",
      header: "Domain",
      render: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {(row.domain || row.operation?.domain || "—").replaceAll("_", " ")}
        </span>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (row) => {
        const source =
          row.source || (row.inherited ? "DEPARTMENT" : "EMPLOYEE");

        const sourceConfig = {
          DEPARTMENT: {
            label: "Department",
            className:
              "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
          },
          ROLE: {
            label: "Role",
            className:
              "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
          },
          EMPLOYEE: {
            label: "Employee",
            className:
              "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
          },
        };

        const config = sourceConfig[source] || sourceConfig.EMPLOYEE;

        return (
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${config.className}`}
          >
            {config.label}
          </span>
        );
      },
    },

    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="form-switch">
            <input
              type="checkbox"
              id={`operation-status-${row.operationKey || row.key}`}
              className="sr-only"
              checked={row.status === "ACTIVE"}
              onChange={() => handleToggleOperationStatus(row)}
              disabled={
                isUpdatingOperationStatus ||
                !["ACTIVE", "INACTIVE"].includes(row.status)
              }
            />

            <label htmlFor={`operation-status-${row.operationKey || row.key}`}>
              <span aria-hidden="true" />
              <span className="sr-only">Toggle operation status</span>
            </label>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {row.status || "—"}
          </span>
        </div>
      ),
    },
  ];

  const actions = [
    {
      label: "Revoke Operation",
      icon: Trash2,
      danger: true,
      onClick: (row) => setSelectedOperation(row),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeaderBanner title="Employee Operations" />

      <DataTable
        title="Assigned Operations"
        columns={columns}
        data={employeeOperations}
        actions={actions}
        loading={isLoadingOperations}
        headerActions={[
          {
            label: "Add Operation",
            icon: Plus,
            variant: "primary",
            onClick: () => setIsAddModalOpen(true),
          },
        ]}
        empty={{
          title: "No operations assigned",
          description:
            "Assign operations to this employee according to their responsibilities.",
        }}
      />

      <AddEmployeeOperationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        assignedOperationKeys={assignedOperationKeys}
        loading={isAssigningOperation}
        onSubmit={handleAssignOperation}
      />

      <ModalAction
        isOpen={!!selectedOperation}
        onClose={() => setSelectedOperation(null)}
        title="Revoke Employee Operation"
        desc={`Are you sure you want to revoke "${
          selectedOperation?.name ||
          selectedOperation?.operation?.name ||
          "this operation"
        }" from this employee? The employee will lose access to this operation.`}
        icon={ShieldAlert}
        onSubmit={handleRevokeOperation}
        loading={isRevokingOperation}
        theme="danger"
        submitText="Revoke Operation"
        loadingText="Revoking..."
        cancelText="Keep Operation"
        size="md"
      />

      <ModalAction
        id="employee-operation-status-confirmation"
        isOpen={!!statusConfirmation}
        onClose={handleCloseStatusConfirmation}
        onSubmit={handleConfirmStatusChange}
        title={
          statusConfirmation?.nextStatus === "ACTIVE"
            ? "Activate Operation"
            : "Deactivate Operation"
        }
        desc="Please review the operation before confirming this status change."
        icon={statusConfirmation?.nextStatus === "ACTIVE" ? Power : PowerOff}
        theme={
          statusConfirmation?.nextStatus === "ACTIVE" ? "success" : "warning"
        }
        submitText={
          statusConfirmation?.nextStatus === "ACTIVE"
            ? "Activate Operation"
            : "Deactivate Operation"
        }
        loadingText="Updating Status..."
        loading={isUpdatingOperationStatus}
        submitDisabled={!statusConfirmation}
        cancelText="Cancel"
      >
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-sm font-semibold text-foreground">
            {statusConfirmation?.operation?.name ||
              statusConfirmation?.operation?.operation?.name ||
              "—"}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {statusConfirmation?.operation?.operationKey ||
              statusConfirmation?.operation?.operation?.key ||
              "—"}
          </p>
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
          {statusConfirmation?.nextStatus === "ACTIVE"
            ? "This operation will be activated and made available to the employee."
            : "This operation will be deactivated and the employee will no longer be able to use it."}
        </p>
      </ModalAction>
    </div>
  );
};

export default EmployeeOperationsPage;
