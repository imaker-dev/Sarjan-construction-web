import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, Eye, Pencil, Trash2 } from "lucide-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import Avatar from "@components/ui/Avatar";
import { listDepartments } from "@store/slices/department.slice";
import DataTable from "@components/ui/DataTable";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@constants/routes";

const STATUS_STYLES = {
  ACTIVE:
    "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400",
  DRAFT: "bg-amber-50 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400",
  INACTIVE: "bg-rose-50 text-rose-400 dark:bg-rose-500/15 dark:text-rose-400",
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

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex rounded px-2.5 py-1 text-[12px] font-medium ${STATUS_STYLES[status] || DEFAULT_STATUS_STYLE}`}
  >
    {toTitle(status)}
  </span>
);

const COLUMNS = [
  {
    key: "name",
    header: "Department",
    render: (d) => (
      <div className="flex items-center gap-3">
        <Avatar name={d.name} size={34} />
        <div className="leading-tight">
          <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">
            {d.name}
          </div>
          <div className="text-[12.5px] text-slate-400 dark:text-slate-500">
            {d.code}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "category",
    header: "Category",
    render: (d) => d.categoryLabel || toTitle(d.category),
  },
  { key: "scopeType", header: "Scope", render: (d) => toTitle(d.scopeType) },
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
    render: (d) => <StatusBadge status={d.status} />,
  },
  {
    key: "createdAt",
    header: "Created",
    className: "whitespace-nowrap text-slate-500 dark:text-slate-400",
    render: (d) => formatDate(d.createdAt),
  },
];

const AllDepartmentsPage = ({ onView, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isListingDepartments, departmentsData } = useSelector(
    (state) => state.department,
  );

  useEffect(() => {
    dispatch(listDepartments());
  }, [dispatch]);

  const rows = useMemo(() => {
    if (Array.isArray(departmentsData)) return departmentsData;
    if (Array.isArray(departmentsData?.data)) return departmentsData.data;
    return [];
  }, [departmentsData]);

  const actions = useMemo(
    () => [
      { label: "View", icon: Eye, onClick: (d) => navigate(ROUTES.DEPARTMENTS.OPERATIONS + `?departmentId=${d.id}`) },
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
        empty={{
          icon: Building2,
          title: "No departments yet",
          description: "Departments you create will show up here.",
        }}
      />
    </div>
  );
};

export default AllDepartmentsPage;
