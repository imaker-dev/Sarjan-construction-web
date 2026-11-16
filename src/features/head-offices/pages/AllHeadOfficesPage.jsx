import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  IconBuilding,
  IconMapPin,
  IconPlus,
  IconEye,
  IconPencil,
  IconBuildingSkyscraper,
} from "@tabler/icons-react";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import DataTable from "@components/ui/DataTable";

import { getAllHeadOffices } from "@store/slices/head-office.slice";
import { ROUTES } from "@constants/routes";

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toTitleCase = (value = "") => {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// --------------------------------------------------
// PAGE
// --------------------------------------------------

const AllHeadOfficesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isListingHeadOffices, headOfficesData } = useSelector(
    (state) => state.headOffice,
  );

  useEffect(() => {
    dispatch(getAllHeadOffices());
  }, [dispatch]);

  const rows = useMemo(() => {
    return Array.isArray(headOfficesData) ? headOfficesData : [];
  }, [headOfficesData]);

  // --------------------------------------------------
  // TABLE COLUMNS
  // --------------------------------------------------

  const columns = [
    {
      key: "name",
      header: "Head Office",
      render: (row) => (
        <div className="flex min-w-[210px] items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <IconBuildingSkyscraper size={19} stroke={1.7} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {row.name || "Unnamed Office"}
              </p>

              {row.isPrimary && (
                <span className="inline-flex items-center rounded-md border border-primary-200 bg-primary-50 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-400">
                  Primary
                </span>
              )}
            </div>

            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {row.code || "No office code"}
            </p>
          </div>
        </div>
      ),
    },

    {
      key: "location",
      header: "Location",
      render: (row) => {
        const location = [row.city, row.state, row.pinCode].filter(Boolean);

        return (
          <div className="flex min-w-[160px] items-start gap-2">
            <IconMapPin
              size={16}
              stroke={1.7}
              className="mt-0.5 shrink-0 text-slate-400"
            />

            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {row.city || row.locality || "—"}
              </p>

              {(row.state || row.pinCode) && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {[row.state, row.pinCode].filter(Boolean).join(" · ")}
                </p>
              )}

              {!location.length && (
                <p className="text-xs text-slate-400">Location not added</p>
              )}
            </div>
          </div>
        );
      },
    },

    {
      key: "contact",
      header: "Contact",
      render: (row) => (
        <div className="min-w-[170px]">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {row.contactName || "—"}
          </p>

          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
            {row.contactEmail || row.contactPhone || "No contact details"}
          </p>
        </div>
      ),
    },

    {
      key: "legalName",
      header: "Legal Name",
      render: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {row.legalName || "—"}
        </span>
      ),
    },

    {
      key: "status",
      header: "Status",
      render: (row) => {
        const isActive = row.status === "ACTIVE";

        return (
          <span
            className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
              isActive
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            }`}
          >
            {toTitleCase(row.status || "Unknown")}
          </span>
        );
      },
    },

    {
      key: "createdAt",
      header: "Created On",
      render: (row) => (
        <span className="whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
  ];

  // --------------------------------------------------
  // TABLE ACTIONS
  // --------------------------------------------------

  const actions = [
    {
      label: "View Details",
      icon: IconEye,
      onClick: (row) =>
        navigate(ROUTES.HEAD_OFFICES.DETAILS.replace(":id", row.id)),
    },
    {
      label: "Edit",
      icon: IconPencil,
      onClick: (row) =>
        navigate(ROUTES.HEAD_OFFICES.EDIT.replace(":id", row.id)),
    },
  ];

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="space-y-5">
      <PageHeaderBanner title="Head Offices" />

      <DataTable
        title="All Head Offices"
        columns={columns}
        data={rows}
        actions={actions}
        loading={isListingHeadOffices}
        headerActions={[
          {
            label: "Add Head Office",
            icon: IconPlus,
            variant: "primary",
            onClick: () => navigate(ROUTES.HEAD_OFFICES.CREATE),
          },
        ]}
        empty={{
          icon: IconBuilding,
          title: "No head offices found",
          description:
            "Create your first head office to manage your organization's registered and operational locations.",
        }}
      />
    </div>
  );
};

export default AllHeadOfficesPage;
