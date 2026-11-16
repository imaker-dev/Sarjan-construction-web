import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ShieldCheck, ShieldAlert, Layers, Plus } from "lucide-react";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import DataTable from "@components/ui/DataTable";

import {
  createOperation,
  getAllOperations,
} from "@store/slices/operation.slice";
import { handleResponse } from "@utils/async.utils";
import AddOperationModal from "../components/AddOperationModal";
import { formatText } from "@utils/text.utils";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const Muted = ({ children }) => (
  <span className="text-slate-400 dark:text-slate-500">{children}</span>
);

// --------------------------------------------------
// All Operations Page
// --------------------------------------------------

const AllOperationsPage = () => {
  const dispatch = useDispatch();

  const listAllOperations = () => {
    dispatch(getAllOperations());
  };

  const { isListingOperations, operationsData, isCreatingOperation } =
    useSelector((state) => state.operation);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --------------------------------------------------
  // Fetch Operations
  // --------------------------------------------------

  useEffect(() => {
    listAllOperations();
  }, [dispatch]);

  const rows = useMemo(
    () => (Array.isArray(operationsData) ? operationsData : []),
    [operationsData],
  );

  // --------------------------------------------------
  // Table Columns
  // --------------------------------------------------

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Operation",
        render: (operation) => (
          <div className="min-w-[220px] leading-tight">
            <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">
              {operation.name || "—"}
            </div>

            <div className="mt-1 text-[12.5px] text-slate-400 dark:text-slate-500">
              {operation.key}
            </div>
          </div>
        ),
      },
      {
        key: "domain",
        header: "Domain",
        render: (operation) =>
          operation.domain ? (
            <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700/40 dark:text-slate-300">
              {formatText(operation.domain)}
            </span>
          ) : (
            <Muted>—</Muted>
          ),
      },
      {
        key: "description",
        header: "Description",
        render: (operation) => (
          <div className="max-w-[420px] text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
            {operation.description || <Muted>—</Muted>}
          </div>
        ),
      },
      {
        key: "sensitive",
        header: "Sensitivity",
        render: (operation) =>
          operation.sensitive ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <ShieldAlert size={13} />
              Sensitive
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <ShieldCheck size={13} />
              Standard
            </span>
          ),
      },
    ],
    [],
  );

  const handleCreateOperation = async (payload, resetForm) => {
    await handleResponse(dispatch(createOperation(payload)), () => {
      listAllOperations();
      resetForm();
      setIsAddModalOpen(false);
    });
  };
  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="space-y-5">
      <PageHeaderBanner
        title="All Operations"
        description="View all available platform operations and their access sensitivity."
      />

      <DataTable
        title="Operations"
        columns={columns}
        data={rows}
        loading={isListingOperations}
        empty={{
          icon: Layers,
          title: "No operations available",
          description: "Available platform operations will appear here.",
        }}
        headerActions={[
          {
            label: "Add Operation",
            icon: Plus,
            variant: "primary",
            onClick: () => setIsAddModalOpen(true),
          },
        ]}
      />

      <AddOperationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateOperation}
        loading={isCreatingOperation}
      />
    </div>
  );
};

export default AllOperationsPage;
