import { configureStore } from "@reduxjs/toolkit";
import authSlice  from "./store/slices/auth.slice";
import onboardingSlice from "./store/slices/onboarding.slice";
import departmentSlice from "./store/slices/department.slice";
import employeeSlice from "./store/slices/employee.slice";

const reducer = {
  auth: authSlice,
  onboarding: onboardingSlice,
  department: departmentSlice,
  employee: employeeSlice,
};

const store = configureStore({
  reducer,
});

export default store;