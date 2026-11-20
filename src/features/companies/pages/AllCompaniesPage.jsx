import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, Pencil, Building2, Plus, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import DataTable from "@components/ui/DataTable";

import {
  getAllCompanies,
  reissueCompanyClaimToken,
} from "@store/slices/company.slice";
import { ROUTES } from "@constants/routes";
import { formatText } from "@utils/text.utils";
import { handleResponse } from "@utils/async.utils";
import ModalAction from "@components/ui/ModalAction";

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

  const { isListingCompanies, companiesData, isReissuingClaimToken } =
    useSelector((state) => state.company);

  // Modal state
  const [regenerateConfirmation, setRegenerateConfirmation] = useState(null);
  const [claimTokenResult, setClaimTokenResult] = useState(null);

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
  // Regenerate claim token
  // --------------------------------------------------

  const handleOpenRegenerate = useCallback(
    (company) => {
      setClaimTokenResult(null);
      setRegenerateConfirmation(company);
    },
    [dispatch],
  );

  const handleCloseRegenerate = () => {
    if (isReissuingClaimToken) return;
    setRegenerateConfirmation(null);
    setClaimTokenResult(null);
  };

  const handleConfirmRegenerate = async () => {
    if (!regenerateConfirmation) return;

    await handleResponse(
      dispatch(reissueCompanyClaimToken(regenerateConfirmation.id)),
      (res) => {
        setClaimTokenResult(res.payload);
      },
    );
  };

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
      {
        label: "Regenerate Claim Code",
        icon: KeyRound,
        onClick: (company) => handleOpenRegenerate(company),
        // show only when company has a claim token state worth regenerating
        hidden: (company) => company.status !== "ACTIVE",
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

      {/* Regenerate Claim Code — Confirmation / Result */}
      <ModalAction
        id="regenerate-claim-token-confirmation"
        isOpen={!!regenerateConfirmation}
        onClose={handleCloseRegenerate}
        onSubmit={
          claimTokenResult ? handleCloseRegenerate : handleConfirmRegenerate
        }
        title={
          claimTokenResult ? "Claim Code Regenerated" : "Regenerate Claim Code"
        }
        desc={
          claimTokenResult
            ? "Share the new claim code with the company administrator."
            : "A new single-use claim code will be generated. The previous code will be invalidated immediately."
        }
        icon={KeyRound}
        theme="primary"
        submitText={claimTokenResult ? "Done" : "Regenerate Claim Code"}
        loadingText="Regenerating..."
        loading={isReissuingClaimToken}
        submitDisabled={!regenerateConfirmation}
        cancelText={claimTokenResult ? undefined : "Cancel"}
      >
        {/* Company details */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Building2 size={18} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {regenerateConfirmation?.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {regenerateConfirmation?.code}
              </p>
            </div>
          </div>
        </div>

        {/* Result state */}
        {claimTokenResult && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="text-xs text-muted-foreground">Claim Code</p>
            <p className="mt-1 break-all font-mono text-lg font-semibold text-emerald-700 dark:text-emerald-400">
              {claimTokenResult.claimToken || claimTokenResult.claimCode || "—"}
            </p>
            {claimTokenResult.expiresAt && (
              <p className="mt-2 text-xs text-muted-foreground">
                Expires: {new Date(claimTokenResult.expiresAt).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {!claimTokenResult && (
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            Regenerating will invalidate any existing claim code for this
            company. The new code is valid for 24 hours and can only be used
            once.
          </p>
        )}
      </ModalAction>
    </div>
  );
};

export default AllCompaniesPage;
