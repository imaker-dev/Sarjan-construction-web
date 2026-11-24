import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FieldArray, FormikProvider, getIn, useFormik } from "formik";
import * as Yup from "yup";

import {
  IconBriefcase,
  IconCalendar,
  IconFileText,
  IconMap2,
  IconMapPin,
  IconReportMoney,
  IconRuler2,
  IconShieldCheck,
  IconUser,
} from "@tabler/icons-react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import FormSection from "@components/ui/FormSection";
import ModalAction from "@components/ui/ModalAction";

import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import { TextareaField } from "@components/fields/TextareaField";

import {
  createProject,
  updateProject,
  getProjectDetails,
} from "@store/slices/project.slice";
import { ROUTES } from "@constants/routes";
import LocationPicker from "@components/fields/LocationPicker";
import { handleResponse } from "@utils/async.utils";
import { useQueryParams } from "@hooks/useQueryParams";
import Loader from "@components/ui/Loader";

/* -------------------------------------------------------------------------- */
/*  Options                                                                   */
/* -------------------------------------------------------------------------- */

const ACRONYMS = new Set(["RERA", "MEP", "HVAC", "EPC", "NOC", "SQM", "SQFT"]);
const labelOf = (v) =>
  v
    .split("_")
    .map((w) => (ACRONYMS.has(w) ? w : w.charAt(0) + w.slice(1).toLowerCase()))
    .join(" ");
const toOptions = (values) =>
  values.map((v) => ({ label: labelOf(v), value: v }));

const PROJECT_TYPES = toOptions([
  "RESIDENTIAL",
  "COMMERCIAL",
  "INDUSTRIAL",
  "INFRASTRUCTURE",
  "OTHER",
]);
const CONTRACT_TYPES = toOptions([
  "LUMPSUM",
  "ITEM_RATE",
  "EPC",
  "DESIGN_BUILD",
  "COST_PLUS",
  "LABOUR_ONLY",
  "OTHER",
]);
const AREA_UNITS = toOptions([
  "SQM",
  "SQFT",
  "ACRE",
  "HECTARE",
  "BIGHA",
  "KATHA",
]);
const APPROVAL_TYPES = toOptions([
  "RERA",
  "ENVIRONMENT_CLEARANCE",
  "FIRE_NOC",
  "LAND_CONVERSION",
  "HEIGHT_CLEARANCE",
  "HERITAGE",
  "LOCAL_BODY",
  "RAILWAY_NOC",
  "HIGHWAY_NOC",
  "FOREST_CLEARANCE",
  "OTHER",
]);
const APPROVAL_STATUSES = toOptions([
  "APPLIED",
  "UNDER_REVIEW",
  "GRANTED",
  "REJECTED",
  "EXPIRED",
  "REVOKED",
]);
const BUDGET_CATEGORIES = toOptions([
  "MATERIAL",
  "LABOUR",
  "EQUIPMENT",
  "SUBCONTRACT",
  "OVERHEAD",
  "CONTINGENCY",
  "OTHER",
]);
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"].map((c) => ({
  label: c,
  value: c,
}));

const TIMEZONE_OPTIONS = [
  { label: "India Standard Time (UTC+05:30)", value: "Asia/Kolkata" },
  { label: "Dubai (UTC+04:00)", value: "Asia/Dubai" },
  { label: "Singapore (UTC+08:00)", value: "Asia/Singapore" },
  { label: "London", value: "Europe/London" },
  { label: "Central European Time", value: "Europe/Berlin" },
  { label: "Eastern Time (US)", value: "America/New_York" },
  { label: "Central Time (US)", value: "America/Chicago" },
  { label: "Pacific Time (US)", value: "America/Los_Angeles" },
  { label: "Australia Eastern Time", value: "Australia/Sydney" },
  { label: "Japan Standard Time (UTC+09:00)", value: "Asia/Tokyo" },
];

const MAX_ROWS = 50;

/* -------------------------------------------------------------------------- */
/*  Page sections (drives the layout, the side navigation and error badges)    */
/* -------------------------------------------------------------------------- */

const SECTIONS = [
  {
    id: "details",
    label: "Project details",
    fields: [
      "name",
      "code",
      "projectType",
      "projectSubtype",
      "contractType",
      "description",
    ],
  },
  {
    id: "client",
    label: "Client",
    fields: [
      "clientName",
      "clientContactName",
      "clientContactPhone",
      "clientContactEmail",
    ],
  },
  {
    id: "contract",
    label: "Contract",
    fields: [
      "contractRef",
      "workOrderRef",
      "tenderRef",
      "contractValue",
      "contractCurrency",
      "contractDate",
      "workOrderDate",
    ],
  },
  {
    id: "location",
    label: "Location",
    fields: [
      "locationAddressLine",
      "locationLocality",
      "locationCity",
      "locationDistrict",
      "locationState",
      "locationPin",
      "locationCountry",
      "timezone",
      "geoLatitude",
      "geoLongitude",
    ],
  },
  {
    id: "scope",
    label: "Scope",
    fields: [
      "scopeSummary",
      "landArea",
      "landAreaUnit",
      "builtUpArea",
      "numBuildings",
      "numFloorsMax",
      "numUnits",
      "linearLengthKm",
      "carriagewayWidthM",
    ],
  },
  {
    id: "timeline",
    label: "Timeline",
    fields: [
      "startDate",
      "endDate",
      "ntpDate",
      "revisedEndDate",
      "actualStartDate",
      "actualEndDate",
    ],
  },
  { id: "parcels", label: "Land parcels", fields: ["landParcels"] },
  { id: "approvals", label: "Approvals", fields: ["approvals"] },
  { id: "budget", label: "Initial budget", fields: ["initialBudget"] },
];

/* -------------------------------------------------------------------------- */
/*  Validation                                                                */
/* -------------------------------------------------------------------------- */

const emptyToNull = (value, original) => (original === "" ? null : value);
const optionalNumber = () =>
  Yup.number()
    .transform(emptyToNull)
    .nullable()
    .typeError("Enter a valid number");
