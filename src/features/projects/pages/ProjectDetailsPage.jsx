import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import { useQueryParams } from "@hooks/useQueryParams";
import { getProjectDetails } from "@store/slices/project.slice";
import { formatDate } from "@utils/date.utils";
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  FolderOpen,
  Hash,
  Home,
  Landmark,
  Layers,
  Mail,
  MapPin,
  Phone,
  Ruler,
  ScrollText,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";

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

const fmtDate = (d) => (d ? formatDate(d) : null);

const fmtNumber = (v) =>
  isEmpty(v) ? null : Number(v).toLocaleString("en-IN");

const UNIT_LABELS = {
  SQM: "sq m",
  SQFT: "sq ft",
  ACRE: "acres",
  HECTARE: "ha",
};

const fmtArea = (v, unit) =>
  isEmpty(v)
    ? null
    : `${fmtNumber(v)} ${UNIT_LABELS[unit] || unit?.toLowerCase() || ""}`.trim();

const fmtMoney = (v, currency = "INR") =>
  isEmpty(v)
    ? null
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(Number(v));

/** 185000000 -> "₹18.5 Cr" (INR) */
const fmtMoneyShort = (v, currency = "INR") => {
  if (isEmpty(v)) return null;
  const n = Number(v);
  if (currency !== "INR") return fmtMoney(v, currency);
  if (n >= 1e7) return `₹${+(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${+(n / 1e5).toFixed(2)} L`;
  return fmtMoney(v, currency);
};

