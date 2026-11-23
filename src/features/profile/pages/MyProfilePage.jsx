import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import { getProfile, uploadDocument } from "@store/slices/profile.slice";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  FileText,
  Fingerprint,
  Globe,
  HeartPulse,
  IdCard,
  KeyRound,
  Layers,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Upload,
  User,
  Users,
  Wrench,
} from "lucide-react";
import Avatar from "@components/ui/Avatar";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { formatDate } from "@utils/date.utils";
import { handleResponse } from "@utils/async.utils";
import {
  changePassword,
  disableMfa,
  enableMfa,
  getMfaStatus,
  resendMfaOtp,
  setupMfa,
} from "@store/slices/security.slice";
import MfaOtpModal from "../components/MfaOtpModal";
import Alert from "@components/ui/Alert";
import DocumentUploadModal from "../components/DocumentUploadModal";
import { formatFileSize } from "@utils/file.utils";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const isEmpty = (v) => v === null || v === undefined || v === "";

const humanize = (s = "") =>
  String(s)
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const GROUP_LABELS = {
  ORG: "Organization",
  PLATFORM: "Platform",
  DEPARTMENT: "Departments",
  EMPLOYEE: "Employees",
  COMPLIANCE: "Compliance",
  ROLE: "Role assignment",
  ACCESS: "Access control",
  ATTENDANCE: "Attendance",
  LEAVE: "Leave",
  OPERATION: "Operations",
  FORM: "Forms",
};

const groupPermissions = (permissions = []) => {
  const map = {};

  permissions.forEach((p) => {
    const [prefix, ...rest] = p.split("_");
    if (!map[prefix]) map[prefix] = [];
    map[prefix].push({ key: p, label: humanize(rest.join("_") || prefix) });
  });

  return Object.entries(map).map(([prefix, items]) => ({
    prefix,
    label: GROUP_LABELS[prefix] || humanize(prefix),
    items,
  }));
};

const STATUS_STYLES = {
  ACTIVE:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400",
  INACTIVE:
    "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300",
  SUSPENDED:
    "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400",
};

/* -------------------------------------------------------------------------- */
/* Shared settings-style UI                                                   */
/* -------------------------------------------------------------------------- */

const IconBox = ({ icon: Icon, tone = "default" }) => {
  const tones = {
    default:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    primary:
      "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400",
    danger: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  };

  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}
    >
      <Icon size={18} />
    </span>
  );
};

/** A titled block of rows, like a group in Instagram / Facebook settings. */
const Section = ({ title, description, action, children }) => (
  <section>
    <div className="mb-3 flex flex-col gap-3 px-1 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {children}
    </div>
  </section>
);

/** One row inside a Section. Pass `onClick` to make it an actionable row. */
const Row = ({
  icon,
  tone,
  label,
  value,
  hint,
  badge,
  onClick,
  trailing,
  disabled,
}) => {
  const empty = isEmpty(value) && !hint;
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      {...(onClick ? { type: "button", onClick, disabled } : {})}
      className={`flex w-full items-center gap-4 px-4 py-3.5 text-left sm:px-5 ${
        onClick
          ? "transition hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-50 disabled:opacity-60 dark:hover:bg-slate-800/60 dark:focus-visible:bg-slate-800/60"
          : ""
      }`}
    >
      {icon && <IconBox icon={icon} tone={tone} />}

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <p
            className={`break-words text-sm ${
              empty || isEmpty(value)
                ? "text-slate-400 dark:text-slate-500"
                : "font-medium text-slate-900 dark:text-slate-100"
            }`}
          >
            {isEmpty(value) ? hint || "Not set" : value}
          </p>
          {badge}
        </div>
      </div>

      {trailing ||
        (onClick && (
          <ChevronRight
            size={18}
            className="shrink-0 text-slate-300 dark:text-slate-600"
          />
        ))}
    </Tag>
  );
};

const RowList = ({ children }) => (
  <div className="divide-y divide-slate-100 dark:divide-slate-800">
    {children}
  </div>
);

