import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IconArrowLeft, IconPlus, IconTrash, IconCalendarCheck, IconPencil } from "@tabler/icons-react";
import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import StatusBadge from "@components/ui/StatusBadge";
import DataTable from "@components/ui/DataTable";
import ModalBasic from "@components/ui/ModalBasic";
import { InputField } from "@components/fields/InputField";
import { TextareaField } from "@components/fields/TextareaField";
import { SelectField } from "@components/fields/SelectField";
import {
  getScheduleById,
  updateSchedule,
  listScheduleRevisions,
  listScheduleOverrides,
  addScheduleOverride,
  cancelScheduleOverride,
  cancelScheduleRevision,
  classifyScheduleDate,
} from "@store/slices/schedule.slice";
import { useQueryParams } from "@hooks/useQueryParams";
import { useAccess } from "@hooks/useAccess";
import { formatDate, getTodayIsoDate } from "@utils/date.utils";
import { formatText } from "@utils/text.utils";
import { PERMISSIONS } from "@constants/permissions";
import { ROUTES } from "@constants/routes";

const formatMins = (mins) =>
  `${Math.floor((mins ?? 0) / 60)}:${String((mins ?? 0) % 60).padStart(2, "0")}`;

const OVERRIDE_TYPE_OPTIONS = [
  { label: "Holiday", value: "HOLIDAY" },
  { label: "Weekly Off", value: "WEEKLY_OFF" },
  { label: "Working Day", value: "WORKING" },
];

