import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Pencil, Building2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import DataTable from "@components/ui/DataTable";

import { getAllCompanies } from "@store/slices/company.slice";
import { ROUTES } from "@constants/routes";
import { formatText } from "@utils/text.utils";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const Muted = ({ children }) => (
  <span className="text-slate-400 dark:text-slate-500">{children}</span>
);

// --------------------------------------------------
// All Companies Page
// --------------------------------------------------

const AllCompaniesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isListingCompanies, companiesData } = useSelector(
    (state) => state.company,
  );

  // --------------------------------------------------
  // Fetch Companies
  // --------------------------------------------------

  useEffect(() => {
    dispatch(getAllCompanies());
  }, [dispatch]);

  const rows = useMemo(
    () => (Array.isArray(companiesData) ? companiesData : []),
    [companiesData],
  );

  // --------------------------------------------------
  // Table Columns
  // --------------------------------------------------

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: "Company",
        render: (company) => (
          <div className="min-w-[210px] leading-tight">
            <div className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100">
              {company.name || "—"}
            </div>

            {company.legalName && (
              <div className="mt-1 text-[12.5px] text-slate-400 dark:text-slate-500">
                {company.legalName}
              </div>
            )}
          </div>
        ),
      },
      {
        key: "code",
        header: "Company Code",
        render: (company) => (
          <span className="font-mono text-[12.5px] text-slate-500 dark:text-slate-400">
            {company.code || "—"}
          </span>
        ),
      },
      {
        key: "location",
        header: "Location",
        render: (company) => {
          const location = [company.regCity, company.regStateUt]
            .filter(Boolean)
            .join(", ");

          return location ? (
            <span className="text-[13px]">{location}</span>
          ) : (
            <Muted>—</Muted>
          );
        },
      },
      {
        key: "contact",
        header: "Contact",
        render: (company) =>
          company.contactEmail || company.contactPhone ? (
            <div className="leading-tight">
              <div className="text-[13px]">{company.contactName || "—"}</div>

              <div className="mt-1 text-[12.5px] text-slate-400 dark:text-slate-500">
                {company.contactEmail || company.contactPhone}
              </div>
            </div>
          ) : (
            <Muted>—</Muted>
          ),
      },

      {
        key: "status",
        header: "Status",
        render: (company) => {
          const isActive = company.status === "ACTIVE";

          return (
            <span
              className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11.5px] font-medium ${
                isActive
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400"
              }`}
            >
              {formatText(company.status)}
            </span>
          );
        },
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
        label: "View",
        icon: Eye,
        onClick: (company) =>
          navigate(ROUTES.COMPANIES.DETAILS.replace(":id", company.id)),
      },
      {
        label: "Edit",
        icon: Pencil,
        onClick: (company) =>
          navigate(ROUTES.COMPANIES.EDIT.replace(":id", company.id)),
      },
    ],
    [navigate],
  );

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="space-y-5">
      <PageHeaderBanner title="All Companies" />

      <DataTable
        title="Companies"
        columns={columns}
        data={rows}
        actions={actions}
        loading={isListingCompanies}
        headerActions={[
          {
            label: "Add Company",
            icon: Plus,
            variant: "primary",
            onClick: () => navigate(ROUTES.COMPANIES.CREATE),
          },
        ]}
        empty={{
          icon: Building2,
          title: "No companies yet",
          description: "Companies you add will show up here.",
        }}
      />
    </div>
  );
};

export default AllCompaniesPage;
