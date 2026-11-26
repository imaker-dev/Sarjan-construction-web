import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { IconLogin, IconLogout, IconCloudUpload } from "@tabler/icons-react";
import StatusBadge from "@components/ui/StatusBadge";
import RefreshButton from "@components/ui/RefreshButton";
import ModalBasic from "@components/ui/ModalBasic";
import { InputField } from "@components/fields/InputField";
import { SelectField } from "@components/fields/SelectField";
import { fetchSiteTeam } from "@store/slices/site.slice";
import {
  batchPunchIn,
  batchPunchOut,
  syncAttendance,
} from "@store/slices/attendance.slice";

const DIRECTION_OPTIONS = [
  { label: "Punch In", value: "IN" },
  { label: "Punch Out", value: "OUT" },
];

export default function SiteKioskPanel({ site }) {
  const dispatch = useDispatch();
  const siteId = site?.id;
  const { siteTeam: teamItems, isLoadingSiteTeam: isLoadingTeam } = useSelector((state) => state.site);
  const { isBatchPunchingIn, isBatchPunchingOut, isSyncingAttendance } = useSelector(
    (state) => state.attendance
  );

  const [selectedIds, setSelectedIds] = useState([]);
  const [remarks, setRemarks] = useState("Site kiosk roll-call");
  const [batchResult, setBatchResult] = useState(null);
  const [isSyncOpen, setIsSyncOpen] = useState(false);

  const workerOptions = useMemo(
    () =>
      teamItems.map((e) => ({
        label: e.employeeCode ? `${e.displayName} (${e.employeeCode})` : e.displayName,
        value: e.id,
      })),
    [teamItems]
  );

  const syncFormik = useFormik({
    initialValues: {
      employeeId: "",
      direction: "IN",
      occurredAt: new Date().toISOString().slice(0, 16),
      clientSessionId: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `kiosk-${Date.now()}`,
    },
    validationSchema: Yup.object({
      employeeId: Yup.string().required("Worker is required"),
      direction: Yup.string().oneOf(["IN", "OUT"]).required("Direction is required"),
      occurredAt: Yup.string().required("Timestamp is required"),
      clientSessionId: Yup.string().trim().required("Client session ID is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (!siteId) return;
      try {
        const res = await dispatch(
          syncAttendance({
            siteId,
            employeeId: values.employeeId,
            direction: values.direction,
            occurredAt: new Date(values.occurredAt).toISOString(),
            clientSessionId: values.clientSessionId.trim(),
            latitude: Number(site?.geoLatitude || 23.0225),
            longitude: Number(site?.geoLongitude || 72.5714),
          })
        ).unwrap();
        setBatchResult(res?.data || res);
        resetForm({
          values: {
            employeeId: "",
            direction: "IN",
            occurredAt: new Date().toISOString().slice(0, 16),
            clientSessionId:
              typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : `kiosk-${Date.now()}`,
          },
        });
        setIsSyncOpen(false);
      } catch {
        // handled in slice
      }
    },
  });

  useEffect(() => {
    if (siteId) {
      dispatch(fetchSiteTeam({ siteId, params: { status: "ACTIVE" } }));
    }
  }, [dispatch, siteId]);

  const toggleId = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    if (selectedIds.length === teamItems.length) setSelectedIds([]);
    else setSelectedIds(teamItems.map((e) => e.id));
  };

  const runBatch = async (mode) => {
    if (!siteId || selectedIds.length === 0) return;
    const payload = {
      siteId,
      employeeIds: selectedIds,
      latitude: Number(site?.geoLatitude || 23.0225),
      longitude: Number(site?.geoLongitude || 72.5714),
      ...(remarks.trim() ? { remarks: remarks.trim() } : {}),
    };
    try {
      const res =
        mode === "in"
          ? await dispatch(batchPunchIn(payload)).unwrap()
          : await dispatch(batchPunchOut(payload)).unwrap();
      setBatchResult(res?.data || res);
    } catch {
      // handled in slice
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] p-3">
        <div className="flex-1 min-w-[220px]">
          <InputField
            id="kioskRemarks"
            name="kioskRemarks"
            placeholder="Roll-call remarks..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => runBatch("in")}
            disabled={selectedIds.length === 0 || isBatchPunchingIn}
            className="btn btn-primary btn-sm h-10 inline-flex items-center gap-1.5"
          >
            <IconLogin size={15} />
            <span>Batch Punch In ({selectedIds.length})</span>
          </button>
          <button
            type="button"
            onClick={() => runBatch("out")}
            disabled={selectedIds.length === 0 || isBatchPunchingOut}
            className="btn btn-outline btn-sm h-10 inline-flex items-center gap-1.5"
          >
            <IconLogout size={15} />
            <span>Batch Punch Out ({selectedIds.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setIsSyncOpen(true)}
            className="btn btn-outline btn-sm h-10 inline-flex items-center gap-1.5"
          >
            <IconCloudUpload size={15} />
            <span>Offline Sync</span>
          </button>
          <RefreshButton
            onClick={() =>
              dispatch(fetchSiteTeam({ siteId, params: { status: "ACTIVE" } }))
            }
            loading={isLoadingTeam}
            className="h-10 w-10 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700/60"
          />
        </div>
      </div>

      {batchResult && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-700/40 bg-emerald-50 dark:bg-emerald-500/10 p-3 text-xs">
          Batch completed: <strong>{batchResult.succeeded ?? batchResult.results?.length ?? 0}</strong> processed.
        </div>
      )}

      <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-[#1C2536] divide-y divide-slate-100 dark:divide-slate-700/60">
        <div className="flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-500">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={teamItems.length > 0 && selectedIds.length === teamItems.length}
              onChange={toggleAll}
            />
            <span>Select All ({teamItems.length})</span>
          </label>
          <span>Status</span>
        </div>
        {teamItems.map((emp) => (
          <label
            key={emp.id}
            className="flex items-center justify-between px-4 py-2.5 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
          >
            <span className="inline-flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={selectedIds.includes(emp.id)}
                onChange={() => toggleId(emp.id)}
              />
              <span className="font-semibold text-slate-800 dark:text-slate-100">{emp.displayName}</span>
              <span className="font-mono text-slate-400">{emp.employeeCode}</span>
            </span>
            <StatusBadge label={emp.membershipStatus || "ACTIVE"} tone="emerald" size="xs" />
          </label>
        ))}
      </div>

      <ModalBasic
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
        title="Replay Offline Kiosk Punch"
        description="Idempotently sync a queued offline punch using its clientSessionId."
        size="md"
      >
        <form onSubmit={syncFormik.handleSubmit} className="space-y-4 p-6">
          <SelectField
            id="syncEmployeeId"
            name="employeeId"
            label="Worker"
            required
            placeholder="Select worker"
            options={workerOptions}
            value={syncFormik.values.employeeId}
            onChange={syncFormik.handleChange}
            error={syncFormik.touched.employeeId && syncFormik.errors.employeeId}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              id="syncDirection"
              name="direction"
              label="Direction"
              required
              options={DIRECTION_OPTIONS}
              value={syncFormik.values.direction}
              onChange={syncFormik.handleChange}
            />
            <InputField
              id="syncOccurredAt"
              name="occurredAt"
              type="datetime-local"
              label="Occurred At"
              required
              value={syncFormik.values.occurredAt}
              onChange={syncFormik.handleChange}
              error={syncFormik.touched.occurredAt && syncFormik.errors.occurredAt}
            />
          </div>
          <InputField
            id="syncClientSessionId"
            name="clientSessionId"
            label="Client Session ID (Idempotency Key)"
            required
            value={syncFormik.values.clientSessionId}
            onChange={syncFormik.handleChange}
            error={syncFormik.touched.clientSessionId && syncFormik.errors.clientSessionId}
          />
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button type="button" onClick={() => setIsSyncOpen(false)} className="btn btn-outline btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isSyncingAttendance}>
              {isSyncingAttendance ? "Syncing..." : "Sync Offline Punch"}
            </button>
          </div>
        </form>
      </ModalBasic>
    </div>
  );
}
