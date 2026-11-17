import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Trash2 } from "lucide-react";
import { IconTrash } from "@tabler/icons-react";

import DataTable from "@components/ui/DataTable";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import ModalAction from "@components/ui/ModalAction";

import AddDepartmentOperationModal from "../components/AddDepartmentOperationModal";

import { useQueryParams } from "@hooks/useQueryParams";
import {
  enableDepartmentOperation,
  listDepartmentOperations,
  disableDepartmentOperation,
} from "@store/slices/department.slice";

import { formatDate } from "@utils/date.utils";
import { handleResponse } from "@utils/async.utils";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const Muted = ({ children }) => (
  <span className="text-slate-400 dark:text-slate-500">{children}</span>
);

// --------------------------------------------------
// Department Operations Page
// --------------------------------------------------

const DepartmentOperationsPage = () => {
  const dispatch = useDispatch();
  const { get } = useQueryParams();

  const departmentId = get("departmentId");

  const {
    isListingDepartmentOperations,
    isEnablingDepartmentOperation,
    isDisablingDepartmentOperation,
    departmentOperationsData,
  } = useSelector((state) => state.department);

  // --------------------------------------------------
  // Modal States
  // --------------------------------------------------

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState(null);

  // --------------------------------------------------
  // Fetch Department Operations
  // --------------------------------------------------
  const fetchDepartementOperations = () => {
    dispatch(listDepartmentOperations(departmentId));
  };
  useEffect(() => {
    if (!departmentId) return;

    fetchDepartementOperations();
  }, [dispatch, departmentId]);

  // --------------------------------------------------
  // Add Department Operation
  // --------------------------------------------------

  const enabledOperationKeys = useMemo(
    () =>
      (departmentOperationsData || []).map(
        (operation) => operation.operationKey,
      ),
    [departmentOperationsData],
  );

  const handleAddOperation = async (operation) => {
    if (!departmentId || !operation?.key) return;
    await handleResponse(
      dispatch(
        enableDepartmentOperation({
          departmentId,
          values: {
            operationKey: operation.key,
          },
        }),
      ),
      () => {
        fetchDepartementOperations();
        setIsAddModalOpen(false);
      },
    );
  };

  // --------------------------------------------------
  // Delete Department Operation
  // --------------------------------------------------

  const handleOpenDelete = useCallback((operation) => {
    setSelectedOperation(operation);
  }, []);

  const handleCloseDelete = () => {
    if (isDisablingDepartmentOperation) return;

    setSelectedOperation(null);
  };

  const handleConfirmDelete = async () => {
    if (!departmentId || !selectedOperation?.operationKey) return;

    await handleResponse(
      dispatch(
        disableDepartmentOperation({
          departmentId,
          operationKey: selectedOperation.operationKey,
        }),
      ),
      () => {
        fetchDepartementOperations();
        setSelectedOperation(null);
      },
    );
  };

  // --------------------------------------------------
  // Table Columns
  // --------------------------------------------------

  const columns = useMemo(
    () => [
      {
        key: "operationKey",
        header: "Operation",
        render: (row) => (
          <div className="min-w-[200px] leading-tight">
            <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">
              {row.name || row.operation?.name || row.operationKey}
            </div>

            <div className="mt-1 text-[12.5px] text-slate-400 dark:text-slate-500">
              {row.operationKey}
            </div>
          </div>
        ),
      },
      {
        key: "domain",
        header: "Domain",
        render: (row) => {
          const domain = row.domain || row.operation?.domain;

          return domain ? (
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {domain}
            </span>
          ) : (
            <Muted>—</Muted>
          );
        },
      },
      {
        key: "description",
        header: "Description",
        render: (row) =>
          row.operation?.description ? (
            <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
              {row.operation.description}
            </p>
          ) : (
            <Muted>—</Muted>
          ),
      },

      {
        key: "createdAt",
        header: "Added On",
        className: "whitespace-nowrap",
        render: (row) => formatDate(row.createdAt),
      },
    ],
    [],
  );

  // --------------------------------------------------
  // Table Actions
  // --------------------------------------------------

  const actions = useMemo(
    () => [
      {
        label: "Delete",
        icon: Trash2,
        onClick: handleOpenDelete,
        danger: true,
      },
    ],
    [handleOpenDelete],
  );

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="space-y-5">
      <PageHeaderBanner
        title="Department Operations"
        description="Manage the operations enabled for this department."
      />

      <DataTable
        title="Enabled Operations"
        columns={columns}
        data={departmentOperationsData}
        actions={actions}
        loading={isListingDepartmentOperations}
        headerActions={[
          {
            label: "Add Operation",
            icon: Plus,
            variant: "primary",
            onClick: () => setIsAddModalOpen(true),
          },
        ]}
        empty={{
          title: "No operations enabled",
          description:
            "Add operations from the catalogue to enable them for this department.",
        }}
      />

      {/* Add Operation Modal */}
      <AddDepartmentOperationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddOperation}
        enabledOperationKeys={enabledOperationKeys}
        loading={isEnablingDepartmentOperation}
      />

      {/* Delete Operation Confirmation */}
      <ModalAction
        id="department-operation-delete"
        isOpen={!!selectedOperation}
        onClose={handleCloseDelete}
        onSubmit={handleConfirmDelete}
        title="Remove Operation"
        desc="Are you sure you want to remove this operation from the department?"
        icon={IconTrash}
        theme="danger"
        submitText="Remove Operation"
        loadingText="Removing..."
        loading={isDisablingDepartmentOperation}
        submitDisabled={!selectedOperation}
        cancelText="Cancel"
      >
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-sm font-semibold text-foreground">
            {selectedOperation?.operation?.name ||
              selectedOperation?.operationKey}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {selectedOperation?.operationKey}
          </p>
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
          This operation will no longer be enabled for this department.
        </p>
      </ModalAction>
    </div>
  );
};

export default DepartmentOperationsPage;
