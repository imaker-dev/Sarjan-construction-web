import React, { useEffect, useState } from "react";
import ModalBasic from "@components/ui/ModalBasic";
import { useDispatch, useSelector } from "react-redux";
import { recalculateDailyReport } from "@store/slices/dailyReport.slice";
import { listSites } from "@store/slices/site.slice";
import { IconCalculator, IconRefresh } from "@tabler/icons-react";

export default function RecalculateReportModal({
  isOpen,
  onClose,
  defaultSiteId = "",
  defaultDate = "",
  onSuccess,
}) {
  const dispatch = useDispatch();
  const { isRecalculating } = useSelector((state) => state.dailyReport);
  const { sitesData, isListingSites } = useSelector((state) => state.site);

  const [siteId, setSiteId] = useState(defaultSiteId);
  const [businessDate, setBusinessDate] = useState(
    defaultDate || new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (isOpen && (!sitesData || (Array.isArray(sitesData) && sitesData.length === 0))) {
      dispatch(listSites());
    }
  }, [isOpen, dispatch, sitesData]);

  useEffect(() => {
    if (defaultSiteId) setSiteId(defaultSiteId);
    if (defaultDate) setBusinessDate(defaultDate);
  }, [defaultSiteId, defaultDate]);

  const sitesList = Array.isArray(sitesData)
    ? sitesData
    : Array.isArray(sitesData?.data)
      ? sitesData.data
      : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!siteId || !businessDate) return;

    try {
      await dispatch(
        recalculateDailyReport({
          siteId,
          businessDate,
        })
      ).unwrap();
      onClose();
      if (onSuccess) onSuccess();
    } catch {
      // toast error handled in slice
    }
  };

  return (
    <ModalBasic
      isOpen={isOpen}
      onClose={onClose}
      title="Recalculate Day"
      description="Recalculate attendance units and overtime for late biometric punches or updates."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
            Construction Site <span className="text-red-500">*</span>
          </label>
          <select
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            required
            disabled={isListingSites || isRecalculating}
            className="form-select w-full text-xs"
          >
            <option value="">Select a construction site</option>
            {sitesList.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name} ({site.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
            Business Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={businessDate}
            onChange={(e) => setBusinessDate(e.target.value)}
            required
            disabled={isRecalculating}
            className="form-input w-full text-xs"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Muster roll totals and workforce counts will be recomputed for this business date.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            disabled={isRecalculating}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isRecalculating || !siteId || !businessDate}
          >
            <IconCalculator size={16} />
            <span>{isRecalculating ? "Calculating..." : "Trigger Recalculation"}</span>
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}