const Pill = ({ children, tone = "slate" }) => {
  const tones = {
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    primary:
      "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300",
    green:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

const EmptyState = ({ icon: Icon, title, text }) => (
  <div className="flex flex-col items-center px-6 py-10 text-center">
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
      <Icon size={20} />
    </span>
    <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
      {title}
    </p>
    <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">
      {text}
    </p>
  </div>
);

const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-800 ${className}`}
  />
);

const ProfileSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-52 w-full rounded-2xl" />
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Tabs                                                                       */
/* -------------------------------------------------------------------------- */

const TABS = [
  { id: "personal", label: "Personal details", icon: User },
  { id: "security", label: "Password & security", icon: ShieldCheck },
  { id: "access", label: "Roles & permissions", icon: Layers },
  { id: "work", label: "Work", icon: Briefcase },
  { id: "documents", label: "Documents", icon: FileText },
];

const SettingsNav = ({ active, onChange, counts }) => (
  <nav
    aria-label="Profile sections"
    className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-0 sm:px-0 lg:sticky lg:top-20 lg:flex-col lg:gap-1 lg:overflow-visible lg:rounded-2xl lg:border lg:border-slate-200/80 lg:bg-white lg:p-2 lg:shadow-sm dark:lg:border-slate-800 dark:lg:bg-slate-900 [&::-webkit-scrollbar]:hidden"
  >
    {TABS.map(({ id, label, icon: Icon }) => {
      const isActive = active === id;

      return (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-current={isActive ? "page" : undefined}
          className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/30 lg:w-full lg:rounded-xl lg:px-3.5 lg:py-3 ${
            isActive
              ? "bg-primary-500 text-white shadow-sm lg:bg-primary-50 lg:text-primary-700 lg:shadow-none dark:lg:bg-primary-500/10 dark:lg:text-primary-300"
              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 lg:bg-transparent lg:ring-0 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800 dark:lg:bg-transparent"
          }`}
        >
          <Icon size={17} className="shrink-0" />
          <span className="flex-1 text-left">{label}</span>
          {counts[id] > 0 && (
            <span
              className={`hidden rounded-full px-2 py-0.5 text-[11px] font-semibold lg:inline ${
                isActive
                  ? "bg-white text-primary-700 dark:bg-primary-500/20 dark:text-primary-300"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {counts[id]}
            </span>
          )}
        </button>
      );
    })}
  </nav>
);

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

const MyProfilePage = () => {
  const dispatch = useDispatch();

  const { isGettingProfile, profileData, isUploadingDocument } = useSelector(
    (state) => state.profile,
  );

  const {
    isChangingPassword,
    isGettingMfaStatus,
    isSettingUpMfa,
    isEnablingMfa,
    isResendingMfaOtp,
    isDisablingMfa,
    mfaStatusData,
    mfaSetupData,
  } = useSelector((state) => state.security);

  const [activeTab, setActiveTab] = useState("personal");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [permQuery, setPermQuery] = useState("");

  const [mfaModalOpen, setMfaModalOpen] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [mfaConfirmationOpen, setMfaConfirmationOpen] = useState(false);
  const [documentUploadOpen, setDocumentUploadOpen] = useState(false);

  const fetchProfile = () => {
    dispatch(getProfile());
  };
  useEffect(() => {
    fetchProfile();
    dispatch(getMfaStatus());
  }, [dispatch]);

  const permissions = profileData?.permissions;

  const groups = useMemo(() => groupPermissions(permissions), [permissions]);

  const filteredGroups = useMemo(() => {
    const q = permQuery.trim().toLowerCase();

    if (!q) return groups;

    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (i) =>
            i.label.toLowerCase().includes(q) ||
            g.label.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.items.length);
  }, [groups, permQuery]);

  const handleChangePassword = async (payload) => {
    await handleResponse(dispatch(changePassword(payload)), () => {
      setPasswordOpen(false);
    });
  };

  const handleSetupMfa = async () => {
    await handleResponse(dispatch(setupMfa()), (res) => {
      setMfaToken(res.payload?.mfaToken || "");
      setMaskedEmail(res.payload?.maskedEmail || "");
      setMfaModalOpen(true);
    });
  };

  const handleEnableMfa = async ({ code }) => {
    if (!mfaToken || !code) return;

    await handleResponse(dispatch(enableMfa({ mfaToken, code })), () => {
      setMfaModalOpen(false);
      setMfaToken("");
      dispatch(getMfaStatus());
    });
  };

  const handleResendMfaOtp = async () => {
    if (!mfaToken) return;
    await handleResponse(dispatch(resendMfaOtp({ mfaToken })), (res) => {
      setMaskedEmail(res.payload?.maskedEmail || maskedEmail);
    });
  };

  const handleDisableMfa = async () => {
    await handleResponse(dispatch(disableMfa()), () => {
      setMfaConfirmationOpen(false);
      dispatch(getMfaStatus());
    });
  };

  const handleCloseMfaModal = () => {
    if (isEnablingMfa) return;

    setMfaModalOpen(false);
    setMfaToken("");
  };

  const handleUploadDocument = async (formData) => {
    await handleResponse(dispatch(uploadDocument(formData)), () => {
      setDocumentUploadOpen(false);
      fetchProfile();
    });
  };

  if (isGettingProfile && !profileData) {
    return (
      <div className="mt-6">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div>
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-slate-700">
          We couldn't load your profile. Refresh the page to try again.
        </div>
      </div>
    );
  }

  /* ---- Map the nested API response ---- */
  const principal = profileData.principal || {};
  const employee = profileData.employee || {};
  const documents = profileData.documents || [];
  const company = profileData.company || {};
  const roles = profileData.roles || [];
  const assignments = profileData.assignments || [];
  const departments = profileData.departments || [];
  const attendance = profileData.attendance || {};
  const leaveBalances = profileData.leaveBalances || [];

  const displayName = employee.displayName || principal.loginId || "User";
  const status = (principal.status || employee.status || "").toUpperCase();
  const primaryRole = profileData.primaryRole || roles[0];
  const mfaEnabled = isGettingMfaStatus
    ? !!principal.mfaEnabled
    : !!(mfaStatusData?.mfaEnabled ?? principal.mfaEnabled);
  const mfaType = mfaStatusData?.mfaType || principal.mfaType || "EMAIL_OTP";

  const scopeLabel = (a) =>
    a.siteName || a.projectName || a.headOfficeName || company.name || "—";

  const counts = {
    access: (permissions || []).length,
    work: departments.length,
  };

  const VERIFICATION_STYLE = {
    PENDING:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    VERIFIED:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    REJECTED: "bg-rose-50 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400",
  };

  function DocumentRow({ document }) {
    const file = document.file || {};
    const fileName = file.fileName || document.fileName || document.name;
    const url = document.url || file.url;
    const size = formatFileSize(file.sizeBytes);
    const uploaded = formatDate(document.createdAt);
    const isAvailable = !file.status || file.status === "AVAILABLE";
    const verification = document.verificationStatus;

    const typeLabel = document.documentType
      ? humanize(document.documentType)
      : "Document";
    const title = document.title || fileName || "Untitled document";

    const meta = [
      size,
      uploaded && `Uploaded ${uploaded}`,
      !isAvailable && "File not available",
    ].filter(Boolean);

    return (
      <li className="flex items-center gap-3.5 px-4 py-3.5 sm:px-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400">
          <FileText size={18} />
        </span>

        <div className="min-w-0 flex-1">
          {/* Row 1: type + file name */}
          <p
            className="flex min-w-0 items-baseline gap-2"
            title={`${typeLabel} · ${title}`}
          >
            <span className="shrink-0 text-[14px] font-semibold text-slate-800 dark:text-slate-100">
              {typeLabel}
            </span>
            <span
              aria-hidden="true"
              className="text-slate-300 dark:text-slate-600"
            >
              &middot;
            </span>
            <span className="truncate text-[13px] text-slate-500 dark:text-slate-400">
              {title}
            </span>
          </p>

          {/* Row 2: metadata */}
          {meta.length > 0 && (
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12.5px] text-slate-400 dark:text-slate-500">
              {meta.map((item, i) => (
                <React.Fragment key={`${i}-${item}`}>
                  {i > 0 && <span aria-hidden="true">&middot;</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {verification && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-medium ${
                VERIFICATION_STYLE[verification] || VERIFICATION_STYLE.PENDING
              }`}
            >
              {humanize(verification)}
            </span>
          )}

          {/* {url && isAvailable && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
              title="View document"
              aria-label="View document"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary-600 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ExternalLink size={17} />
            </button>
            <a
              href={url}
              download={fileName}
              title="Download document"
              aria-label="Download document"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-primary-600 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Download size={17} />
            </a>
          </div>
        )} */}
        </div>
      </li>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {/* ------------------------------------------------------------------ */}
        {/* Profile header                                                      */}
        {/* ------------------------------------------------------------------ */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* Banner */}
          <div className="relative h-24 overflow-hidden bg-primary-500 dark:bg-primary-700 sm:h-32">
            {/* Dot pattern, fading out toward the left */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1.5px)",
                backgroundSize: "18px 18px",
                WebkitMaskImage:
                  "linear-gradient(to left, black, transparent 75%)",
                maskImage: "linear-gradient(to left, black, transparent 75%)",
              }}
            />
            {/* Soft sheen */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
          </div>

          <div className="px-5 pb-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              {/* Avatar: size is controlled by this wrapper, so it can be responsive */}
              <div className="relative z-10 -mt-12 h-24 w-24 shrink-0 overflow-hidden rounded-full bg-white ring-4 ring-white dark:bg-slate-900 dark:ring-slate-900 sm:-mt-14 sm:h-28 sm:w-28 lg:-mt-16 lg:h-32 lg:w-32">
                <Avatar
                  name={displayName}
                  size={128}
                  style={{
                    width: "100%",
                    height: "100%",
                    minWidth: 0,
                    minHeight: 0,
                  }}
                />
              </div>
              {/* Identity: sits fully on the white area */}
              <div className="min-w-0 flex-1 sm:pt-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <h1 className="truncate text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
                    {displayName}
                  </h1>

                  {status && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        STATUS_STYLES[status] || STATUS_STYLES.INACTIVE
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {humanize(status)}
                    </span>
                  )}
                </div>

                <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-slate-500 dark:text-slate-400">
                  <Mail size={14} className="shrink-0" />
                  <span className="truncate">{principal.loginId}</span>
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {primaryRole && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
                      <BadgeCheck size={13} />
                      {humanize(primaryRole)}
                    </span>
                  )}
                  {company.name && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <Building2 size={13} />
                      {company.name}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPasswordOpen(true)}
                className="btn btn-primary sm:mt-4 sm:shrink-0 sm:self-start"
              >
                <KeyRound size={16} />
                Change password
              </button>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* Settings layout                                                     */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <SettingsNav
            active={activeTab}
            onChange={setActiveTab}
            counts={counts}
          />

          <div className="min-w-0 space-y-8">
            {/* ---------------------------- Personal ----------------------------- */}
            {activeTab === "personal" && (
              <>
                <Section
                  title="Personal details"
                  description="Your information as it appears across the platform."
                >
                  <RowList>
                    <Row
                      icon={User}
                      label="Display name"
                      value={employee.displayName}
                    />
                    <Row
                      icon={IdCard}
                      label="Employee code"
                      value={employee.employeeCode}
                    />
                    <Row
                      icon={Briefcase}
                      label="Designation"
                      value={employee.designation}
                    />
                    <Row
                      icon={Wrench}
                      label="Trade category"
                      value={employee.tradeCategory}
                    />
                    <Row
                      icon={Users}
                      label="Engagement type"
                      value={
                        employee.engagementType
                          ? humanize(employee.engagementType)
                          : null
                      }
                    />
                    <Row
                      icon={CalendarDays}
                      label="Joining date"
                      value={formatDate(employee.joiningDate)}
                    />
                  </RowList>
                </Section>

                <Section
                  title="Contact"
                  description="How we reach you and your emergency contact."
                >
                  <RowList>
                    <Row
                      icon={Fingerprint}
                      label="Login ID"
                      value={principal.loginId}
                    />
                    <Row
                      icon={Mail}
                      label="Contact email"
                      value={employee.contactEmail}
                    />
                    <Row
                      icon={Phone}
                      label="Contact phone"
                      value={employee.contactPhone}
                    />
                    <Row
                      icon={HeartPulse}
                      label="Emergency contact"
                      value={employee.emergencyContactName}
                    />
                    <Row
                      icon={Phone}
                      label="Emergency phone"
                      value={employee.emergencyContactPhone}
                    />
                  </RowList>
                </Section>

                <Section title="Organization">
                  <RowList>
                    <Row
                      icon={Building2}
                      label="Company"
                      value={company.name}
                      badge={
                        company.isPlatform ? (
                          <Pill tone="primary">Platform</Pill>
                        ) : null
                      }
                    />
                    <Row
                      icon={Globe}
                      label="Company code"
                      value={company.code}
                    />
                  </RowList>
                </Section>
              </>
            )}

            {/* ----------------------------- Security ---------------------------- */}
            {activeTab === "security" && (
              <>
                <Section
                  title="Login"
                  description="Keep your account protected."
                >
                  <RowList>
                    <Row
                      icon={LockKeyhole}
                      tone="primary"
                      label="Password"
                      value="Update your password regularly"
                      onClick={() => setPasswordOpen(true)}
                    />

                    {isGettingMfaStatus ? (
                      <div className="flex items-center gap-3 px-4 py-4 text-sm text-slate-400 sm:px-5">
                        <Loader2 size={16} className="animate-spin" />
                        Checking security status…
                      </div>
                    ) : mfaEnabled ? (
                      <Row
                        icon={Smartphone}
                        tone="primary"
                        label="Two-factor authentication"
                        value={`Method: ${humanize(mfaType)}`}
                        badge={<Pill tone="green">On</Pill>}
                        onClick={() => setMfaConfirmationOpen(true)}
                        disabled={isDisablingMfa}
                      />
                    ) : (
                      <Row
                        icon={Smartphone}
                        tone="primary"
                        label="Two-factor authentication"
                        value="Add a verification code sent to your email at sign-in"
                        badge={<Pill>Off</Pill>}
                        onClick={handleSetupMfa}
                        disabled={isSettingUpMfa}
                        trailing={
                          isSettingUpMfa ? (
                            <Loader2
                              size={18}
                              className="animate-spin text-slate-400"
                            />
                          ) : undefined
                        }
                      />
                    )}
                  </RowList>
                </Section>

                {!isGettingMfaStatus && !mfaEnabled && (
                  <Alert
                    icon={ShieldAlert}
                    description={`Two-factor authentication is off. Turn it on so a stolen
                      password alone can't open your account.`}
                    type="warning"
                  />
                )}
              </>
            )}

            {/* ------------------------------ Access ----------------------------- */}
            {activeTab === "access" && (
              <>
                <Section
                  title="Role assignments"
                  description="Where your roles apply."
                  action={<Pill>{assignments.length}</Pill>}
                >
                  {assignments.length ? (
                    <RowList>
                      {assignments.map((a) => (
                        <Row
                          key={a.id}
                          icon={Layers}
                          tone="primary"
                          label={humanize(a.scopeType) || "Scope"}
                          value={a.roleName || humanize(a.roleKey)}
                          trailing={
                            <div className="hidden shrink-0 text-right text-xs text-slate-500 dark:text-slate-400 sm:block">
                              <p className="flex items-center justify-end gap-1.5">
                                <MapPin size={12} />
                                {scopeLabel(a)}
                              </p>
                              <p className="mt-1 flex items-center justify-end gap-1.5">
                                <CalendarDays size={12} />
                                {a.effectiveFrom || a.effectiveTo
                                  ? `${formatDate(a.effectiveFrom) || "—"} – ${
                                      formatDate(a.effectiveTo) || "Present"
                                    }`
                                  : "No expiry"}
                              </p>
                            </div>
                          }
                        />
                      ))}
                    </RowList>
                  ) : (
                    <EmptyState
                      icon={Layers}
                      title="No role assignments yet"
                      text="Assigned roles and the places they apply will show up here."
                    />
                  )}
                </Section>

                <Section
                  title="Permissions"
                  description="What you can do across the platform."
                  action={<Pill tone="primary">{counts.access} granted</Pill>}
                >
                  <div className="p-4 sm:p-5">
                    {groups.length > 0 && (
                      <div className="relative mb-4">
                        <Search
                          size={16}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="text"
                          value={permQuery}
                          onChange={(e) => setPermQuery(e.target.value)}
                          placeholder="Search permissions"
                          className="block w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                    )}

                    {filteredGroups.length ? (
                      <div className="space-y-5">
                        {filteredGroups.map((g) => (
                          <div key={g.prefix}>
                            <div className="mb-2 flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                {g.label}
                              </h3>
                              <span className="text-xs text-slate-400">
                                {g.items.length}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {g.items.map((i) => (
                                <span
                                  key={i.key}
                                  title={i.key}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                >
                                  <Check
                                    size={12}
                                    className="text-primary-500"
                                    strokeWidth={3}
                                  />
                                  {i.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={ShieldCheck}
                        title={
                          groups.length
                            ? "No permissions match your search"
                            : "No permissions granted"
                        }
                        text={
                          groups.length
                            ? "Try a different keyword."
                            : "Permissions come from your roles."
                        }
                      />
                    )}
                  </div>
                </Section>
              </>
            )}

            {/* ------------------------------- Work ------------------------------ */}
            {activeTab === "work" && (
              <>
                <Section title="Departments" description="Teams you belong to.">
                  {departments.length ? (
                    <div className="flex flex-wrap gap-2 p-4 sm:p-5">
                      {departments.map((d, idx) => (
                        <span
                          key={d.id || idx}
                          className="rounded-full bg-primary-50 px-3.5 py-1.5 text-sm font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
                        >
                          {typeof d === "string"
                            ? d
                            : d.name || d.departmentName || "—"}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Users}
                      title="Not part of any department"
                      text="Department memberships will appear here."
                    />
                  )}
                </Section>

                <Section title="Attendance">
                  <Row
                    icon={Clock}
                    tone={attendance.hasActiveSession ? "primary" : "default"}
                    label="Current session"
                    value={
                      attendance.hasActiveSession
                        ? "You're checked in"
                        : "No active session"
                    }
                    badge={
                      attendance.hasActiveSession ? (
                        <Pill tone="green">Active</Pill>
                      ) : null
                    }
                  />
                </Section>

                <Section
                  title="Leave balances"
                  action={<Pill>{leaveBalances.length}</Pill>}
                >
                  {leaveBalances.length ? (
                    <RowList>
                      {leaveBalances.map((b, idx) => (
                        <Row
                          key={b.id || idx}
                          icon={CalendarDays}
                          label={
                            b.leaveTypeName ||
                            humanize(b.leaveType || b.leaveTypeKey) ||
                            "Leave"
                          }
                          value={
                            b.balance ?? b.available ?? b.remaining ?? null
                          }
                          hint="—"
                        />
                      ))}
                    </RowList>
                  ) : (
                    <EmptyState
                      icon={CalendarDays}
                      title="No leave balances"
                      text="Your leave balances will show here once they're set up."
                    />
                  )}
                </Section>
              </>
            )}

            {/* ---------------------------- Documents ---------------------------- */}
            {activeTab === "documents" && (
              <Section
                title="My documents"
                description="View and manage your uploaded employee documents."
                action={
                  <div className="flex items-center gap-2">
                    <Pill>{documents.length} documents</Pill>

                    <button
                      type="button"
                      onClick={() => setDocumentUploadOpen(true)}
                      className="btn btn-sm btn-primary"
                    >
                      <Upload size={15} />
                      <span>Upload document</span>
                    </button>
                  </div>
                }
              >
                {documents.length ? (
                  <RowList>
                    {documents.map((document, index) => (
                      <DocumentRow
                        key={document.id || index}
                        document={document}
                      />
                    ))}
                  </RowList>
                ) : (
                  <EmptyState
                    icon={FileText}
                    title="No documents uploaded"
                    text="Upload your identity, professional and other employee documents to keep everything in one place."
                  />
                )}
              </Section>
            )}
          </div>
        </div>
      </div>

      {/* Change password */}
      <ChangePasswordModal
        isOpen={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onSubmit={handleChangePassword}
        loading={isChangingPassword}
      />

      {/* Enable 2FA - OTP verification */}
      <MfaOtpModal
        open={mfaModalOpen}
        onClose={handleCloseMfaModal}
        onSubmit={handleEnableMfa}
        onResend={handleResendMfaOtp}
        maskedEmail={maskedEmail}
        loading={isEnablingMfa}
        resending={isResendingMfaOtp}
        expiresInSeconds={mfaSetupData?.expiresInSeconds || 300}
      />

      {/* Disable 2FA confirmation */}
      {mfaConfirmationOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-sm rounded-t-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:rounded-2xl">
            <IconBox icon={ShieldAlert} tone="danger" />

            <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
              Turn off two-factor authentication?
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              You won't be asked for an email verification code when you sign
              in.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setMfaConfirmationOpen(false)}
                disabled={isDisablingMfa}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDisableMfa}
                disabled={isDisablingMfa}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDisablingMfa && (
                  <Loader2 size={15} className="animate-spin" />
                )}
                Turn off 2FA
              </button>
            </div>
          </div>
        </div>
      )}

      <DocumentUploadModal
        isOpen={documentUploadOpen}
        onClose={() => setDocumentUploadOpen(false)}
        onSubmit={handleUploadDocument}
        loading={isUploadingDocument}
      />
    </div>
  );
};

export default MyProfilePage;
