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