const nonNegative = () => optionalNumber().min(0, "Cannot be negative");
const twoDecimals = (schema) =>
  schema.test(
    "two-decimals",
    "Use at most 2 decimal places",
    (v) => v == null || Math.abs(v * 100 - Math.round(v * 100)) < 1e-6,
  );
const optionalInt = () => nonNegative().integer("Enter a whole number");
const optionalText = (max, label) =>
  Yup.string().trim().max(max, `${label} cannot exceed ${max} characters`);

const budgetStarted = (b) =>
  !!(b?.code || b?.name || b?.notes || b?.lines?.length);

const validationSchema = Yup.object({
  // Identity
  code: optionalText(40, "Project code").required("Project code is required"),
  name: optionalText(200, "Project name").required("Project name is required"),
  description: optionalText(1000, "Description").nullable(),
  timezone: Yup.string()
    .oneOf(
      TIMEZONE_OPTIONS.map((t) => t.value),
      "Please select a valid timezone",
    )
    .required("Timezone is required"),

  // Classification
  projectType: Yup.string()
    .oneOf(PROJECT_TYPES.map((t) => t.value))
    .required("Project type is required"),
  projectSubtype: optionalText(100, "Subtype"),
  contractType: Yup.string().oneOf(["", ...CONTRACT_TYPES.map((t) => t.value)]),

  // Client
  clientName: optionalText(150, "Client name").required(
    "Client name is required",
  ),
  clientContactName: optionalText(100, "Contact name"),
  clientContactPhone: Yup.string()
    .trim()
    .max(30, "Phone number is too long")
    .matches(/^[+()\d\s-]*$/, {
      excludeEmptyString: true,
      message: "Enter a valid phone number",
    }),
  clientContactEmail: Yup.string().trim().email("Enter a valid email address"),

  // Contract
  contractRef: optionalText(100, "Contract reference").nullable(),
  workOrderRef: optionalText(100, "Work order reference"),
  tenderRef: optionalText(100, "Tender reference"),
  contractValue: twoDecimals(nonNegative()),
  contractDate: Yup.string(),
  workOrderDate: Yup.string(),

  // Location
  locationAddressLine: optionalText(200, "Address"),
  locationLocality: optionalText(100, "Locality"),
  locationCity: Yup.string().trim().required("City is required"),
  locationDistrict: Yup.string().trim().required("District is required"),
  locationState: Yup.string().trim().required("State is required"),
  locationPin: Yup.string()
    .trim()
    .required("PIN code is required")
    .max(20, "PIN code cannot exceed 20 characters"),
  locationCountry: optionalText(100, "Country"),
  geoLatitude: optionalNumber()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .test("pair", "Latitude and longitude go together", function (v) {
      const { geoLongitude } = this.parent;
      return (v == null) === (geoLongitude == null || geoLongitude === "");
    }),
  geoLongitude: optionalNumber()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .test("pair", "Latitude and longitude go together", function (v) {
      const { geoLatitude } = this.parent;
      return (v == null) === (geoLatitude == null || geoLatitude === "");
    }),

  // Scope
  scopeSummary: optionalText(1000, "Scope summary"),
  landArea: twoDecimals(nonNegative()),
  builtUpArea: twoDecimals(nonNegative()),
  numBuildings: optionalInt(),
  numFloorsMax: optionalInt(),
  numUnits: optionalInt(),
  linearLengthKm: nonNegative(),
  carriagewayWidthM: nonNegative(),

  // Programme
  startDate: Yup.string().required("Start date is required"),
  endDate: Yup.string()
    .required("End date is required")
    .test(
      "end-date-after-start",
      "End date cannot be earlier than start date",
      function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        return value >= startDate;
      },
    ),

  // Registers
  landParcels: Yup.array()
    .of(
      Yup.object({
        surveyNo: Yup.string()
          .trim()
          .test(
            "survey-or-plot",
            "Enter a survey or plot number",
            function (v) {
              return !!v || !!this.parent.plotNo?.trim();
            },
          ),
        area: twoDecimals(nonNegative()),
      }),
    )
    .max(MAX_ROWS, `You can add up to ${MAX_ROWS} land parcels`),

  approvals: Yup.array()
    .of(
      Yup.object({
        approvalType: Yup.string().required("Select an approval type"),
        customType: Yup.string()
          .trim()
          .test("custom-type", "Describe the approval type", function (v) {
            return this.parent.approvalType !== "OTHER" || !!v;
          }),
        status: Yup.string().required("Select a status"),
      }),
    )
    .max(MAX_ROWS, `You can add up to ${MAX_ROWS} approvals`),

  initialBudget: Yup.object({
    code: optionalText(40, "Budget code").test(
      "budget-code",
      "Budget code is required",
      function (v) {
        return !budgetStarted(this.parent) || !!v;
      },
    ),
    name: optionalText(200, "Budget name").test(
      "budget-name",
      "Budget name is required",
      function (v) {
        return !budgetStarted(this.parent) || !!v;
      },
    ),
    notes: optionalText(500, "Notes"),
    lines: Yup.array()
      .of(
        Yup.object({
          category: Yup.string().required("Select a category"),
          amount: twoDecimals(
            optionalNumber()
              .min(0.01, "Enter an amount")
              .required("Enter an amount"),
          ),
        }),
      )
      .test("one-line", "Add at least one budget line", function (v) {
        const { code, name, notes } = this.parent;
        return !(code || name || notes) || (v?.length ?? 0) > 0;
      }),
  }),
});

const INITIAL_VALUES = {
  code: "",
  name: "",
  description: "",
  projectType: "RESIDENTIAL",
  projectSubtype: "",
  contractType: "",

  clientName: "",
  clientContactName: "",
  clientContactPhone: "",
  clientContactEmail: "",

  contractRef: "",
  workOrderRef: "",
  tenderRef: "",
  contractValue: "",
  contractCurrency: "INR",
  contractDate: "",
  workOrderDate: "",

  locationAddressLine: "",
  locationLocality: "",
  locationCity: "",
  locationDistrict: "",
  locationState: "",
  locationPin: "",
  locationCountry: "India",
  geoLatitude: "",
  geoLongitude: "",
  timezone: "Asia/Kolkata",

  scopeSummary: "",
  landArea: "",
  landAreaUnit: "SQM",
  builtUpArea: "",
  numBuildings: "",
  numFloorsMax: "",
  numUnits: "",
  linearLengthKm: "",
  carriagewayWidthM: "",

  startDate: "",
  endDate: "",
  ntpDate: "",
  revisedEndDate: "",
  actualStartDate: "",
  actualEndDate: "",

  landParcels: [],
  approvals: [],
  initialBudget: { code: "", name: "", currency: "INR", notes: "", lines: [] },
};

