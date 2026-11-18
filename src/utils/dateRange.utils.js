// ---------- Predefined Date Ranges ----------

export const DATE_RANGES = {
  TODAY: "Today",
  YESTERDAY: "Yesterday",
  LAST_7_DAYS: "Last 7 Days",
  LAST_30_DAYS: "Last 30 Days",
  THIS_MONTH: "This Month",
  LAST_MONTH: "Last Month",
  CUSTOM: "Custom Range",
};

export const PREDEFINED_RANGES = Object.values(DATE_RANGES);

export const DEFAULT_DATE_RANGE = DATE_RANGES.THIS_MONTH;

// ---------- Business Hours ----------
// The business day rolls over at this time.
// Default: 12:00 AM (midnight to midnight).
// Restaurant / nightclub (10 AM to ~3 AM): { startHour: 10, startMinute: 0 }
export const DEFAULT_BUSINESS_HOURS = {
  startHour: 0,
  startMinute: 0,
};

// ---------- Basic Date Helpers ----------

export const startOfDay = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const endOfDay = (d) => {
  const date = new Date(d);
  date.setHours(23, 59, 59, 999);
  return date;
};

// Date -> "YYYY-MM-DD" (local time)
export const toISODate = (date) => {
  if (!date) return null;

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// "YYYY-MM-DD" -> local Date (avoids the UTC day-shift of new Date("YYYY-MM-DD"))
export const toLocalDate = (v) => {
  if (v instanceof Date) return new Date(v);
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [y, m, d] = v.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(v);
};

// True only when both dates are present (an empty object / array is NOT a value)
export const hasValue = (v) => Boolean(v?.startDate && v?.endDate);

// ---------- Business Day Logic ----------

// The business day (00:00 local) that "now" belongs to.
// Before the business day starts, we are still in the previous business day.
export const getCurrentBusinessDay = (
  hours = DEFAULT_BUSINESS_HOURS,
  now = new Date(),
) => {
  const day = new Date(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const rolloverMinutes = hours.startHour * 60 + hours.startMinute;

  if (nowMinutes < rolloverMinutes) {
    day.setDate(day.getDate() - 1);
  }

  day.setHours(0, 0, 0, 0);
  return day;
};

// Exact start of a business day (e.g. 10:00 AM)
export const getBusinessDayStart = (date, hours = DEFAULT_BUSINESS_HOURS) => {
  const d = new Date(date);
  d.setHours(hours.startHour, hours.startMinute, 0, 0);
  return d;
};

// Exact end of a business day (e.g. 10:00 AM next day)
export const getBusinessDayEnd = (date, hours = DEFAULT_BUSINESS_HOURS) => {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  d.setHours(hours.startHour, hours.startMinute, 0, 0);
  return d;
};

// ---------- Preset Ranges ----------

// Returns { startDate: Date, endDate: Date, key } for a preset label, or null
export const getPresetRange = (range, hours = DEFAULT_BUSINESS_HOURS) => {
  const today = getCurrentBusinessDay(hours);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const make = (s, e) => ({
    startDate: startOfDay(s),
    endDate: endOfDay(e),
    key: "selection",
  });

  switch (range) {
    case DATE_RANGES.TODAY:
      return make(today, today);
    case DATE_RANGES.YESTERDAY:
      return make(yesterday, yesterday);
    case DATE_RANGES.LAST_7_DAYS: {
      const s = new Date(today);
      s.setDate(today.getDate() - 6);
      return make(s, today);
    }
    case DATE_RANGES.LAST_30_DAYS: {
      const s = new Date(today);
      s.setDate(today.getDate() - 29);
      return make(s, today);
    }
    case DATE_RANGES.THIS_MONTH:
      return make(
        new Date(today.getFullYear(), today.getMonth(), 1),
        new Date(today.getFullYear(), today.getMonth() + 1, 0),
      );
    case DATE_RANGES.LAST_MONTH:
      return make(
        new Date(today.getFullYear(), today.getMonth() - 1, 1),
        new Date(today.getFullYear(), today.getMonth(), 0),
      );
    default:
      return null;
  }
};

// Preset label -> { startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD" }
export const getPresetISORange = (range, hours = DEFAULT_BUSINESS_HOURS) => {
  const r = getPresetRange(range, hours);
  if (!r) return { startDate: null, endDate: null };
  return { startDate: toISODate(r.startDate), endDate: toISODate(r.endDate) };
};