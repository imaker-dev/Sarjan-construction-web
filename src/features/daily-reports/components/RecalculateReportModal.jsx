import React, { useEffect, useState } from "react";
import ModalBasic from "@components/ui/ModalBasic";
import { useDispatch, useSelector } from "react-redux";
import { recalculateDailyReport } from "@store/slices/dailyReport.slice";
import { listSites } from "@store/slices/site.slice";
import { getAllHeadOffices } from "@store/slices/head-office.slice";
import {
  IconCalculator,
  IconBuilding,
  IconBuildingSkyscraper,
} from "@tabler/icons-react";

export default function RecalculateReportModal({
  isOpen,
  onClose,
  defaultScope = "SITE", // "SITE" | "OFFICE"
  defaultSiteId = "",
  defaultHeadOfficeId = "",
  defaultDate = "",
  onSuccess,
}) {
  const dispatch = useDispatch();
  const { isRecalculating } = useSelector((state) => state.dailyReport);
  const { sitesData, isListingSites } = useSelector((state) => state.site);
  const { headOfficesData, isListingHeadOffices } = useSelector(
    (state) => state.headOffice
  );

  const [locationScope, setLocationScope] = useState(defaultScope); // "SITE" | "OFFICE"
  const [siteId, setSiteId] = useState(defaultSiteId);
  const [headOfficeId, setHeadOfficeId] = useState(defaultHeadOfficeId);
  const [businessDate, setBusinessDate] = useState(
    defaultDate || new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (isOpen) {
      if (!sitesData || (Array.isArray(sitesData) && sitesData.length === 0)) {
        dispatch(listSites());
      }
      if (
        !headOfficesData ||
        (Array.isArray(headOfficesData) && headOfficesData.length === 0)
      ) {
        dispatch(getAllHeadOffices());
      }
    }
  }, [isOpen, dispatch, sitesData, headOfficesData]);

  useEffect(() => {
    if (defaultScope) setLocationScope(defaultScope);
    if (defaultSiteId) setSiteId(defaultSiteId);
    if (defaultHeadOfficeId) setHeadOfficeId(defaultHeadOfficeId);
    if (defaultDate) setBusinessDate(defaultDate);
  }, [defaultScope, defaultSiteId, defaultHeadOfficeId, defaultDate]);

  const sitesList = Array.isArray(sitesData)
    ? sitesData
    : Array.isArray(sitesData?.data)
      ? sitesData.data
      : [];

  const headOfficesList = Array.isArray(headOfficesData)
    ? headOfficesData
    : Array.isArray(headOfficesData?.data)
      ? headOfficesData.data
      : [];

  const isFormValid =
    Boolean(businessDate) &&
    ((locationScope === "SITE" && Boolean(siteId)) ||
      (locationScope === "OFFICE" && Boolean(headOfficeId)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      await dispatch(
        recalculateDailyReport({
          siteId: locationScope === "SITE" ? siteId : undefined,
          headOfficeId: locationScope === "OFFICE" ? headOfficeId : undefined,
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
        {/* Location Type Switcher */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
            Location Scope <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setLocationScope("SITE")}
              className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition-all ${
                locationScope === "SITE"
                  ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-950/40 dark:text-primary-300"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <IconBuildingSkyscraper size={16} />
              <span>Construction Site</span>
            </button>
            <button
              type="button"
              onClick={() => setLocationScope("OFFICE")}
              className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition-all ${
                locationScope === "OFFICE"
                  ? "border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-950/40 dark:text-primary-300"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <IconBuilding size={16} />
              <span>Head Office / Corporate</span>
            </button>
          </div>
        </div>

        {/* Site Selector */}
        {locationScope === "SITE" && (
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
        )}

        {/* Head Office Selector */}
        {locationScope === "OFFICE" && (
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
              Corporate / Head Office <span className="text-red-500">*</span>
            </label>
            <select
              value={headOfficeId}
              onChange={(e) => setHeadOfficeId(e.target.value)}
              required
              disabled={isListingHeadOffices || isRecalculating}
              className="form-select w-full text-xs"
            >
              <option value="">Select a head office</option>
              {headOfficesList.map((ho) => (
                <option key={ho.id} value={ho.id}>
                  {ho.name} ({ho.code || "HQ"})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Business Date */}
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
            {locationScope === "SITE"
              ? "Muster roll totals and workforce counts will be recomputed for this construction site."
              : "In-progress / unclosed office sessions will be settled and hours computed for this head office."}
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
            disabled={isRecalculating || !isFormValid}
          >
            <IconCalculator size={16} />
            <span>{isRecalculating ? "Calculating..." : "Trigger Recalculation"}</span>
          </button>
        </div>
      </form>
    </ModalBasic>
  );
}
