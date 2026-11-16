import { ROUTES } from "@constants/routes";
import LoginPage from "@features/auth/pages/LoginPage";
import VerifyCompanyPage from "@features/companies/pages/VerifyCompanyPage";
import VerifyEmployeePage from "@features/employees/pages/VerifyEmployeePage";
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
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        
        <Route path={ROUTES.COMPANIES.VERIFY} element={<VerifyCompanyPage />} />
        <Route path={ROUTES.EMPLOYEES.VERIFY} element={<VerifyEmployeePage />} />


        {/* AUTH */}
        {!logIn && <Route path={ROUTES.AUTH.ROOT} element={<LoginPage />} />}
        {logIn && <Route path={ROUTES.AUTH.ROOT} element={<Navigate to="/" replace />} />}

        {/* PROTECTED */}
        {logIn && meData && (
          <Route path="/*" element={<AuthenticatedRoutes />} />
        )}

        {/* NOT LOGGED IN */}
        {!logIn && <Route path="*" element={<Navigate to={ROUTES.AUTH.ROOT} replace />} />}
      </Routes>
    </Suspense>
  );
}

export default App;
