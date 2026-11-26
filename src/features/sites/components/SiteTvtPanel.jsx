import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IconShieldCheck, IconPlus, IconUsers } from "@tabler/icons-react";
import DataTable from "@components/ui/DataTable";
import ModalBasic from "@components/ui/ModalBasic";
import RefreshButton from "@components/ui/RefreshButton";
import StatusBadge from "@components/ui/StatusBadge";
import { InputField } from "@components/fields/InputField";
import { TextareaField } from "@components/fields/TextareaField";
import {
  getTvtSessions,
  getTvtSession,
  createTvtSession,
  addTvtAttendees,
} from "@store/slices/attendance.slice";
import { fetchSiteTeam } from "@store/slices/site.slice";
import { extractList } from "@utils/api.utils";
import { formatDate } from "@utils/date.utils";

export default function SiteTvtPanel({ siteId, canRecord = false }) {
  const dispatch = useDispatch();
  const {
    tvtSessions,
    tvtSession,
    isFetchingTvt,
    isFetchingTvtSession,
    isCreatingTvt,
  } = useSelector((state) => state.attendance);
  const { siteTeam } = useSelector((state) => state.site);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTvtId, setSelectedTvtId] = useState(null);

  const loadTvt = () => {
    if (siteId) dispatch(getTvtSessions({ siteId }));
  };

  useEffect(() => {
    loadTvt();
  }, [siteId]);

  const formik = useFormik({
    initialValues: { topic: "", notes: "" },
    validationSchema: Yup.object({
      topic: Yup.string().trim().required("Briefing topic is required"),
      notes: Yup.string().nullable(),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await dispatch(
          createTvtSession({
            siteId,
            topic: values.topic.trim(),
            ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
          })
        ).unwrap();
        resetForm();
        setIsCreateOpen(false);
        loadTvt();
      } catch {
        // handled in slice
      }
    },
  });

  useEffect(() => {
    if (!selectedTvtId) return;
    dispatch(getTvtSession(selectedTvtId));
    if (canRecord && siteId && siteTeam.length === 0) {
      dispatch(fetchSiteTeam({ siteId, params: { status: "ACTIVE" } }));
    }
  }, [dispatch, selectedTvtId, canRecord, siteId, siteTeam.length]);

  const attendeesFormik = useFormik({
    initialValues: { employeeIds: [] },
    validationSchema: Yup.object({
      employeeIds: Yup.array().of(Yup.string()).min(1, "Select at least one worker"),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (!selectedTvtId) return;
      try {
        await dispatch(
          addTvtAttendees({ id: selectedTvtId, employeeIds: values.employeeIds })
        ).unwrap();
        resetForm();
        dispatch(getTvtSession(selectedTvtId));
        loadTvt();
      } catch {
        // handled in slice
      }
    },
  });

  const existingAttendeeIds = useMemo(
    () =>
      new Set(
        (tvtSession?.attendees || []).map((a) => a.employeeId || a.employee?.id)
      ),
    [tvtSession]
  );

  const availableWorkers = useMemo(
    () => siteTeam.filter((w) => !existingAttendeeIds.has(w.id)),
    [siteTeam, existingAttendeeIds]
  );

  const actions = useMemo(
    () => [
      {
        label: "View / Attendees",
        icon: IconUsers,
        onClick: (t) => setSelectedTvtId(t.id),
      },
    ],
    []
  );

  const columns = useMemo(
    () => [
      {
        key: "topic",
        header: "Briefing Topic",
        render: (t) => <span className="font-semibold text-xs">{t.topic || "Safety Briefing"}</span>,
      },
      {
        key: "businessDate",
        header: "Date",
        render: (t) => <span className="text-xs">{formatDate(t.businessDate || t.createdAt)}</span>,
      },
      {
        key: "attendeeCount",
        header: "Attendees",
        render: (t) => (
          <span className="text-xs font-mono tabular-nums">
            {t._count?.attendees ?? t.attendees?.length ?? 0}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {canRecord && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="btn btn-primary btn-sm h-9 inline-flex items-center gap-1.5"
          >
            <IconPlus size={15} />
            <span>Start TVT Briefing</span>
          </button>
        )}
        <RefreshButton
          onClick={loadTvt}
          loading={isFetchingTvt}
          className="h-9 w-9 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700/60"
        />
      </div>

      <DataTable
        columns={columns}
        data={extractList(tvtSessions)}
        actions={actions}
        loading={isFetchingTvt}
        empty={{
          icon: IconShieldCheck,
          title: "No TVT Briefings",
          description: "No Safety Toolbox Talk sessions recorded for this site yet.",
        }}
      />

      <ModalBasic
        isOpen={Boolean(selectedTvtId)}
        onClose={() => {
          setSelectedTvtId(null);
          attendeesFormik.resetForm();
        }}
        title={tvtSession?.topic || "TVT Briefing Details"}
        description={
          tvtSession?.businessDate
            ? `Date: ${formatDate(tvtSession.businessDate)}`
            : undefined
        }
        size="lg"
      >
        <div className="space-y-4 p-6">
          {isFetchingTvtSession ? (
            <p className="text-xs text-slate-400 text-center py-6">Loading briefing...</p>
          ) : (
            <>
              {tvtSession?.notes && (
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 rounded-lg p-3">
                  {tvtSession.notes}
                </p>
              )}

              <div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Attendees ({tvtSession?.attendees?.length ?? 0})
                </h4>
                {(tvtSession?.attendees || []).length === 0 ? (
                  <p className="text-xs text-slate-400">No attendees recorded yet.</p>
                ) : (
                  <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60 rounded-lg border border-slate-200 dark:border-slate-700/60">
                    {(tvtSession?.attendees || []).map((att, idx) => (
                      <div
                        key={att.id || att.employeeId || idx}
                        className="flex items-center justify-between px-3 py-2 text-xs"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-100">
                          {att.employee?.displayName || att.displayName || att.employeeId}
                        </span>
                        <StatusBadge
                          label={att.employee?.employeeCode || "PRESENT"}
                          tone="emerald"
                          size="xs"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {canRecord && availableWorkers.length > 0 && (
                <form
                  onSubmit={attendeesFormik.handleSubmit}
                  className="space-y-3 border-t border-border pt-4"
                >
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Add Late Arrivals
                  </h4>
                  <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60 rounded-lg border border-slate-200 dark:border-slate-700/60">
                    {availableWorkers.map((w) => {
                      const checked = attendeesFormik.values.employeeIds.includes(w.id);
                      return (
                        <label
                          key={w.id}
                          className="flex items-center justify-between px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        >
                          <span className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const next = checked
                                  ? attendeesFormik.values.employeeIds.filter((id) => id !== w.id)
                                  : [...attendeesFormik.values.employeeIds, w.id];
                                attendeesFormik.setFieldValue("employeeIds", next);
                              }}
                            />
                            <span className="font-medium text-slate-800 dark:text-slate-100">
                              {w.displayName}
                            </span>
                          </span>
                          <span className="font-mono text-slate-400">{w.employeeCode}</span>
                        </label>
                      );
                    })}
                  </div>
                  {attendeesFormik.touched.employeeIds && attendeesFormik.errors.employeeIds && (
                    <p className="text-xs text-rose-500">{attendeesFormik.errors.employeeIds}</p>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={attendeesFormik.values.employeeIds.length === 0}
                      className="btn btn-primary btn-xs"
                    >
                      Add Selected ({attendeesFormik.values.employeeIds.length})
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </ModalBasic>

      <ModalBasic
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Start Safety Toolbox Talk (TVT)"
        size="sm"
      >
        <form onSubmit={formik.handleSubmit} className="space-y-4 p-6">
          <InputField
            id="tvtTopic"
            name="topic"
            label="Briefing Topic"
            required
            placeholder="e.g. Heights & PPE Safety"
            value={formik.values.topic}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.topic && formik.errors.topic}
          />
          <TextareaField
            id="tvtNotes"
            name="notes"
            label="Notes (Optional)"
            value={formik.values.notes}
            onChange={formik.handleChange}
          />
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isCreatingTvt}>
              {isCreatingTvt ? "Starting..." : "Start TVT"}
            </button>
          </div>
        </form>
      </ModalBasic>
    </div>
  );
}
