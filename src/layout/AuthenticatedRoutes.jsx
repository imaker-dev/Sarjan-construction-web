
import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import AppLayout from "./AppLayout";
import { routeConfig } from "@config/route.config";
import UnauthorizedPage from "@components/feedback/UnauthorizedPage";
import NotFoundPage from "@components/feedback/NotFoundPage";
import { hasAccess } from "@utils/access.utils";

const AuthenticatedRoutes = () => {
  const { meData } = useSelector((state) => state.auth);

  if (!meData) return null;

  const userRole = meData.role || meData.roles?.[0];

  return (
    <AppLayout>
      <Routes>
        {routeConfig.map((route) => {
          const {
            path,
            element: DefaultComponent,
            elements,
            roles,
            permissions,
            permissionMode,
          } = route;

          const SelectedComponent =
            elements?.[userRole] || DefaultComponent;

          if (!SelectedComponent) return null;

          const allowed = hasAccess({
            user: meData,
            roles,
            permissions,
            permissionMode,
          });

          return (
            <Route
              key={path}
              path={path}
              element={
                allowed ? (
                  <SelectedComponent />
                ) : (
                  <Navigate to="/unauthorized" replace />
                )
              }
            />
          );
        })}

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
};

export default AuthenticatedRoutes;
