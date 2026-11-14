import {
  clearAuthStorage,
  getBearerToken,
  getCompanyId,
} from "@utils/auth.utils";
import { ERROR_TYPES, identifyError } from "@utils/error.handlers";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

// Create axios instance
const axiosInstance = axios.create({
  baseURL,
});

// Request interceptor to handle dynamic content-type based on request body
axiosInstance.interceptors.request.use(
  (config) => {
    if (!config.headers) config.headers = {};

    const token = getBearerToken();
    const companyId = getCompanyId();

    console.log(companyId);
    if (token) {
      config.headers.Authorization = token;
    }

    // Platform routes and global operations routes operate across all companies.
    // Do NOT send x-company-id header for platform endpoints.
    const isPlatformRoute =
      config.skipCompanyId ||
      (config.url &&
        (config.url.startsWith("/platform") ||
          config.url.includes("/platform/") ||
          config.url === "/operations" ||
          config.url.startsWith("/operations")));

    if (companyId && !isPlatformRoute) {
      config.headers["x-company-id"] = companyId;
    }

    // If the request body is FormData, let axios set the Content-Type for multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      // For JSON requests, set Content-Type to application/json
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { data } = error.response;

      // Full error object: { code, message, requestId }
      const apiError =
        data?.error && typeof data.error === "object"
          ? data.error
          : {
              message:
                (typeof data?.error === "string" && data.error) ||
                data?.message ||
                "Some unknown error",
            };

      const errorType = identifyError(apiError.message);
      if (errorType === ERROR_TYPES.AUTH) {
        // clearAuthStorage();
        // window.location.replace("/auth");
      }

      return Promise.reject(apiError);
    }

    return Promise.reject({ code: "NETWORK_ERROR", message: "Network error" });
  },
);

// Utility methods for GET and POST requests
export const get = async (url, params, config = {}) =>
  axiosInstance.get(url, { params, ...config });

export const post = async (url, data, config = {}) =>
  axiosInstance.post(url, data, config);

export const patch = async (url, data, config = {}) =>
  axiosInstance.patch(url, data, config);

export const put = async (url, data, config = {}) =>
  axiosInstance.put(url, data, config);

export const del = async (url, config = {}) =>
  axiosInstance.delete(url, config);

export default axiosInstance;