export default function ScheduleDetailsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { get } = useQueryParams();
  const scheduleId = get("scheduleId");
  const { can } = useAccess();
  const canManage = can({ permissions: [PERMISSIONS.WORK_SCHEDULE.MANAGE] });

  const { currentSchedule, revisions, overrides, classificationResult, isMutatingSchedule } = useSelector(
    (state) => state.schedule
  );

  const [tab, setTab] = useState("revisions");
  const [overrideDate, setOverrideDate] = useState("");
  const [overrideType, setOverrideType] = useState("HOLIDAY");
  const [overrideReason, setOverrideReason] = useState("");
  const [classifyDate, setClassifyDate] = useState(getTodayIsoDate());
  const [isEditOpen, setIsEditOpen] = useState(false);

  const editFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: currentSchedule?.name || "",
      description: currentSchedule?.description || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().min(2, "Name is required").required("Name is required"),
      description: Yup.string().nullable(),
    }),
    onSubmit: async (values) => {
      try {
        await dispatch(
          updateSchedule({
            id: scheduleId,
            values: {
              name: values.name.trim(),
              description: values.description?.trim() || null,
              expectedVersion: currentSchedule?.version ?? 0,
            },
          })
        ).unwrap();
        setIsEditOpen(false);
        loadAll();
      } catch {
        // handled in slice
      }
    },
  });

  const loadAll = useCallback(() => {
    if (!scheduleId) return;
    dispatch(getScheduleById(scheduleId));
    dispatch(listScheduleRevisions(scheduleId));
    dispatch(listScheduleOverrides(scheduleId));
  }, [dispatch, scheduleId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const revisionsColumns = useMemo(
    () => [
      {
        key: "revision",
        header: "Revision",
        render: (r) => <span className="font-mono font-semibold text-xs">v{r.revision}</span>,
      },
      {
        key: "effectiveFrom",
        header: "Effective From",
        render: (r) => <span className="text-xs">{formatDate(r.effectiveFrom)}</span>,
      },
      {
        key: "intraday",
        header: "Shift Timings",
        render: (r) =>
          r.intraday ? (
            <span className="text-xs font-mono">
              {formatMins(r.intraday.scheduledStartMins)}–{formatMins(r.intraday.scheduledEndMins)} •{" "}
              {r.intraday.breakWindowMode} • {r.intraday.autoClockOutMode}
            </span>
          ) : (
            <span className="text-xs text-slate-400">Weekly pattern only</span>
          ),
      },
      {
        key: "status",
        header: "Status",
        render: (r) => (
          <StatusBadge
            label={r.status || "ACTIVE"}
            tone={r.status === "CANCELLED" ? "rose" : "emerald"}
            size="xs"
          />
        ),
      },
    ],
    []
  );

  const revisionsActions = useMemo(
    () =>
      canManage
        ? [
            {
              label: "Cancel Revision",
              icon: IconTrash,
              hidden: (r) => r.status === "CANCELLED",
              onClick: async (r) => {
                try {
                  await dispatch(
                    cancelScheduleRevision({ id: scheduleId, revisionId: r.id })
                  ).unwrap();
                  loadAll();
                } catch {
                  // handled in slice
                }
              },
            },
          ]
        : [],
    [canManage, dispatch, scheduleId, loadAll]
  );

  const overridesColumns = useMemo(
    () => [
      {
        key: "date",
        header: "Date",
        render: (o) => <span className="font-mono text-xs">{formatDate(o.date)}</span>,
      },
      {
        key: "dayType",
        header: "Type",
        render: (o) => <StatusBadge label={o.dayType} tone="amber" size="xs" />,
      },
      {
        key: "reason",
        header: "Reason",
        render: (o) => <span className="text-xs">{o.reason || "—"}</span>,
      },
      {
        key: "status",
        header: "Status",
        render: (o) => (
          <StatusBadge
            label={o.status || "ACTIVE"}
            tone={o.status === "CANCELLED" ? "rose" : "emerald"}
            size="xs"
          />
        ),
      },
    ],
    []
  );

  const overridesActions = useMemo(
    () =>
      canManage
        ? [
            {
              label: "Cancel Override",
              icon: IconTrash,
              hidden: (o) => o.status === "CANCELLED",
              onClick: async (o) => {
                try {
                  await dispatch(
                    cancelScheduleOverride({ id: scheduleId, overrideId: o.id })
                  ).unwrap();
                  loadAll();
                } catch {
                  // handled in slice
                }
              },
            },
          ]
        : [],
    [canManage, dispatch, scheduleId, loadAll]
  );

  if (!scheduleId) {
    return (
      <div className="space-y-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">No schedule selected.</p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.SCHEDULES.ROOT)}
          className="btn btn-outline btn-sm"
        >
          Back to Work Schedules
        </button>
      </div>
    );
  }

  const handleAddOverride = async (e) => {
    e.preventDefault();
    if (!overrideDate) return;
    try {
      await dispatch(
        addScheduleOverride({
          id: scheduleId,
          values: {
            date: overrideDate,
            dayType: overrideType,
            ...(overrideReason.trim() ? { reason: overrideReason.trim() } : {}),
          },
        })
      ).unwrap();
      setOverrideDate("");
      setOverrideReason("");
      loadAll();
    } catch {
      // handled in slice
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <button
        type="button"
        onClick={() => navigate(ROUTES.SCHEDULES.ROOT)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft size={16} />
        <span>Back to Work Schedules</span>
      </button>

      <PageHeaderBanner
        title={currentSchedule?.name || "Schedule Details"}
        description={`Scope: ${currentSchedule?.scopeType || "—"} • Status: ${currentSchedule?.status || "—"}`}
        action={
          canManage && currentSchedule
            ? {
                label: "Edit Schedule",
                icon: IconPencil,
                onClick: () => setIsEditOpen(true),
              }
            : undefined
        }
      />

      {/* Check Date Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] p-3">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <IconCalendarCheck size={16} />
          Check Date:
        </span>
        <div className="w-40">
          <InputField
            id="classifyDate"
            name="classifyDate"
            type="date"
            value={classifyDate}
            onChange={(e) => setClassifyDate(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={() => dispatch(classifyScheduleDate({ id: scheduleId, date: classifyDate }))}
          className="btn btn-outline btn-sm h-10"
        >
          Check
        </button>
        {(() => {
          const dayType =
            classificationResult?.dayType ||
            classificationResult?.day ||
            classificationResult?.classification ||
            classificationResult?.status;
          const dayReason =
            classificationResult?.reason ||
            classificationResult?.source ||
            classificationResult?.note;
          if (!dayType) return null;
          return (
            <StatusBadge
              label={dayReason ? `${formatText(dayType)} — ${dayReason}` : formatText(dayType)}
              tone={dayType === "WORKING" ? "emerald" : "amber"}
              size="sm"
            />
          );
        })()}
      </div>

      {/* Tabs */}
      <div
        className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/60"
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "revisions"}
          onClick={() => setTab("revisions")}
          className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
            tab === "revisions"
              ? "bg-white text-slate-800 shadow-sm dark:bg-[#1C2536] dark:text-white"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Shift Versions ({revisions.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "overrides"}
          onClick={() => setTab("overrides")}
          className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
            tab === "overrides"
              ? "bg-white text-slate-800 shadow-sm dark:bg-[#1C2536] dark:text-white"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Holidays & Exceptions ({overrides.length})
        </button>
      </div>

      {tab === "revisions" && (
        <DataTable
          columns={revisionsColumns}
          data={revisions}
          actions={revisionsActions}
        />
      )}

      {tab === "overrides" && (
        <div className="space-y-4">
          {canManage && (
            <form
              onSubmit={handleAddOverride}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] p-3"
            >
              <div className="w-40">
                <InputField
                  id="overrideDate"
                  name="overrideDate"
                  type="date"
                  value={overrideDate}
                  onChange={(e) => setOverrideDate(e.target.value)}
                  required
                />
              </div>
              <div className="w-36">
                <SelectField
                  id="overrideType"
                  name="overrideType"
                  options={OVERRIDE_TYPE_OPTIONS}
                  value={overrideType}
                  onChange={(e) => setOverrideType(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <InputField
                  id="overrideReason"
                  name="overrideReason"
                  placeholder="Reason (e.g. Republic Day)"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm h-10 inline-flex items-center gap-1.5">
                <IconPlus size={15} />
                <span>Add Exception</span>
              </button>
            </form>
          )}

          <DataTable
            columns={overridesColumns}
            data={overrides}
            actions={overridesActions}
          />
        </div>
      )}

      <ModalBasic
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Work Schedule"
        description="Update schedule name or description (version-locked)."
        size="md"
      >
        <form onSubmit={editFormik.handleSubmit} className="space-y-4 p-6">
          <InputField
            id="editScheduleName"
            name="name"
            label="Schedule Name"
            required
            value={editFormik.values.name}
            onChange={editFormik.handleChange}
            onBlur={editFormik.handleBlur}
            error={editFormik.touched.name && editFormik.errors.name}
          />
          <TextareaField
            id="editScheduleDesc"
            name="description"
            label="Description (Optional)"
            value={editFormik.values.description}
            onChange={editFormik.handleChange}
          />
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={() => setIsEditOpen(false)} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isMutatingSchedule}>
              {isMutatingSchedule ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </ModalBasic>
    </div>
  );
}
