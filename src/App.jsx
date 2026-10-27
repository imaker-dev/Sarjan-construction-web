import LoginPage from "@features/auth/pages/LoginPage";
import AuthenticatedRoutes from "@layout/AuthenticatedRoutes";
import { Suspense } from "react";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";

function App() {
  const { meData} = useSelector((state) => state.auth);
  const logIn = false;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* <AppLayout /> */}
      <Routes>
        {/* AUTH */}
        {!logIn && <Route path="/auth" element={<LoginPage />} />}
        {logIn && <Route path="/auth" element={<Navigate to="/" replace />} />}

        
        {/* PROTECTED */}
        {/* {logIn && meData && ( */}
          <Route path="/*" element={<AuthenticatedRoutes />} />
        {/* )} */}

        {/* NOT LOGGED IN */}
        {!logIn && <Route path="*" element={<Navigate to="/auth" replace />} />}

      </Routes>
    </Suspense>
  );
}

export default App;
