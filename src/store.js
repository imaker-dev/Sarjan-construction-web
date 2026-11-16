import { configureStore } from "@reduxjs/toolkit";
import authSlice  from "./store/slices/auth.slice";
import departmentSlice from "./store/slices/department.slice";
import employeeSlice from "./store/slices/employee.slice";
import platformSlice from "./store/slices/platform.slice";
import operationSlice from './store/slices/operation.slice';
import companySlice from './store/slices/company.slice';

const reducer = {
  auth: authSlice,
  department: departmentSlice,
  employee: employeeSlice,
  platform: platformSlice,
  operation: operationSlice,
  company: companySlice,
};

const store = configureStore({
  reducer,
});

export default store;