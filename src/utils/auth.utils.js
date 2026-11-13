import { AUTH_CONFIG } from "@config/auth.config";

export const getRawToken = () =>
  localStorage.getItem(AUTH_CONFIG.ACCESS_TOKEN) ||
  sessionStorage.getItem(AUTH_CONFIG.ACCESS_TOKEN);

export const getBearerToken = () => {
  const token = getRawToken();
  return token ? `Bearer ${token}` : null;
};

export const getCompanyId = () =>
  localStorage.getItem(AUTH_CONFIG.COMPANY_ID) ||
  sessionStorage.getItem(AUTH_CONFIG.COMPANY_ID);

export const isLoggedIn = () => !!getRawToken();

export const clearAuthStorage = () => {
  localStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN);
  localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN);
  localStorage.removeItem(AUTH_CONFIG.COMPANY_ID);

  sessionStorage.removeItem(AUTH_CONFIG.ACCESS_TOKEN);
  sessionStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN);
  sessionStorage.removeItem(AUTH_CONFIG.COMPANY_ID);
};
