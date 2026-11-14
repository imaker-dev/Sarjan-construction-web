import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  IconArrowLeft,
  IconBuilding,
  IconBuildingSkyscraper,
  IconUsers,
  IconFolders,
  IconBriefcase,
  IconMail,
  IconPhone,
  IconWorld,
  IconMapPin,
  IconPencil,
  IconAdjustmentsHorizontal,
  IconRefresh,
  IconSend,
  IconShieldCheck,
  IconUser,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import Avatar from "@components/ui/Avatar";
import ClaimModal from "../components/ClaimModal";
import StatusChangeModal from "../components/StatusChangeModal";
import EditCompanyModal from "../components/EditCompanyModal";
import {
  getCompanyDetails,
  reissueAdminClaimToken,
  clearCompanyDetails,
} from "@store/slices/platform.slice";
import { ROUTES } from "@constants/routes";

const STATUS_BADGES = {
  ACTIVE:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40",
  SUSPENDED:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40",
  ARCHIVED:
    "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40",
};

export default function CompanyDetailsPage() {
  const { companyId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    companyDetails,
    isLoadingCompany,
    isReissuingClaimToken,
    lastClaimData,
  } = useSelector((state) => state.platform);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [claimModalData, setClaimModalData] = useState(null);

  useEffect(() => {
    if (companyId) {
      dispatch(getCompanyDetails(companyId));
    }
    return () => {
      dispatch(clearCompanyDetails());
    };
  }, [dispatch, companyId]);

  const handleReissueClaim = async () => {
    if (!companyDetails?.admin?.principalId) return;

    try {
      const res = await dispatch(
        reissueAdminClaimToken({
          companyId: companyDetails.id,
          adminPrincipalId: companyDetails.admin.principalId,
        })
      ).unwrap();
      setClaimModalData({
        ...res,
        companyCode: companyDetails.code,
      });
    } catch {
      // Handled in slice
    }
  };

  if (isLoadingCompany && !companyDetails) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!companyDetails) {
    return (
      <div className="p-8 text-center">
        <IconAlertCircle size={40} className="mx-auto text-muted-foreground mb-3" />
        <h3 className="text-lg font-semibold text-foreground">
          Company Not Found
        </h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Could not load the details for the requested tenant company.
        </p>
        <button
          onClick={() => navigate(ROUTES.PLATFORM.COMPANIES)}
          className="btn btn-outline"
        >
          <IconArrowLeft size={16} />
          Back to Companies
        </button>
      </div>
    );
  }

  const {
    id,
    code,
    name,
    legalName,
    entityType,
    tradeName,
    formedOn,
    pan,
    cin,
    llpin,
    regNumber,
    website,
    description,
    regAddressLine1,
    regAddressLine2,
    regCity,
    regStateUt,
    regPin,
    regCountry,
    contactName,
    contactDesignation,
    contactEmail,
    contactPhone,
    status,
    version,
    createdAt,
    updatedAt,
    admin,
    headOffices,
    _count,
  } = companyDetails;

  const fullAddress = [
    regAddressLine1,
    regAddressLine2,
    regCity,
    regStateUt,
    regPin,
    regCountry,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigate(ROUTES.PLATFORM.COMPANIES)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowLeft size={17} />
          <span>Back to All Companies</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch(getCompanyDetails(companyId))}
            className="btn btn-outline"
            title="Refresh details"
          >
            <IconRefresh
              size={16}
              className={isLoadingCompany ? "animate-spin" : ""}
            />
          </button>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="btn btn-light"
          >
            <IconPencil size={16} />
            <span>Edit Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setIsStatusModalOpen(true)}
            className="btn btn-outline"
          >
            <IconAdjustmentsHorizontal size={16} />
            <span>Change Status</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <Avatar name={name || code} size={54} />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold text-foreground">{name}</h1>
                <span className="font-mono text-sm font-semibold rounded bg-muted px-2 py-0.5 text-primary-600 dark:text-primary-400">
                  {code}
                </span>
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                    STATUS_BADGES[status] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {status}
                </span>
              </div>

              {legalName && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Legal: <span className="font-medium text-foreground">{legalName}</span>
                </p>
              )}

              {description && (
                <p className="mt-2 text-xs text-muted-foreground max-w-2xl">
                  {description}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="font-mono">v{version ?? 1}</span>
                <span>•</span>
                <span>Type: <strong className="font-semibold text-foreground">{entityType || "—"}</strong></span>
                {formedOn && (
                  <>
                    <span>•</span>
                    <span>
                      Formed: {new Date(formedOn).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </>
                )}
                {createdAt && (
                  <>
                    <span>•</span>
                    <span>
                      Created: {new Date(createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick links & ID */}
          <div className="flex flex-col items-start md:items-end gap-1.5 text-xs">
            <span className="text-muted-foreground">Tenant UUID:</span>
            <code className="rounded bg-muted px-2 py-1 text-[11px] font-mono text-muted-foreground break-all">
              {id}
            </code>
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-primary-600 hover:underline dark:text-primary-400"
              >
                <IconWorld size={14} />
                <span>{website.replace(/^https?:\/\//, "")}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Summary Counts Bar */}
      {_count && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-background p-4 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <IconFolders size={24} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Active Projects
              </p>
              <p className="text-2xl font-bold text-foreground">
                {_count.projects ?? 0}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border bg-background p-4 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <IconUsers size={24} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Total Employees
              </p>
              <p className="text-2xl font-bold text-foreground">
                {_count.employees ?? 0}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border bg-background p-4 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <IconBuildingSkyscraper size={24} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Departments
              </p>
              <p className="text-2xl font-bold text-foreground">
                {_count.departments ?? 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Account Section (With Claim Token Reissue Button) */}
      <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
              <IconShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Initial Company Administrator
              </h2>
              <p className="text-xs text-muted-foreground">
                Tenant owner and root administrator account.
              </p>
            </div>
          </div>

          {/* UI TIP REQUIREMENT: If admin.claimPending === true, show Resend Onboarding Invite */}
          {admin && (
            <button
              type="button"
              onClick={handleReissueClaim}
              disabled={isReissuingClaimToken}
              className={`btn ${
                admin.claimPending ? "btn-primary animate-pulse" : "btn-outline"
              }`}
            >
              <IconSend size={16} />
              <span>
                {isReissuingClaimToken
                  ? "Generating Token..."
                  : admin.claimPending
                    ? "Resend Onboarding Invite"
                    : "Reissue Claim Token"}
              </span>
            </button>
          )}
        </div>

        {admin ? (
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold">
                Display Name
              </span>
              <p className="text-sm font-semibold text-foreground mt-0.5 flex items-center gap-1.5">
                <IconUser size={16} className="text-muted-foreground" />
                {admin.displayName || "—"}
              </p>
            </div>

            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold">
                Login ID (Email)
              </span>
              <p className="text-sm font-semibold text-foreground mt-0.5 flex items-center gap-1.5 truncate">
                <IconMail size={16} className="text-muted-foreground" />
                {admin.loginId || "—"}
              </p>
            </div>

            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold">
                Account Status
              </span>
              <div className="mt-0.5">
                <span
                  className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${
                    admin.accountStatus === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800"
                  }`}
                >
                  {admin.accountStatus || "—"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold">
                Claim Invitation
              </span>
              <div className="mt-0.5">
                {admin.claimPending ? (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                    <IconAlertCircle size={14} />
                    Pending Claim
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                    <IconCheck size={14} />
                    Account Claimed
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">
            No admin record attached to this tenant.
          </p>
        )}
      </div>

      {/* Head Offices & Address Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Head Offices */}
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
              <IconBuilding size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Head Offices ({headOffices?.length || 0})
              </h3>
              <p className="text-xs text-muted-foreground">
                Corporate headquarters and branches.
              </p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-border">
            {headOffices && headOffices.length > 0 ? (
              headOffices.map((ho) => (
                <div
                  key={ho.id || ho.code}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="leading-tight">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {ho.name}
                      </span>
                      {ho.isPrimary && (
                        <span className="rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-bold text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
                          HQ PRIMARY
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-mono">{ho.code}</span>
                      {(ho.city || ho.state) && (
                        <>
                          <span> • </span>
                          <span>
                            {[ho.city, ho.state].filter(Boolean).join(", ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <span
                    className={`rounded px-2 py-0.5 text-xs font-semibold ${
                      ho.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {ho.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-4 text-xs text-muted-foreground">
                No head offices registered yet.
              </p>
            )}
          </div>
        </div>

        {/* Legal & Registration Parameters */}
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
              <IconBriefcase size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Statutory Identifiers & Contact
              </h3>
              <p className="text-xs text-muted-foreground">
                Regulatory filing codes and primary contact person.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">PAN:</span>
              <p className="font-mono font-semibold text-foreground mt-0.5">
                {pan || "—"}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground">CIN:</span>
              <p className="font-mono font-semibold text-foreground mt-0.5">
                {cin || "—"}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground">LLPIN:</span>
              <p className="font-mono font-semibold text-foreground mt-0.5">
                {llpin || "—"}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground">Reg Number:</span>
              <p className="font-mono font-semibold text-foreground mt-0.5">
                {regNumber || "—"}
              </p>
            </div>

            <div className="col-span-2 border-t border-border pt-3">
              <span className="text-muted-foreground">Contact Person:</span>
              <p className="font-semibold text-foreground mt-0.5">
                {contactName || "—"}{" "}
                {contactDesignation && (
                  <span className="text-muted-foreground font-normal">
                    ({contactDesignation})
                  </span>
                )}
              </p>
              <div className="mt-1 flex flex-wrap gap-4 text-muted-foreground">
                {contactEmail && (
                  <span className="flex items-center gap-1">
                    <IconMail size={13} /> {contactEmail}
                  </span>
                )}
                {contactPhone && (
                  <span className="flex items-center gap-1">
                    <IconPhone size={13} /> {contactPhone}
                  </span>
                )}
              </div>
            </div>

            {fullAddress && (
              <div className="col-span-2 border-t border-border pt-3">
                <span className="text-muted-foreground flex items-center gap-1">
                  <IconMapPin size={13} /> Registered Address:
                </span>
                <p className="text-foreground mt-0.5">{fullAddress}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Company Profile Modal */}
      {isEditModalOpen && (
        <EditCompanyModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          company={companyDetails}
        />
      )}

      {/* Status Transition Modal */}
      {isStatusModalOpen && (
        <StatusChangeModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          company={companyDetails}
        />
      )}

      {/* Claim Token Display Modal */}
      {claimModalData && (
        <ClaimModal
          isOpen={!!claimModalData}
          onClose={() => setClaimModalData(null)}
          data={claimModalData}
        />
      )}
    </div>
  );
}