const NEW_PARCEL = {
  surveyNo: "",
  plotNo: "",
  area: "",
  areaUnit: "SQM",
  boundaryDescription: "",
  possessionDate: "",
};
const NEW_APPROVAL = {
  approvalType: "",
  customType: "",
  issuingAuthority: "",
  jurisdiction: "",
  referenceNo: "",
  status: "APPLIED",
  appliedDate: "",
};
const NEW_LINE = { category: "", description: "", amount: "" };

/* -------------------------------------------------------------------------- */
/*  Payload: empty values are dropped, pairs are sent together                 */
/* -------------------------------------------------------------------------- */

const blank = (v) => v === "" || v === null || v === undefined;
const text = (v) => (blank(v) ? undefined : String(v).trim() || undefined);
const decimal = (v) => (blank(v) ? undefined : Number(v).toFixed(2));
const integer = (v) => (blank(v) ? undefined : Number(v));
const round6 = (n) => Number(Number(n).toFixed(6));
const clean = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

const buildParcel = (p) =>
  clean({
    id: p.id, // undefined for new rows, dropped by clean()
    surveyNo: text(p.surveyNo),
    plotNo: text(p.plotNo),
    area: decimal(p.area),
    areaUnit: blank(p.area) ? undefined : p.areaUnit,
    boundaryDescription: text(p.boundaryDescription),
    possessionDate: text(p.possessionDate),
  });

const buildApproval = (a) =>
  clean({
    id: a.id,
    approvalType: a.approvalType,
    customType: a.approvalType === "OTHER" ? text(a.customType) : undefined,
    issuingAuthority: text(a.issuingAuthority),
    jurisdiction: text(a.jurisdiction),
    referenceNo: text(a.referenceNo),
    status: a.status,
    appliedDate: text(a.appliedDate),
  });

function buildPayload(v) {
  const isInfra = v.projectType === "INFRASTRUCTURE";
  const showBuilding = !isInfra;
  const showLinear = isInfra || v.projectType === "OTHER";
  const hasGeo = !blank(v.geoLatitude) && !blank(v.geoLongitude);

  const landParcels = v.landParcels.map(buildParcel);
  const approvals = v.approvals.map(buildApproval);

  const b = v.initialBudget;
  const initialBudget = budgetStarted(b)
    ? clean({
        code: text(b.code),
        name: text(b.name),
        currency: b.currency,
        notes: text(b.notes),
        lines: b.lines.map((l) =>
          clean({
            category: l.category,
            description: text(l.description),
            amount: decimal(l.amount),
          }),
        ),
      })
    : undefined;

  return clean({
    code: text(v.code),
    name: text(v.name),
    description: text(v.description),
    projectType: v.projectType,
    projectSubtype: text(v.projectSubtype),
    contractType: text(v.contractType),

    clientName: text(v.clientName),
    clientContactName: text(v.clientContactName),
    clientContactPhone: text(v.clientContactPhone),
    clientContactEmail: text(v.clientContactEmail),

    contractRef: text(v.contractRef),
    workOrderRef: text(v.workOrderRef),
    tenderRef: text(v.tenderRef),
    contractValue: decimal(v.contractValue),
    contractCurrency: blank(v.contractValue) ? undefined : v.contractCurrency,
    contractDate: text(v.contractDate),
    workOrderDate: text(v.workOrderDate),

    locationAddressLine: text(v.locationAddressLine),
    locationLocality: text(v.locationLocality),
    locationCity: text(v.locationCity),
    locationDistrict: text(v.locationDistrict),
    locationState: text(v.locationState),
    locationPin: text(v.locationPin),
    locationCountry: text(v.locationCountry),
    geoLatitude: hasGeo ? round6(v.geoLatitude) : undefined,
    geoLongitude: hasGeo ? round6(v.geoLongitude) : undefined,

    scopeSummary: text(v.scopeSummary),
    landArea: decimal(v.landArea),
    landAreaUnit: blank(v.landArea) ? undefined : v.landAreaUnit,
    builtUpArea: decimal(v.builtUpArea),
    numBuildings: showBuilding ? integer(v.numBuildings) : undefined,
    numFloorsMax: showBuilding ? integer(v.numFloorsMax) : undefined,
    numUnits: showBuilding ? integer(v.numUnits) : undefined,
    linearLengthKm: showLinear ? decimal(v.linearLengthKm) : undefined,
    carriagewayWidthM: showLinear ? decimal(v.carriagewayWidthM) : undefined,

    startDate: text(v.startDate),
    endDate: text(v.endDate),
    ntpDate: text(v.ntpDate),
    revisedEndDate: text(v.revisedEndDate),
    actualStartDate: text(v.actualStartDate),
    actualEndDate: text(v.actualEndDate),

    timezone: text(v.timezone),

    landParcels: landParcels.length ? landParcels : undefined,
    approvals: approvals.length ? approvals : undefined,
    initialBudget,
  });
}

/* -------------------------------------------------------------------------- */
/*  Edit mode: API -> form values, and diff-based update payload               */
/* -------------------------------------------------------------------------- */

const toDateInput = (iso) => (iso ? String(iso).slice(0, 10) : "");
const toStr = (v) => (v === null || v === undefined ? "" : String(v));

