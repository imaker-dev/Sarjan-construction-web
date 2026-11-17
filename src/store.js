import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./store/slices/auth.slice";
import departmentSlice from "./store/slices/department.slice";
import employeeSlice from "./store/slices/employee.slice";
import platformSlice from "./store/slices/platform.slice";
import operationSlice from "./store/slices/operation.slice";
import companySlice from "./store/slices/company.slice";
import headOfficeSlice from "./store/slices/head-office.slice";
import projectSlice from './store/slices/project.slice';
import siteSlice from './store/slices/site.slice';
import employeeMembershipSlice from './store/slices/employeeMembership.slice';
import employeeRoleSlice from './store/slices/employeeRole.slice';

const reducer = {
  auth: authSlice,
  department: departmentSlice,
  employee: employeeSlice,
  platform: platformSlice,
  operation: operationSlice,
  company: companySlice,
  headOffice: headOfficeSlice,
  project: projectSlice,
  site: siteSlice,
  employeeMembership: employeeMembershipSlice,
  employeeRole: employeeRoleSlice,
};

const store = configureStore({
  reducer,
});

export default store;
