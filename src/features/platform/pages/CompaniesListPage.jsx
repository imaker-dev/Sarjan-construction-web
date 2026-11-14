import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  IconBuilding,
  IconPlus,
  IconEye,
  IconRefresh,
  IconCopy,
  IconSearch,
  IconAdjustmentsHorizontal,
} from "@tabler/icons-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import DataTable from "@components/ui/DataTable";
import Avatar from "@components/ui/Avatar";
import StatusChangeModal from "../components/StatusChangeModal";
import { listCompanies } from "@store/slices/platform.slice";
import { ROUTES } from "@constants/routes";
import { toast } from "sonner";

const STATUS_BADGES = {
  ACTIVE: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40",
  SUSPENDED: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40",
  ARCHIVED: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40",
};

export default function CompaniesListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { companies, isListingCompanies } = useSelector((state) => state.platform);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [statusModalCompany, setStatusModalCompany] = useState(null);

  useEffect(() => {
    dispatch(listCompanies());
  }, [dispatch]);

  const filteredCompanies = useMemo(() => {
    if (!Array.isArray(companies)) return [];
    return companies.filter((c) => {
      const matchesSearch =
        !searchTerm ||
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.legalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.pan?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [companies, searchTerm, statusFilter]);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Company",
        render: (c) => (
          <div className="flex items-center gap-3">
            <Avatar name={c.name || c.code} size={36} />
            <div className="leading-tight min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground truncate">
                  {c.name}
                </span>
                {c.isPlatform && (
                  <span className="rounded bg-primary-100 px-1.5 py-0.5 text-[10px] font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                    PLATFORM
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span className="font-mono font-medium text-primary-600 dark:text-primary-400">
                  {c.code}
                </span>
                {c.legalName && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{c.legalName}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        mobilePosition: "header",
        render: (c) => (
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
              STATUS_BADGES[c.status] || "bg-slate-100 text-slate-600"
            }`}
          >
            {c.status}
          </span>
        ),
      },
      {
        key: "pan",
        header: "PAN",
        render: (c) =>
          c.pan ? (
            <span className="font-mono text-xs font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {c.pan}
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          ),
      },
      {
        key: "contactEmail",
        header: "Contact",
        render: (c) => (
          <div className="text-xs leading-tight">
            <div className="text-foreground truncate max-w-[180px]">
              {c.contactEmail || "—"}
            </div>
            {c.contactPhone && (
              <div className="text-muted-foreground">{c.contactPhone}</div>
            )}
          </div>
        ),
      },
      {
        key: "version",
        header: "Version",
        className: "text-center",
        render: (c) => (
          <span className="font-mono text-xs text-muted-foreground">
            v{c.version ?? 1}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: "Created",
        className: "whitespace-nowrap text-xs text-muted-foreground",
        render: (c) =>
          c.createdAt
            ? new Date(c.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—",
      },
    ],
    []
  );

  const actions = useMemo(
    () => [
      {
        label: "View Company Details",
        icon: IconEye,
        onClick: (c) =>
          navigate(ROUTES.PLATFORM.COMPANY_DETAILS.replace(":companyId", c.id)),
      },
      {
        label: "Change Status",
        icon: IconAdjustmentsHorizontal,
        onClick: (c) => setStatusModalCompany(c),
      },
      {
        label: "Copy Company ID",
        icon: IconCopy,
        onClick: (c) => copyToClipboard(c.id, "Company ID"),
      },
    ],
    [navigate]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeaderBanner
        title="Platform Companies"
        description="Tenant companies managed across the entire platform."
      />

      {/* Filter and Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <IconSearch
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search companies by code, name, PAN, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 w-full"
            />
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg text-xs font-medium">
            {["ALL", "ACTIVE", "SUSPENDED", "ARCHIVED"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded px-2.5 py-1.5 transition-colors ${
                  statusFilter === status
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch(listCompanies())}
            className="btn btn-outline"
            title="Refresh list"
            disabled={isListingCompanies}
          >
            <IconRefresh
              size={16}
              className={isListingCompanies ? "animate-spin" : ""}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(ROUTES.PLATFORM.COMPANY_CREATE)}
            className="btn btn-primary"
          >
            <IconPlus size={16} />
            <span>Create Company</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="All Customer Companies"
        columns={columns}
        data={filteredCompanies}
        actions={actions}
        loading={isListingCompanies}
        empty={{
          icon: IconBuilding,
          title: "No companies found",
          description: searchTerm
            ? "No companies matched your search query."
            : "No customer companies have been provisioned yet.",
        }}
      />

      {/* Status Transition Modal */}
      {statusModalCompany && (
        <StatusChangeModal
          isOpen={!!statusModalCompany}
          onClose={() => setStatusModalCompany(null)}
          company={statusModalCompany}
        />
      )}
    </div>
  );
}

