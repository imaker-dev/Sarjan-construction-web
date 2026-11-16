import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import {
  listDepartments,
  updateDepartmentStatus,
} from "@store/slices/department.slice";
import DataTable from "@components/ui/DataTable";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@constants/routes";
import { formatText } from "@utils/text.utils";
import { formatDate } from "@utils/date.utils";
import ModalAction from "@components/ui/ModalAction";
import { handleResponse } from "@utils/async.utils";

const AllDepartmentsPage = ({ onView, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [statusConfirmation, setStatusConfirmation] = useState(null);

  const { isListingDepartments, departmentsData, isUpdatingDepartmentStatus } =
    useSelector((state) => state.department);

  useEffect(() => {
    dispatch(listDepartments());
  }, [dispatch]);

  const rows = useMemo(() => {
    if (Array.isArray(departmentsData)) return departmentsData;
    if (Array.isArray(departmentsData?.data)) return departmentsData.data;
    return [];
  }, [departmentsData]);

  const handleStatusToggle = (department) => {
    const nextStatus = department.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    setStatusConfirmation({
      department,
      nextStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusConfirmation) return;

    const { department, nextStatus } = statusConfirmation;
    await handleResponse(
      dispatch(
        updateDepartmentStatus({
          id: department.id,
          values: {
            to: nextStatus,
            expectedVersion: department.version,
          },
        }),
      ),
      () => {
        setStatusConfirmation(null);
      },
    );
  };

  const handleCloseStatusConfirmation = () => {
    if (isUpdatingDepartmentStatus) return;

    setStatusConfirmation(null);
  };

  const COLUMNS = [
    {
      key: "name",
      header: "Department",
      render: (d) => (
        <div className="leading-tight">
          <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">
            {d.name}
          </div>
          <div className="text-[12.5px] text-slate-400 dark:text-slate-500">
            {d.code}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (d) => d.categoryLabel || formatText(d.category),
    },
    {
      key: "scopeType",
      header: "Scope",
      render: (d) => formatText(d.scopeType),
    },
    {
      key: "head",
      header: "Head",
      render: (d) =>
        d.headEmployeeName || (d.headEmployeeId ? "Assigned" : "Not assigned"),
    },

    {
      key: "status",
      header: "Status",
      mobilePosition: "header",
      render: (d) => (
        <div className="flex items-center gap-2.5">
          <div className="form-switch">
            <input
              type="checkbox"
              id={`department-status-${d.id}`}
              className="sr-only"
              checked={d.status === "ACTIVE"}
              disabled={
                isUpdatingDepartmentStatus ||
                !["ACTIVE", "DRAFT", "INACTIVE"].includes(d.status)
              }
              onChange={() => handleStatusToggle(d)}
            />

            <label htmlFor={`department-status-${d.id}`}>
              <span aria-hidden="true" />
              <span className="sr-only">Toggle department status</span>
            </label>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatText(d.status)}
          </span>
        </div>
      ),
    },

    {
      key: "createdAt",
      header: "Created",
      className: "whitespace-nowrap text-slate-500 dark:text-slate-400",
      render: (d) => formatDate(d.createdAt),
    },
  ];

  const actions = useMemo(
    () => [
      {
        label: "View",
        icon: Eye,
        onClick: (d) =>
          navigate(ROUTES.DEPARTMENTS.OPERATIONS + `?departmentId=${d.id}`),
      },
      { label: "Edit", icon: Pencil, onClick: onEdit },
      { label: "Delete", icon: Trash2, onClick: onDelete, danger: true },
    ],
    [onView, onEdit, onDelete],
  );

  return (
    <div className="space-y-5">
      <PageHeaderBanner title="All Departments" />
      <DataTable
        title="Departments"
        columns={COLUMNS}
        data={rows}
        actions={actions}
        loading={isListingDepartments}
        headerActions={[
          {
            label: "Add Department",
            icon: Plus,
            variant: "primary",
            onClick: () => navigate(ROUTES.DEPARTMENTS.CREATE),
          },
        ]}
        empty={{
          icon: Building2,
          title: "No departments yet",
          description: "Departments you create will show up here.",
        }}
      />

      <ModalAction
        id="department-status-confirmation"
        isOpen={!!statusConfirmation}
        onClose={handleCloseStatusConfirmation}
        onSubmit={handleConfirmStatusChange}
        title={
          statusConfirmation?.nextStatus === "ACTIVE"
            ? statusConfirmation?.department?.status === "INACTIVE"
              ? "Reactivate Department"
              : "Activate Department"
            : "Deactivate Department"
        }
        submitText={
          statusConfirmation?.nextStatus === "ACTIVE"
            ? "Activate Department"
            : "Archive Department"
        }
        desc="Are you sure you want to change this department's status?"
        theme={
          statusConfirmation?.nextStatus === "ACTIVE" ? "success" : "warning"
        }
        loadingText="Updating Status..."
        loading={isUpdatingDepartmentStatus}
        submitDisabled={!statusConfirmation}
        cancelText="Cancel"
      >
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-sm font-semibold text-foreground">
            {statusConfirmation?.department?.name}
          </p>

          <p className="mt-0.5 text-xs text-muted-foreground">
            {statusConfirmation?.department?.code}
          </p>
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
          {statusConfirmation?.nextStatus === "ACTIVE"
            ? statusConfirmation?.department?.status === "INACTIVE"
              ? "This department will be reactivated and become available for operations again."
              : "This department will be activated and become available for use."
            : "This department will be deactivated and temporarily unavailable for active operations."}
        </p>
      </ModalAction>
    </div>
  );
};

export default AllDepartmentsPage;
