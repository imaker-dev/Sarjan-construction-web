import { useState, useMemo } from "react";
import {
  DEFAULT_DATE_RANGE,
  DEFAULT_BUSINESS_HOURS,
  getPresetISORange,
} from "@utils/dateRange.utils";

/**
 * Owns date range state, pre-filled with the default range, so the first
 * render already has real dates (no empty state, no double API call).
 *
 * const { startDate, endDate, pickerProps } = useDateRange();
 * <DateRangePicker {...pickerProps} />
 */
export function useDateRange({
  defaultRange = DEFAULT_DATE_RANGE,
  businessHours = DEFAULT_BUSINESS_HOURS,
} = {}) {
  const { startHour, startMinute } = businessHours;

  // Stable even if the caller passes an inline object
  const hours = useMemo(
    () => ({ startHour, startMinute }),
    [startHour, startMinute],
  );

  const [dateRange, setDateRange] = useState(() =>
    getPresetISORange(defaultRange, hours),
  );

  const pickerProps = useMemo(
    () => ({
      value: dateRange,
      onChange: setDateRange,
      defaultRange,
      businessHours: hours,
    }),
    [dateRange, defaultRange, hours],
  );

  return {
    dateRange,
    setDateRange,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    pickerProps,
  };
}

export default useDateRange;