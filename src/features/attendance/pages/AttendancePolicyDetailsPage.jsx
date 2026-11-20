import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import StatCard from "@components/ui/StatCard";
import { useQueryParams } from "@hooks/useQueryParams";
import { getAttendancePolicy } from "@store/slices/attendance.slice";
import { formatDate } from "@utils/date.utils";
import {
  Check,
  Clock,
  Coffee,
  Hourglass,
  ShieldCheck,
  Timer,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

/* ----------------------------- helpers ----------------------------- */

const formatMins = (mins) => {
  if (mins === null || mins === undefined) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  return h ? `${h}h` : `${m}m`;
};

const formatTime = (hour, minute) => {
  if (hour === null || hour === undefined) return "—";
  const h12 = hour % 12 || 12;
  const period = hour >= 12 ? "PM" : "AM";
  return `${String(h12).padStart(2, "0")}:${String(minute ?? 0).padStart(2, "0")} ${period}`;
};

const formatEnum = (value) =>
  value
    ? value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ")
    : "—";

/* ------------------------- small UI pieces ------------------------- */

const Section = ({ icon: Icon, title, children }) => (
  <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
    <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
      <Icon size={18} className="text-primary-600 dark:text-primary-400" />
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
    </div>
    <dl className="divide-y divide-gray-100 px-5 dark:divide-gray-800">
      {children}
    </dl>
  </section>
);

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 py-3">
    <dt className="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="text-right text-sm font-medium text-gray-900 dark:text-gray-100">
      {value}
    </dd>
  </div>
);

const FlagRow = ({ label, enabled }) => (
  <div className="flex items-center justify-between gap-4 py-3">
    <dt className="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
    <dd
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        enabled
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
      }`}
    >
      {enabled ? <Check size={12} /> : <X size={12} />}
      {enabled ? "Enabled" : "Disabled"}
    </dd>
  </div>
);

const PolicySkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-28 rounded-xl bg-gray-100 dark:bg-gray-800" />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800" />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-64 rounded-xl bg-gray-100 dark:bg-gray-800" />
      ))}
    </div>
  </div>
);

/* ------------------------------- page ------------------------------ */

const AttendancePolicyDetailsPage = () => {
  const { get } = useQueryParams();
  const dispatch = useDispatch();
  const policyId = get("policyId");

  const { isFetchingPolicy, attendancePolicy: policy } = useSelector(
    (state) => state.attendance,
  );

  useEffect(() => {
    if (policyId) dispatch(getAttendancePolicy(policyId));
  }, [dispatch, policyId]);

  const isFixedBreak = policy?.breakMode === "FIXED";
  const slabCount = Array.isArray(policy?.pMultiplierSlabs)
    ? policy.pMultiplierSlabs.length
    : 0;

  return (
    <div className="space-y-6">
      <PageHeaderBanner title={"Policy Details"} />

      <div>
        {isFetchingPolicy || (!policy && policyId) ? (
          <PolicySkeleton />
        ) : !policy ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            No policy selected. Choose a policy from the list to view its
            details.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-start sm:justify-between dark:border-gray-800 dark:bg-gray-900">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {policy.name}
                </h1>
                {policy.description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {policy.description}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-400">
                  {formatEnum(policy.scope)} scope
                </span>
                {/* <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  Version {policy.version}
                </span> */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    policy.status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      policy.status === "ACTIVE"
                        ? "bg-emerald-500"
                        : "bg-gray-400"
                    }`}
                  />
                  {formatEnum(policy.status)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={Clock}
                label="Day starts at"
                value={formatTime(policy.dayStartHour, policy.dayStartMinute)}
                color="blue"
              />
              <StatCard
                icon={Timer}
                label="Shift duration"
                value={formatMins(policy.shiftDurationMins)}
                color="cyan"
              />
              <StatCard
                icon={Hourglass}
                label="Half day after"
                value={formatMins(policy.halfDayThresholdMins)}
                color="amber"
              />
              <StatCard
                icon={Hourglass}
                label="Full day after"
                value={formatMins(policy.fullDayThresholdMins)}
                color="emerald"
              />
            </div>

            {/* Rules */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Section icon={Coffee} title="Break rules">
                <DetailRow
                  label="Break mode"
                  value={formatEnum(policy.breakMode)}
                />
                {isFixedBreak ? (
                  <DetailRow
                    label="Fixed break"
                    value={formatMins(policy.fixedBreakMins)}
                  />
                ) : (
                  <DetailRow
                    label="Max dynamic break"
                    value={formatMins(policy.maxDynamicBreakMins)}
                  />
                )}
                <DetailRow
                  label="Break applies after"
                  value={formatMins(policy.minWorkForBreakMins)}
                />
              </Section>

              <Section icon={Zap} title="Overtime">
                <DetailRow
                  label="Overtime mode"
                  value={formatEnum(policy.overtimeMode)}
                />
                <DetailRow
                  label="Minimum overtime"
                  value={formatMins(policy.minOvertimeMins)}
                />
                <DetailRow
                  label="Overtime slab"
                  value={formatMins(policy.otSlabMins)}
                />
                <DetailRow
                  label="Multiplier slabs"
                  value={
                    slabCount ? `${slabCount} configured` : "Not configured"
                  }
                />
              </Section>

              <Section icon={ShieldCheck} title="Punch & access">
                <FlagRow
                  label="Strict geofence"
                  enabled={policy.geofenceStrict}
                />
                <FlagRow
                  label="Mobile punch"
                  enabled={policy.allowMobilePunch}
                />
                <FlagRow label="Kiosk punch" enabled={policy.allowKioskPunch} />
                <FlagRow
                  label="Biometric punch"
                  enabled={policy.allowBiometric}
                />
                <FlagRow
                  label="TVT gate required"
                  enabled={policy.requireTvtGate}
                />
                {policy.requireTvtGate && (
                  <DetailRow
                    label="TVT gate action"
                    value={formatEnum(policy.tvtGateAction)}
                  />
                )}
              </Section>
            </div>

            {/* Meta */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Created {formatDate(policy.createdAt, "longTime")} · Last updated{" "}
              {formatDate(policy.updatedAt, "longTime")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePolicyDetailsPage;
