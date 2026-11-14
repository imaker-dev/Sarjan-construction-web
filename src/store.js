import { configureStore } from "@reduxjs/toolkit";
import authSlice  from "./store/slices/auth.slice";
import onboardingSlice from "./store/slices/onboarding.slice";
import departmentSlice from "./store/slices/department.slice";
import employeeSlice from "./store/slices/employee.slice";
import platformSlice from "./store/slices/platform.slice";

const reducer = {
  auth: authSlice,
  onboarding: onboardingSlice,
  department: departmentSlice,
  employee: employeeSlice,
  platform: platformSlice,
};

const store = configureStore({
  reducer,
});

export default store;