const durationLabel = (start, end) => {
  if (!start || !end) return null;
  const months = Math.round(
    (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24 * 30.44),
  );
  if (!Number.isFinite(months) || months <= 0) return null;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y} yr${y > 1 ? "s" : ""}`, m && `${m} mo`]
    .filter(Boolean)
    .join(" ");
};

const STATUS_STYLES = {
  PLANNED:
    "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400",
  ACTIVE:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400",
  IN_PROGRESS:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400",
  ON_HOLD:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400",
  COMPLETED:
    "bg-primary-50 text-primary-700 ring-primary-600/20 dark:bg-primary-500/10 dark:text-primary-300",
  CANCELLED:
    "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400",
};

/* -------------------------------------------------------------------------- */
/* Shared UI                                                                  */
/* -------------------------------------------------------------------------- */

const Section = ({ title, description, icon: Icon, action, children }) => (
  <section>
    <div className="mb-3 flex items-end justify-between gap-3 px-1">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            <Icon size={16} />
          </span>
        )}
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {children}
    </div>
  </section>
);

const Pill = ({ children, tone = "slate" }) => {
  const tones = {
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    primary:
      "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

/** Label + value grid cell used inside sections. */
const Field = ({ icon: Icon, label, value, mono = false }) => (
  <div className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
    {Icon && (
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        <Icon size={16} />
      </span>
    )}
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p
        className={`mt-0.5 break-words text-sm ${
          isEmpty(value)
            ? "text-slate-400 dark:text-slate-500"
            : "font-medium text-slate-900 dark:text-slate-100"
        } ${mono ? "font-mono" : ""}`}
      >
        {isEmpty(value) ? "Not set" : value}
      </p>
    </div>
  </div>
);

const FieldGrid = ({ children }) => (
  <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800 sm:grid-cols-2 sm:divide-y-0 [&>*]:sm:border-b [&>*]:sm:border-slate-100 dark:[&>*]:sm:border-slate-800">
    {children}
  </div>
);

const StatTile = ({ icon: Icon, label, value, sub }) => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-5">
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
      <Icon size={19} />
    </span>
    <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
      {value ?? "—"}
    </p>
    {sub && (
      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
        {sub}
      </p>
    )}
  </div>
);

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

const PageSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-60 w-full rounded-2xl" />
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 rounded-2xl" />
      ))}
    </div>
    <div className="grid gap-6 lg:grid-cols-3">
      <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Timeline                                                                   */
/* -------------------------------------------------------------------------- */

const Timeline = ({ items }) => {
  const now = new Date();

  return (
    <ol className="relative space-y-5 px-5 py-5">
      <span className="absolute bottom-7 left-[29px] top-7 w-px bg-slate-200 dark:bg-slate-800" />

      {items.map(({ label, date }) => {
        const done = date && new Date(date) <= now;

        return (
          <li key={label} className="relative flex items-center gap-4">
            <span
              className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900 ${
                done
                  ? "bg-primary-500 text-white"
                  : date
                    ? "border-2 border-primary-400 bg-white dark:bg-slate-900"
                    : "border-2 border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
              }`}
            >
              {done && <CheckCircle2 size={12} strokeWidth={3} />}
            </span>

            <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
              <span
                className={`text-sm ${
                  date
                    ? "font-medium text-slate-900 dark:text-slate-100"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {label}
              </span>
              <span
                className={`shrink-0 text-xs ${
                  date
                    ? "text-slate-600 dark:text-slate-300"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {fmtDate(date) || "Not set"}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

const ProjectDetailsPage = () => {
  const dispatch = useDispatch();
  const { get } = useQueryParams();
  const projectId = get("projectId");

  const { projectData, isGettingProjectDetails } = useSelector(
    (state) => state.project,
  );

  useEffect(() => {
    if (!projectId) return;
    dispatch(getProjectDetails(projectId));
  }, [dispatch, projectId]);

  // Ignore stale data from a previously opened project
  const p = projectData?.id === projectId ? projectData : null;

  const address = useMemo(() => {
    if (!p) return "";
    const parts = [
      p.locationAddressLine,
      p.locationLocality,
      p.locationCity,
      p.locationDistrict !== p.locationCity ? p.locationDistrict : null,
      p.locationState,
      p.locationPin,
      p.locationCountry,
    ].filter((x) => !isEmpty(x));
    return parts.join(", ");
  }, [p]);

  if (!projectId) {
    return (
      <div>
        <PageHeaderBanner title="Project Details" />
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-slate-700">
          No project selected.
        </div>
      </div>
    );
  }

  if (!p) {
    return (
      <div>
        <PageHeaderBanner title="Project Details" />
        <div className="mt-6">
          {isGettingProjectDetails ? (
            <PageSkeleton />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-slate-700">
              We couldn't load this project. Refresh the page to try again.
            </div>
          )}
        </div>
      </div>
    );
  }

  const status = (p.status || "").toUpperCase();
  const parcels = p.landParcels || [];
  const documents = p.documents || [];
  const approvals = p.approvals || [];
  const duration = durationLabel(p.startDate, p.endDate);
  const hasGeo = !isEmpty(p.geoLatitude) && !isEmpty(p.geoLongitude);

  const timeline = [
    { label: "Tender", date: null, hidden: true },
    { label: "Contract signed", date: p.contractDate },
    { label: "Work order", date: p.workOrderDate },
    { label: "Notice to proceed", date: p.ntpDate },
    { label: "Planned start", date: p.startDate },
    { label: "Actual start", date: p.actualStartDate },
    { label: "Planned end", date: p.endDate },
    ...(p.revisedEndDate
      ? [{ label: "Revised end", date: p.revisedEndDate }]
      : []),
    { label: "Actual end", date: p.actualEndDate },
  ].filter((t) => !t.hidden);

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative h-28 overflow-hidden bg-primary-500 dark:bg-primary-700 sm:h-36">
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
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />

          <span className="absolute right-4 top-4 rounded-full bg-white/15 px-3 py-1 font-mono text-xs font-medium text-white backdrop-blur-sm sm:right-6 sm:top-5">
            {p.code}
          </span>
        </div>

        <div className="px-5 pb-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            <span className="relative z-10 -mt-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-md ring-4 ring-white dark:bg-slate-800 dark:text-primary-400 dark:ring-slate-900 sm:-mt-12 sm:h-24 sm:w-24">
              <Building2 size={36} />
            </span>

            <div className="min-w-0 flex-1 sm:pt-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
                  {p.name}
                </h1>
                {status && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      STATUS_STYLES[status] || STATUS_STYLES.PLANNED
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {humanize(status)}
                  </span>
                )}
              </div>

              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <MapPin size={14} className="shrink-0" />
                <span className="truncate">
                  {[p.locationLocality, p.locationCity, p.locationState]
                    .filter(Boolean)
                    .join(", ") || "Location not set"}
                </span>
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {p.projectType && (
                  <Pill tone="primary">
                    <Layers size={13} />
                    {humanize(p.projectType)}
                  </Pill>
                )}
                {p.projectSubtype && <Pill>{p.projectSubtype}</Pill>}
                {p.contractType && (
                  <Pill>
                    <ScrollText size={13} />
                    {p.contractType}
                  </Pill>
                )}
                {p.clientName && (
                  <Pill>
                    <Landmark size={13} />
                    {p.clientName}
                  </Pill>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Key stats                                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          icon={Wallet}
          label="Contract value"
          value={fmtMoneyShort(p.contractValue, p.contractCurrency)}
          sub={fmtMoney(p.contractValue, p.contractCurrency)}
        />
        <StatTile
          icon={Ruler}
          label="Land area"
          value={fmtArea(p.landArea, p.landAreaUnit)}
          sub={
            parcels.length
              ? `${parcels.length} land parcel${parcels.length > 1 ? "s" : ""}`
              : null
          }
        />
        <StatTile
          icon={Building2}
          label="Built-up area"
          value={fmtArea(p.builtUpArea, p.landAreaUnit)}
          sub={
            !isEmpty(p.numBuildings)
              ? `${p.numBuildings} building${p.numBuildings > 1 ? "s" : ""}${
                  !isEmpty(p.numFloorsMax)
                    ? ` · up to ${p.numFloorsMax} floors`
                    : ""
                }`
              : null
          }
        />
        <StatTile
          icon={Home}
          label="Units"
          value={fmtNumber(p.numUnits)}
          sub={duration ? `${duration} project duration` : null}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main layout                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        {/* ------------------------------ Left ------------------------------ */}
        <div className="min-w-0 space-y-8 lg:col-span-2">
          <Section
            title="About this project"
            icon={FileText}
            description="Description and scope of work"
          >
            <div className="space-y-4 p-5 sm:p-6">
              {p.description ? (
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {p.description}
                </p>
              ) : (
                <p className="text-sm text-slate-400">No description added.</p>
              )}

              {p.scopeSummary && (
                <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-4 dark:border-primary-500/20 dark:bg-primary-500/5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                    Scope summary
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                    {p.scopeSummary}
                  </p>
                </div>
              )}
            </div>
          </Section>

          <Section
            title="Contract details"
            icon={ScrollText}
            description="References and commercial terms"
          >
            <FieldGrid>
              <Field icon={Hash} label="Contract ref" value={p.contractRef} />
              <Field
                icon={Hash}
                label="Work order ref"
                value={p.workOrderRef}
              />
              <Field icon={Hash} label="Tender ref" value={p.tenderRef} />
              <Field
                icon={ScrollText}
                label="Contract type"
                value={p.contractType}
              />
              <Field
                icon={Wallet}
                label="Contract value"
                value={fmtMoney(p.contractValue, p.contractCurrency)}
              />
              <Field icon={Clock} label="Timezone" value={p.timezone} />
            </FieldGrid>
          </Section>

          <Section
            title="Location"
            icon={MapPin}
            description="Where the project is being built"
            action={
              hasGeo && (
                <a
                  href={`https://www.google.com/maps?q=${p.geoLatitude},${p.geoLongitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  View on map
                  <ExternalLink size={14} />
                </a>
              )
            }
          >
            <div className="p-5 sm:p-6">
              <p className="text-sm font-medium leading-relaxed text-slate-900 dark:text-slate-100">
                {address || "Address not set"}
              </p>

              {hasGeo && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Pill>Lat {p.geoLatitude}</Pill>
                  <Pill>Lng {p.geoLongitude}</Pill>
                </div>
              )}
            </div>
          </Section>

          <Section
            title="Land parcels"
            icon={Ruler}
            description="Survey and possession details"
            action={<Pill>{parcels.length}</Pill>}
          >
            {parcels.length ? (
              <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                {parcels.map((lp) => (
                  <div
                    key={lp.id}
                    className="rounded-xl border border-slate-200 p-4 transition hover:border-primary-300 hover:shadow-sm dark:border-slate-800 dark:hover:border-primary-500/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Survey {lp.surveyNo || "—"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Plot {lp.plotNo || "—"}
                        </p>
                      </div>
                      <Pill tone="primary">
                        {fmtArea(lp.area, lp.areaUnit) || "—"}
                      </Pill>
                    </div>

                    <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <CalendarDays size={13} />
                      Possession: {fmtDate(lp.possessionDate) || "Not set"}
                    </p>

                    {lp.boundaryDescription && (
                      <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        {lp.boundaryDescription}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Ruler}
                title="No land parcels"
                text="Land parcels added to this project will appear here."
              />
            )}
          </Section>

          <div className="grid gap-8 md:grid-cols-2">
            <Section
              title="Documents"
              icon={FolderOpen}
              action={<Pill>{documents.length}</Pill>}
            >
              {documents.length ? (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {documents.map((d, i) => (
                    <li
                      key={d.id || i}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-900 dark:text-slate-100"
                    >
                      <FileText size={16} className="text-slate-400" />
                      <span className="truncate">
                        {d.name || d.title || d.fileName || "Document"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={FolderOpen}
                  title="No documents"
                  text="Uploaded project documents will show up here."
                />
              )}
            </Section>

            <Section
              title="Approvals"
              icon={ShieldCheck}
              action={<Pill>{approvals.length}</Pill>}
            >
              {approvals.length ? (
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {approvals.map((a, i) => (
                    <li
                      key={a.id || i}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-900 dark:text-slate-100"
                    >
                      <ShieldCheck size={16} className="text-slate-400" />
                      <span className="truncate">
                        {a.name || a.title || a.approvalType || "Approval"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={ShieldCheck}
                  title="No approvals"
                  text="Statutory approvals will be listed here."
                />
              )}
            </Section>
          </div>
        </div>

        {/* ------------------------------ Right ----------------------------- */}
        <div className="min-w-0 space-y-8 lg:sticky lg:top-20">
          <Section
            title="Timeline"
            icon={CalendarDays}
            description="Key project dates"
            action={duration && <Pill tone="primary">{duration}</Pill>}
          >
            <Timeline items={timeline} />
          </Section>

          <Section
            title="Client"
            icon={User}
            description="Who the project is for"
          >
            <div className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <Landmark size={20} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {p.clientName || "Client not set"}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {p.clientContactName || "No contact person"}
                  </p>
                </div>
              </div>

              {(p.clientContactPhone || p.clientContactEmail) && (
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  {p.clientContactPhone && (
                    <a
                      href={`tel:${p.clientContactPhone.replace(/\s/g, "")}`}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Phone size={15} className="text-slate-400" />
                      {p.clientContactPhone}
                    </a>
                  )}
                  {p.clientContactEmail && (
                    <a
                      href={`mailto:${p.clientContactEmail}`}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Mail size={15} className="text-slate-400" />
                      <span className="truncate">{p.clientContactEmail}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </Section>

          {(!isEmpty(p.linearLengthKm) || !isEmpty(p.carriagewayWidthM)) && (
            <Section title="Infrastructure" icon={Ruler}>
              <FieldGrid>
                {!isEmpty(p.linearLengthKm) && (
                  <Field
                    icon={Ruler}
                    label="Linear length"
                    value={`${p.linearLengthKm} km`}
                  />
                )}
                {!isEmpty(p.carriagewayWidthM) && (
                  <Field
                    icon={Ruler}
                    label="Carriageway width"
                    value={`${p.carriagewayWidthM} m`}
                  />
                )}
              </FieldGrid>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
