// utils/error.handler.js
export const ERROR_TYPES = {
  AUTH: "AUTH",
  ORDER: "ORDER",
};

const errorPatterns = {
  [ERROR_TYPES.AUTH]: [
    "User not found",
    "Access token required",
    "Invalid access token",
    "Invalid or expired token",
    "The user belonging to this token no longer exists",
    "Access token expired",
    "Session is not active",
  ],

  [ERROR_TYPES.ORDER]: [
    "Invalid or expired session",
    "Session verification failed",
    "This order is no longer active. Please start a new session",
  ],
};

export const identifyError = (errorMessage) => {
  if (typeof errorMessage !== "string") return null;

  for (const [type, messages] of Object.entries(errorPatterns)) {
    if (messages.some((msg) => errorMessage.includes(msg))) {
      return type;
    }
  }
  return null;
};

/**
 * Extracts a user-friendly error message from an API/thunk rejection payload,
 * normalizing backend error codes such as `DELEGATION_DISABLED`.
 */
export const extractApiError = (err, fallback = "Something went wrong") => {
  const code = err?.error?.code || err?.code;
  if (code === "DELEGATION_DISABLED") {
    return "This action is currently disabled by company delegation settings. Contact your Company Administrator.";
  }
  return typeof err === "string"
    ? err
    : err?.error?.message || err?.message || fallback;
};