function mapProjectToForm(p) {
  return {
    ...INITIAL_VALUES,
    code: toStr(p.code),
    name: toStr(p.name),
    description: toStr(p.description),
    projectType: p.projectType ?? "RESIDENTIAL",
    projectSubtype: toStr(p.projectSubtype),
    contractType: toStr(p.contractType),

    clientName: toStr(p.clientName),
    clientContactName: toStr(p.clientContactName),
    clientContactPhone: toStr(p.clientContactPhone),
    clientContactEmail: toStr(p.clientContactEmail),

    contractRef: toStr(p.contractRef),
    workOrderRef: toStr(p.workOrderRef),
    tenderRef: toStr(p.tenderRef),
    contractValue: toStr(p.contractValue),
    contractCurrency: p.contractCurrency ?? "INR",
    contractDate: toDateInput(p.contractDate),
    workOrderDate: toDateInput(p.workOrderDate),

    locationAddressLine: toStr(p.locationAddressLine),
    locationLocality: toStr(p.locationLocality),
    locationCity: toStr(p.locationCity),
    locationDistrict: toStr(p.locationDistrict),
    locationState: toStr(p.locationState),
    locationPin: toStr(p.locationPin),
    locationCountry: toStr(p.locationCountry),
    geoLatitude: toStr(p.geoLatitude),
    geoLongitude: toStr(p.geoLongitude),
    timezone: p.timezone ?? "Asia/Kolkata",

    scopeSummary: toStr(p.scopeSummary),
    landArea: toStr(p.landArea),
    landAreaUnit: p.landAreaUnit ?? "SQM",
    builtUpArea: toStr(p.builtUpArea),
    numBuildings: toStr(p.numBuildings),
    numFloorsMax: toStr(p.numFloorsMax),
    numUnits: toStr(p.numUnits),
    linearLengthKm: toStr(p.linearLengthKm),
    carriagewayWidthM: toStr(p.carriagewayWidthM),

    startDate: toDateInput(p.startDate),
    endDate: toDateInput(p.endDate),
    ntpDate: toDateInput(p.ntpDate),
    revisedEndDate: toDateInput(p.revisedEndDate),
    actualStartDate: toDateInput(p.actualStartDate),
    actualEndDate: toDateInput(p.actualEndDate),

    landParcels: (p.landParcels ?? []).map((l) => ({
      id: l.id,
      surveyNo: toStr(l.surveyNo),
      plotNo: toStr(l.plotNo),
      area: toStr(l.area),
      areaUnit: l.areaUnit ?? "SQM",
      boundaryDescription: toStr(l.boundaryDescription),
      possessionDate: toDateInput(l.possessionDate),
    })),

    approvals: (p.approvals ?? []).map((a) => ({
      id: a.id,
      approvalType: toStr(a.approvalType),
      customType: toStr(a.customType),
      issuingAuthority: toStr(a.issuingAuthority),
      jurisdiction: toStr(a.jurisdiction),
      referenceNo: toStr(a.referenceNo),
      status: a.status ?? "APPLIED",
      appliedDate: toDateInput(a.appliedDate),
    })),

    // The project response has no budget, so it isn't edited here.
    initialBudget: INITIAL_VALUES.initialBudget,
  };
}

const NESTED = ["landParcels", "approvals", "initialBudget"];
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function buildUpdatePayload(values, initialValues, version) {
  const next = buildPayload(values);
  const prev = buildPayload(initialValues);
  const changes = { version };

  new Set([...Object.keys(prev), ...Object.keys(next)]).forEach((key) => {
    if (NESTED.includes(key)) return;
    if (!same(prev[key], next[key])) changes[key] = next[key] ?? null; // null = cleared
  });

  if (!same(prev.landParcels, next.landParcels))
    changes.landParcels = next.landParcels ?? [];
  if (!same(prev.approvals, next.approvals))
    changes.approvals = next.approvals ?? [];

  return changes;
}

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                              */
/* -------------------------------------------------------------------------- */

const formatMoney = (amount, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-IN")}`;
  }
};

const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const formatDate = (iso) =>
  iso ? DATE_FMT.format(new Date(`${iso}T00:00:00`)) : "—";

/** Highlights the section currently in view. */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

const scrollToSection = (id) =>
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });

