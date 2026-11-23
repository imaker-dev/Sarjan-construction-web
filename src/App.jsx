import SplashScreen from "@components/feedback/SplashScreen";
import { publicRouteConfig } from "@config/route.config";
import { ROUTES } from "@constants/routes";
import AuthenticatedRoutes from "@layout/AuthenticatedRoutes";
import { fetchMe } from "@store/slices/auth.slice";
import { Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";

function App() {
  const dispatch = useDispatch();
  const { meData, logIn } = useSelector((state) => state.auth);

  // FETCH PROFILE
  useEffect(() => {
    if (logIn) {
      dispatch(fetchMe());
    }
  }, [dispatch, logIn]);

  return (
    <Suspense fallback={<SplashScreen />}>
      <Routes>
        {/* PUBLIC (config driven) */}
        {publicRouteConfig.map(({ path, element: Component, guestOnly }) => (
          <Route
            key={path}
            path={path}
            element={
              guestOnly && logIn ? (
                <Navigate to={ROUTES.HOME.ROOT} replace />
              ) : (
                <Component />
              )
            }
          />
        ))}

        {/* PROTECTED */}
        {logIn && meData && (
          <Route path="/*" element={<AuthenticatedRoutes />} />
        )}

        {/* NOT LOGGED IN */}
        {!logIn && (
          <Route
            path="*"
            element={<Navigate to={ROUTES.AUTH.ROOT} replace />}
          />
        )}
      </Routes>
    </Suspense>
  );
}

export default App;
