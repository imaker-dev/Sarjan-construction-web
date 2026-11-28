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
import profileSlice from './store/slices/profile.slice';
import notificationSlice from './store/slices/notification.slice';
import securitySlice from './store/slices/security.slice';
import attendanceSlice from './store/slices/attendance.slice';
import dailyReportSlice from './store/slices/dailyReport.slice';
import scheduleSlice from './store/slices/schedule.slice';
import leaveSlice from './store/slices/leave.slice';
import walletSlice from './store/slices/wallet.slice';

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
  profile: profileSlice,
  notification: notificationSlice,
  security: securitySlice,
  attendance: attendanceSlice,
  dailyReport: dailyReportSlice,
  schedule: scheduleSlice,
  leave: leaveSlice,
  wallet: walletSlice,
};

const store = configureStore({
  reducer,
});

export default store;