function SideNav({ sections, active, errorIds }) {
  return (
    <nav aria-label="Form sections" className="space-y-0.5">
      <p className="mb-2 px-3 text-xs font-medium text-slate-400 dark:text-slate-500">
        On this page
      </p>
      {sections.map((s) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollToSection(s.id)}
            aria-current={isActive ? "true" : undefined}
            className={`group relative flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600 ${
              isActive
                ? "bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-white"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
            }`}
          >
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute -left-px top-2 bottom-2 w-0.5 rounded-full bg-primary-600 dark:bg-primary-400"
              />
            )}
            {s.label}
            {errorIds.has(s.id) && (
              <span
                className="h-1.5 w-1.5 rounded-full bg-rose-500"
                title="This section needs attention"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

function Repeater({ title, onRemove, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {title}
        </p>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${title}`}
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
        >
          <Trash2 size={15} />
        </button>
      </div>
      {children}
    </div>
  );
}

function EmptyRegister({ message, actionLabel, onAdd }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
      <button type="button" onClick={onAdd} className="btn btn-outline">
        <Plus size={16} />
        {actionLabel}
      </button>
    </div>
  );
}

function AddRow({ label, onAdd, disabled }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-primary-400 dark:hover:text-primary-300"
    >
      <Plus size={16} />
      {label}
    </button>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2.5 text-sm">
      <dt className="shrink-0 text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-right font-medium text-slate-800 dark:text-slate-100">
        {value}
      </dd>
    </div>
  );
}

// scroll-mt-20 keeps the section title clear of a sticky header when jumping.
const Section = ({ id, children }) => (
  <div id={id} className="scroll-mt-20">
    {children}
  </div>
);

const GRID = "grid grid-cols-1 gap-5 md:grid-cols-2";
const PAIR = "grid grid-cols-[minmax(0,1fr)_7.5rem] gap-3";

/* -------------------------------------------------------------------------- */
/*  Form (create + edit)                                                      */
/* -------------------------------------------------------------------------- */

const ProjectForm = ({ project }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isEditMode = Boolean(project);

  const { isCreatingProject, isUpdatingProject } = useSelector(
    (state) => state.project,
  );
  const isSaving = isCreatingProject || isUpdatingProject;

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const initialValues = useMemo(
    () => (project ? mapProjectToForm(project) : INITIAL_VALUES),
    [project],
  );

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: (_, { setSubmitting }) => {
      setSubmitting(false);
      setIsConfirmationOpen(true);
    },
  });
  const { values, errors, setFieldValue } = formik;

  const fieldProps = (name) => ({
    name,
    value: getIn(values, name) ?? "",
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: getIn(formik.touched, name) && getIn(errors, name),
  });

  const handleLocationSelect = useCallback(
    ({ latitude, longitude }) => {
      setFieldValue("geoLatitude", round6(latitude), false);
      setFieldValue("geoLongitude", round6(longitude), true);
    },
    [setFieldValue],
  );

  /* ---- scope fields depend on the project type ----------------------------- */
  const showBuilding = values.projectType !== "INFRASTRUCTURE";
  const showLinear = ["INFRASTRUCTURE", "OTHER"].includes(values.projectType);

  // Clear values of fields that just got hidden, so stale input can't block submit.
  useEffect(() => {
    if (!showBuilding)
      ["numBuildings", "numFloorsMax", "numUnits"].forEach((f) =>
        setFieldValue(f, "", false),
      );
    if (!showLinear)
      ["linearLengthKm", "carriagewayWidthM"].forEach((f) =>
        setFieldValue(f, "", false),
      );
  }, [showBuilding, showLinear, setFieldValue]);

  /* ---- navigation + error badges ------------------------------------------- */
  // Budget is only part of the create flow.
  const sections = useMemo(
    () => (isEditMode ? SECTIONS.filter((s) => s.id !== "budget") : SECTIONS),
    [isEditMode],
  );
  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

  const activeSection = useActiveSection(sectionIds);
  const errorIds = useMemo(
    () =>
      formik.submitCount > 0
        ? new Set(
            sections
              .filter((s) => s.fields.some((f) => getIn(errors, f)))
              .map((s) => s.id),
          )
        : new Set(),
    [errors, formik.submitCount, sections],
  );

  // After a failed submit, jump to the first section that needs attention.
  useEffect(() => {
    if (formik.isSubmitting || formik.submitCount === 0 || formik.isValid)
      return;
    const first = sections.find((s) => s.fields.some((f) => getIn(errors, f)));
    if (first) scrollToSection(first.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.isSubmitting]);

  /* ---- budget total --------------------------------------------------------- */
  const budgetTotal = useMemo(
    () =>
      values.initialBudget.lines.reduce(
        (sum, l) => sum + (Number(l.amount) || 0),
        0,
      ),
    [values.initialBudget.lines],
  );

  /* ---- submit --------------------------------------------------------------- */
  const handleConfirm = async () => {
    const action = isEditMode
      ? updateProject({
          projectId: project.id,
          data: buildUpdatePayload(values, initialValues, project.version),
        })
      : createProject(buildPayload(values));

    await handleResponse(dispatch(action), () => {
      setIsConfirmationOpen(false);
      navigate(ROUTES.PROJECTS.ROOT);
    });
  };

  const handleCloseConfirmation = () => {
    if (isSaving) return;
    setIsConfirmationOpen(false);
  };

  const geoLat = blank(values.geoLatitude) ? null : Number(values.geoLatitude);
  const geoLng = blank(values.geoLongitude)
    ? null
    : Number(values.geoLongitude);

  return (
    <FormikProvider value={formik}>
      <div className="space-y-5">
        <PageHeaderBanner
          title={isEditMode ? "Edit Project" : "Create Project"}
        />

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_210px]">
          <form
            onSubmit={formik.handleSubmit}
            noValidate
            className="min-w-0 space-y-5"
          >
            {/* Project Details */}
            <Section id="details">
              <FormSection
                title="Project Details"
                description="Name, classification and a short description of the project."
                icon={IconBriefcase}
              >
                <div className={GRID}>
                  <InputField
                    label="Project Name"
                    placeholder="Enter project name"
                    required
                    {...fieldProps("name")}
                  />
                  <InputField
                    label="Project Code"
                    placeholder="e.g. PRJ-001"
                    required
                    uppercase
                    disabled={isEditMode}
                    {...fieldProps("code")}
                  />
                  <SelectField
                    label="Project Type"
                    required
                    options={PROJECT_TYPES}
                    placeholder="Select project type"
                    {...fieldProps("projectType")}
                  />
                  <InputField
                    label="Project Subtype"
                    placeholder="e.g. High-rise apartments"
                    {...fieldProps("projectSubtype")}
                  />
                  <SelectField
                    label="Contract Type"
                    options={CONTRACT_TYPES}
                    placeholder="Select contract type"
                    {...fieldProps("contractType")}
                  />
                  <div className="md:col-span-2">
                    <TextareaField
                      label="Project Description"
                      placeholder="Enter project description..."
                      rows={3}
                      maxLength={1000}
                      {...fieldProps("description")}
                    />
                  </div>
                </div>
              </FormSection>
            </Section>

            {/* Client */}
            <Section id="client">
              <FormSection
                title="Client Information"
                description="Who the project is for and who to contact."
                icon={IconUser}
              >
                <div className={GRID}>
                  <InputField
                    label="Client Name"
                    placeholder="Enter client name"
                    required
                    {...fieldProps("clientName")}
                  />
                  <InputField
                    label="Contact Person"
                    placeholder="Enter contact name"
                    {...fieldProps("clientContactName")}
                  />
                  <InputField
                    label="Contact Phone"
                    type="tel"
                    placeholder="+91-90000-00000"
                    {...fieldProps("clientContactPhone")}
                  />
                  <InputField
                    label="Contact Email"
                    type="email"
                    placeholder="client@example.com"
                    {...fieldProps("clientContactEmail")}
                  />
                </div>
              </FormSection>
            </Section>

            {/* Contract */}
            <Section id="contract">
              <FormSection
                title="Contract & Commercials"
                description="Contract references, value and key dates."
                icon={IconFileText}
              >
                <div className={GRID}>
                  <InputField
                    label="Contract Reference"
                    placeholder="Enter contract reference"
                    {...fieldProps("contractRef")}
                  />
                  <InputField
                    label="Work Order Reference"
                    placeholder="Enter work order reference"
                    {...fieldProps("workOrderRef")}
                  />
                  <InputField
                    label="Tender Reference"
                    placeholder="Enter tender reference"
                    {...fieldProps("tenderRef")}
                  />
                  <div className={PAIR}>
                    <InputField
                      label="Contract Value"
                      type="number"
                      placeholder="0.00"
                      {...fieldProps("contractValue")}
                    />
                    <SelectField
                      label="Currency"
                      options={CURRENCIES}
                      {...fieldProps("contractCurrency")}
                    />
                  </div>
                  <InputField
                    label="Contract Date"
                    type="date"
                    {...fieldProps("contractDate")}
                  />
                  <InputField
                    label="Work Order Date"
                    type="date"
                    {...fieldProps("workOrderDate")}
                  />
                </div>
              </FormSection>
            </Section>

            {/* Location */}
            <Section id="location">
              <FormSection
                title="Project Location"
                description="Address, timezone and the exact spot on the map."
                icon={IconMapPin}
              >
                <div className={GRID}>
                  <div className="md:col-span-2">
                    <InputField
                      label="Address"
                      placeholder="Plot / building, street"
                      {...fieldProps("locationAddressLine")}
                    />
                  </div>
                  <InputField
                    label="Locality"
                    placeholder="Enter locality"
                    {...fieldProps("locationLocality")}
                  />
                  <InputField
                    label="City"
                    placeholder="Enter city"
                    required
                    {...fieldProps("locationCity")}
                  />
                  <InputField
                    label="District"
                    placeholder="Enter district"
                    required
                    {...fieldProps("locationDistrict")}
                  />
                  <InputField
                    label="State"
                    placeholder="Enter state"
                    required
                    {...fieldProps("locationState")}
                  />
                  <InputField
                    label="PIN Code"
                    placeholder="Enter PIN code"
                    required
                    {...fieldProps("locationPin")}
                  />
                  <InputField
                    label="Country"
                    placeholder="Enter country"
                    {...fieldProps("locationCountry")}
                  />
                  <SelectField
                    label="Timezone"
                    required
                    options={TIMEZONE_OPTIONS}
                    placeholder="Select timezone"
                    {...fieldProps("timezone")}
                  />

                  <div className="space-y-4 md:col-span-2">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        Pin the exact location
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Pick a point on the map, or type the coordinates below.
                      </p>
                    </div>

                    <LocationPicker
                      latitude={geoLat}
                      longitude={geoLng}
                      onLocationSelect={handleLocationSelect}
                    />

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <InputField
                        label="Latitude"
                        type="number"
                        placeholder="e.g. 25.5612"
                        {...fieldProps("geoLatitude")}
                      />
                      <InputField
                        label="Longitude"
                        type="number"
                        placeholder="e.g. 84.8690"
                        {...fieldProps("geoLongitude")}
                      />
                    </div>
                  </div>
                </div>
              </FormSection>
            </Section>

            {/* Scope */}
            <Section id="scope">
              <FormSection
                title="Project Scope"
                description="Size and scale. Fields adapt to the project type."
                icon={IconRuler2}
              >
                <div className={GRID}>
                  <div className="md:col-span-2">
                    <TextareaField
                      label="Scope Summary"
                      placeholder="e.g. 2 towers + clubhouse"
                      rows={3}
                      maxLength={1000}
                      {...fieldProps("scopeSummary")}
                    />
                  </div>
                  <div className={PAIR}>
                    <InputField
                      label="Land Area"
                      type="number"
                      placeholder="0.00"
                      {...fieldProps("landArea")}
                    />
                    <SelectField
                      label="Unit"
                      options={AREA_UNITS}
                      {...fieldProps("landAreaUnit")}
                    />
                  </div>
                  <InputField
                    label="Built-up Area"
                    type="number"
                    placeholder="0.00"
                    {...fieldProps("builtUpArea")}
                  />
                  {showBuilding && (
                    <>
                      <InputField
                        label="Number of Buildings"
                        type="number"
                        placeholder="0"
                        {...fieldProps("numBuildings")}
                      />
                      <InputField
                        label="Maximum Floors"
                        type="number"
                        placeholder="0"
                        {...fieldProps("numFloorsMax")}
                      />
                      <InputField
                        label="Number of Units"
                        type="number"
                        placeholder="0"
                        {...fieldProps("numUnits")}
                      />
                    </>
                  )}
                  {showLinear && (
                    <>
                      <InputField
                        label="Linear Length (km)"
                        type="number"
                        placeholder="0.00"
                        {...fieldProps("linearLengthKm")}
                      />
                      <InputField
                        label="Carriageway Width (m)"
                        type="number"
                        placeholder="0.00"
                        {...fieldProps("carriagewayWidthM")}
                      />
                    </>
                  )}
                </div>
              </FormSection>
            </Section>

            {/* Timeline */}
            <Section id="timeline">
              <FormSection
                title="Project Timeline"
                description="Planned schedule, plus revised and actual dates once they are known."
                icon={IconCalendar}
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <InputField
                    label="Start Date"
                    type="date"
                    required
                    {...fieldProps("startDate")}
                  />
                  <InputField
                    label="End Date"
                    type="date"
                    required
                    {...fieldProps("endDate")}
                  />
                  <InputField
                    label="NTP Date"
                    type="date"
                    {...fieldProps("ntpDate")}
                  />
                  <InputField
                    label="Revised End Date"
                    type="date"
                    {...fieldProps("revisedEndDate")}
                  />
                  <InputField
                    label="Actual Start Date"
                    type="date"
                    {...fieldProps("actualStartDate")}
                  />
                  <InputField
                    label="Actual End Date"
                    type="date"
                    {...fieldProps("actualEndDate")}
                  />
                </div>
              </FormSection>
            </Section>

            {/* Land parcels */}
            <Section id="parcels">
              <FormSection
                title="Land Parcels"
                description={`Survey and plot details for the project land. Up to ${MAX_ROWS}.`}
                icon={IconMap2}
              >
                <FieldArray name="landParcels">
                  {({ push, remove }) => (
                    <div className="space-y-4">
                      {values.landParcels.length === 0 ? (
                        <EmptyRegister
                          message="No land parcels added yet."
                          actionLabel="Add land parcel"
                          onAdd={() => push({ ...NEW_PARCEL })}
                        />
                      ) : (
                        <>
                          {values.landParcels.map((p, i) => (
                            <Repeater
                              key={p.id ?? i}
                              title={`Parcel ${i + 1}`}
                              onRemove={() => remove(i)}
                            >
                              <div className={GRID}>
                                <InputField
                                  label="Survey No."
                                  placeholder="e.g. KH-112/45"
                                  {...fieldProps(`landParcels.${i}.surveyNo`)}
                                />
                                <InputField
                                  label="Plot No."
                                  placeholder="e.g. 42"
                                  {...fieldProps(`landParcels.${i}.plotNo`)}
                                />
                                <div className={PAIR}>
                                  <InputField
                                    label="Area"
                                    type="number"
                                    placeholder="0.00"
                                    {...fieldProps(`landParcels.${i}.area`)}
                                  />
                                  <SelectField
                                    label="Unit"
                                    options={AREA_UNITS}
                                    {...fieldProps(`landParcels.${i}.areaUnit`)}
                                  />
                                </div>
                                <InputField
                                  label="Possession Date"
                                  type="date"
                                  {...fieldProps(
                                    `landParcels.${i}.possessionDate`,
                                  )}
                                />
                                <div className="md:col-span-2">
                                  <InputField
                                    label="Boundary Description"
                                    placeholder="e.g. NH-30 north, canal east"
                                    {...fieldProps(
                                      `landParcels.${i}.boundaryDescription`,
                                    )}
                                  />
                                </div>
                              </div>
                            </Repeater>
                          ))}
                          <AddRow
                            label="Add another parcel"
                            disabled={values.landParcels.length >= MAX_ROWS}
                            onAdd={() => push({ ...NEW_PARCEL })}
                          />
                        </>
                      )}
                    </div>
                  )}
                </FieldArray>
              </FormSection>
            </Section>

            {/* Approvals */}
            <Section id="approvals">
              <FormSection
                title="Statutory Approvals"
                description={`Permits and clearances for this project. Up to ${MAX_ROWS}.`}
                icon={IconShieldCheck}
              >
                <FieldArray name="approvals">
                  {({ push, remove }) => (
                    <div className="space-y-4">
                      {values.approvals.length === 0 ? (
                        <EmptyRegister
                          message="No approvals added yet."
                          actionLabel="Add approval"
                          onAdd={() => push({ ...NEW_APPROVAL })}
                        />
                      ) : (
                        <>
                          {values.approvals.map((a, i) => (
                            <Repeater
                              key={a.id ?? i}
                              title={`Approval ${i + 1}`}
                              onRemove={() => remove(i)}
                            >
                              <div className={GRID}>
                                <SelectField
                                  label="Approval Type"
                                  required
                                  options={APPROVAL_TYPES}
                                  placeholder="Select approval type"
                                  {...fieldProps(`approvals.${i}.approvalType`)}
                                />
                                <SelectField
                                  label="Status"
                                  required
                                  options={APPROVAL_STATUSES}
                                  {...fieldProps(`approvals.${i}.status`)}
                                />
                                {a.approvalType === "OTHER" && (
                                  <div className="md:col-span-2">
                                    <InputField
                                      label="Custom Type"
                                      required
                                      placeholder="Describe the approval"
                                      {...fieldProps(
                                        `approvals.${i}.customType`,
                                      )}
                                    />
                                  </div>
                                )}
                                <InputField
                                  label="Issuing Authority"
                                  placeholder="e.g. Bihar RERA"
                                  {...fieldProps(
                                    `approvals.${i}.issuingAuthority`,
                                  )}
                                />
                                <InputField
                                  label="Jurisdiction"
                                  placeholder="e.g. Patna"
                                  {...fieldProps(`approvals.${i}.jurisdiction`)}
                                />
                                <InputField
                                  label="Reference No."
                                  placeholder="Enter reference number"
                                  {...fieldProps(`approvals.${i}.referenceNo`)}
                                />
                                <InputField
                                  label="Applied Date"
                                  type="date"
                                  {...fieldProps(`approvals.${i}.appliedDate`)}
                                />
                              </div>
                            </Repeater>
                          ))}
                          <AddRow
                            label="Add another approval"
                            disabled={values.approvals.length >= MAX_ROWS}
                            onAdd={() => push({ ...NEW_APPROVAL })}
                          />
                        </>
                      )}
                    </div>
                  )}
                </FieldArray>
              </FormSection>
            </Section>

            {/* Initial budget (create only) */}
            {!isEditMode && (
              <Section id="budget">
                <FormSection
                  title="Initial Budget"
                  description="Optional. Add the sanctioned estimate now, or set it up later."
                  icon={IconReportMoney}
                >
                  <div className="space-y-5">
                    <div className={GRID}>
                      <InputField
                        label="Budget Code"
                        placeholder="e.g. BASE"
                        uppercase
                        {...fieldProps("initialBudget.code")}
                      />
                      <InputField
                        label="Budget Name"
                        placeholder="e.g. Sanctioned Estimate"
                        {...fieldProps("initialBudget.name")}
                      />
                      <SelectField
                        label="Currency"
                        options={CURRENCIES}
                        {...fieldProps("initialBudget.currency")}
                      />
                      <InputField
                        label="Notes"
                        placeholder="e.g. Per tender TN-55/2026"
                        {...fieldProps("initialBudget.notes")}
                      />
                    </div>

                    <FieldArray name="initialBudget.lines">
                      {({ push, remove }) => (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            Budget lines
                          </p>

                          {values.initialBudget.lines.length === 0 ? (
                            <EmptyRegister
                              message="No budget lines added yet."
                              actionLabel="Add budget line"
                              onAdd={() => push({ ...NEW_LINE })}
                            />
                          ) : (
                            <>
                              {values.initialBudget.lines.map((_, i) => (
                                <Repeater
                                  key={i}
                                  title={`Line ${i + 1}`}
                                  onRemove={() => remove(i)}
                                >
                                  <div className="grid grid-cols-1 gap-5 md:grid-cols-[12rem_minmax(0,1fr)_11rem]">
                                    <SelectField
                                      label="Category"
                                      required
                                      options={BUDGET_CATEGORIES}
                                      placeholder="Select category"
                                      {...fieldProps(
                                        `initialBudget.lines.${i}.category`,
                                      )}
                                    />
                                    <InputField
                                      label="Description"
                                      placeholder="e.g. Civil materials"
                                      {...fieldProps(
                                        `initialBudget.lines.${i}.description`,
                                      )}
                                    />
                                    <InputField
                                      label="Amount"
                                      type="number"
                                      required
                                      placeholder="0.00"
                                      {...fieldProps(
                                        `initialBudget.lines.${i}.amount`,
                                      )}
                                    />
                                  </div>
                                </Repeater>
                              ))}

                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <AddRow
                                  label="Add another line"
                                  disabled={false}
                                  onAdd={() => push({ ...NEW_LINE })}
                                />
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  Total{" "}
                                  <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                                    {formatMoney(
                                      budgetTotal,
                                      values.initialBudget.currency,
                                    )}
                                  </span>
                                </p>
                              </div>
                            </>
                          )}

                          {typeof errors.initialBudget?.lines === "string" &&
                            formik.submitCount > 0 && (
                              <p className="text-xs text-rose-600 dark:text-rose-400">
                                {errors.initialBudget.lines}
                              </p>
                            )}
                        </div>
                      )}
                    </FieldArray>
                  </div>
                </FormSection>
              </Section>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate(ROUTES.PROJECTS.ROOT)}
                disabled={isSaving}
                className="btn btn-outline"
              >
                <ArrowLeft size={17} strokeWidth={1.8} />
                Cancel
              </button>

              <div className="flex items-center gap-3">
                {errorIds.size > 0 && (
                  <p
                    role="alert"
                    className="hidden items-center gap-1.5 text-xs font-medium text-rose-600 sm:flex dark:text-rose-400"
                  >
                    <AlertCircle size={14} />
                    {errorIds.size === 1
                      ? "1 section needs attention"
                      : `${errorIds.size} sections need attention`}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary"
                >
                  {isSaving ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      {isEditMode ? "Saving..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Check size={18} strokeWidth={2} />
                      {isEditMode ? "Review & Save" : "Review & Create"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          <aside className="sticky top-16 hidden lg:block">
            <SideNav
              sections={sections}
              active={activeSection}
              errorIds={errorIds}
            />
          </aside>
        </div>

        {/* Confirmation Modal */}
        <ModalAction
          id="create-project-confirmation"
          isOpen={isConfirmationOpen}
          onClose={handleCloseConfirmation}
          onSubmit={handleConfirm}
          title={isEditMode ? "Save Changes?" : "Create Project?"}
          desc={
            isEditMode
              ? "Review the key details before saving your changes."
              : "Review the key details before creating this project."
          }
          icon={IconBriefcase}
          theme="primary"
          submitText={isEditMode ? "Confirm & Save" : "Confirm & Create"}
          loadingText={isEditMode ? "Saving..." : "Creating..."}
          cancelText="Go Back"
          loading={isSaving}
          closeOnBackdrop={!isSaving}
          closeOnEscape={!isSaving}
          showCancel
        >
          <dl className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-slate-50 dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800/50">
            <SummaryRow
              label="Project"
              value={values.name || "Untitled Project"}
            />
            <SummaryRow label="Code" value={values.code || "—"} />
            <SummaryRow label="Client" value={values.clientName || "—"} />
            <SummaryRow
              label="Type"
              value={
                labelOf(values.projectType) +
                (values.contractType
                  ? ` · ${labelOf(values.contractType)}`
                  : "")
              }
            />
            <SummaryRow
              label="Location"
              value={
                [values.locationCity, values.locationState]
                  .filter(Boolean)
                  .join(", ") || "—"
              }
            />
            <SummaryRow
              label="Timeline"
              value={`${formatDate(values.startDate)} → ${formatDate(values.endDate)}`}
            />
            {!blank(values.contractValue) && (
              <SummaryRow
                label="Contract value"
                value={formatMoney(
                  Number(values.contractValue),
                  values.contractCurrency,
                )}
              />
            )}
            {(values.landParcels.length > 0 ||
              values.approvals.length > 0 ||
              values.initialBudget.lines.length > 0) && (
              <SummaryRow
                label="Includes"
                value={[
                  values.landParcels.length &&
                    `${values.landParcels.length} land parcel${values.landParcels.length > 1 ? "s" : ""}`,
                  values.approvals.length &&
                    `${values.approvals.length} approval${values.approvals.length > 1 ? "s" : ""}`,
                  values.initialBudget.lines.length &&
                    `Budget ${formatMoney(budgetTotal, values.initialBudget.currency)}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
            )}
          </dl>

          <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {isEditMode
              ? "This will update the existing project."
              : "This will create a new project in your organization."}
          </p>
        </ModalAction>
      </div>
    </FormikProvider>
  );
};

/* -------------------------------------------------------------------------- */
/*  Page (loads the project in edit mode, then mounts the form)                */
/* -------------------------------------------------------------------------- */

const CreateProjectPage = () => {
  const dispatch = useDispatch();
  const { get } = useQueryParams();
  const projectId = get("projectId");
  const { isGettingProjectDetails, projectData } = useSelector(
    (state) => state.project,
  );

  useEffect(() => {
    if (projectId) dispatch(getProjectDetails(projectId));
  }, [dispatch, projectId]);

  // Create mode
  if (!projectId) return <ProjectForm />;

  // Edit mode: ignore stale data from a previously opened project
  const loaded = projectData?.id === projectId ? projectData : null;
  if (isGettingProjectDetails || !loaded)
    return <Loader title="" description="" />;

  return <ProjectForm key={loaded.id} project={loaded} />;
};

export default CreateProjectPage;
