
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { hasAccess } from "@utils/access.utils";

export const useAccess = () => {
  const meData = useSelector((state) => state.auth.meData);

  const can = useCallback(
    (config = {}) =>
      hasAccess({
        user: meData,
        ...config,
      }),
    [meData],
  );

  return {
    can,
    user: meData,
    roles: meData?.roles || [],
    permissions: meData?.permissions || [],
    assignments: meData?.assignments || [],
  };
};

export const Can = ({
  roles,
  permissions,
  permissionMode = "any",
  children,
  fallback = null,
}) => {
  const { can } = useAccess();

  const allowed = can({
    roles,
    permissions,
    permissionMode,
  });

  return allowed ? children : fallback;
};

export default useAccess;
