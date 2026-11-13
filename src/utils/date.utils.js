
// ---------- DATE VALIDATION ----------
const getValidDate = (input) => {
  if (input == null || input === "") return null;

  // Avoid timezone shifting for date-only strings (YYYY-MM-DD).
  if (
    typeof input === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(input)
  ) {
    const [year, month, day] = input.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    // Reject invalid calendar dates such as 2026-02-30.
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  const date = new Date(input);

  return isNaN(date.getTime()) ? null : date;
};

// ---------- TIME AGO ----------
export const timeAgo = (input) => {
  const date = getValidDate(input);

  if (!date) return "Not provided";

  const diff = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diff < 60) return "Just now";

  const units = [
    { label: "y", seconds: 60 * 60 * 24 * 365 },
    { label: "mo", seconds: 60 * 60 * 24 * 30 },
    { label: "d", seconds: 60 * 60 * 24 },
    { label: "h", seconds: 60 * 60 },
    { label: "m", seconds: 60 },
  ];

  for (const unit of units) {
    const value = Math.floor(diff / unit.seconds);

    if (value >= 1) {
      return `${value}${unit.label} ago`;
    }
  }

  return "Just now";
};

// ---------- FORMAT DATE ----------
export const formatDate = (input, type = "short") => {
  const date = getValidDate(input);

  if (!date) return input == null || input === "" ? "Not provided" : "Invalid date";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const monthName = monthNames[date.getMonth()];

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const hours12 = hours % 12 || 12;
  const meridian = hours >= 12 ? "PM" : "AM";

  switch (type) {
    case "short":
      return `${day}-${month}-${year}`;

    case "shortTime":
      return `${day}-${month}-${year} ${hours12}:${minutes} ${meridian}`;

    case "long":
      return `${day} ${monthName}, ${year}`;

    case "longTime":
      return `${day} ${monthName}, ${year} ${hours12}:${minutes} ${meridian}`;

    case "dayMonth":
      return `${day} ${monthName}`;

    case "time":
      return `${hours12}:${minutes} ${meridian}`;

    case "timeAgo":
      return timeAgo(input);

    default:
      return `${day}-${month}-${year}`;
  }
};

// ---------- DURATION BETWEEN TWO DATES ----------
export const formatDurationBetween = (
  start,
  end,
  type = "short"
) => {
  const startDate = getValidDate(start);
  const endDate = getValidDate(end);

  if (!startDate || !endDate) return null;

  const diffMs = endDate.getTime() - startDate.getTime();

  if (diffMs <= 0) return null;

  const totalMinutes = Math.floor(diffMs / 60000);

  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (type === "long") {
    const parts = [];

    if (days) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
    if (hours) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
    if (minutes) parts.push(`${minutes} min`);

    return parts.length ? parts.join(" ") : "Less than a minute";
  }

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;

  return `${minutes}m`;
};

// ---------- INPUT FORMAT ----------
export const formatDateForInput = (dateString) => {
  const date = getValidDate(dateString);

  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
