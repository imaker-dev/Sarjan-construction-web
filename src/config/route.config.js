import { PERMISSIONS } from "@constants/permissions";
import { ROLES } from "@constants/roles";
import { ROUTES } from "@constants/routes";
import { lazyLoad } from "@utils/lazy.utils";


/* -------------------------------------------------------------------------- */
/*  Public pages                                                              */
/* -------------------------------------------------------------------------- */
const LoginPage = lazyLoad(() => import("@features/auth/pages/LoginPage"));
const VerifyCompanyPage = lazyLoad(() => import("@features/companies/pages/VerifyCompanyPage"));
const VerifyEmployeePage = lazyLoad(() => import("@features/employees/pages/VerifyEmployeePage"));


/* -------------------------------------------------------------------------- */
/*  Authenticated pages                                                       */
/* -------------------------------------------------------------------------- */
const DashboardPage = lazyLoad(() => import("@features/dashboard/pages/DashboardPage"));
const AllDepartmentsPage = lazyLoad(() => import("@features/departments/pages/AllDepartmentsPage"));
const CreateDepartmentPage = lazyLoad(() => import("@features/departments/pages/CreateDepartmentPage"));
const DepartmentOperationsPage = lazyLoad(() => import("@features/departments/pages/DepartmentOperationsPage"));
const AllEmployeesPage = lazyLoad(() => import("@features/employees/pages/AllEmployeesPage"));
const CreateEmployeePage = lazyLoad(() => import("@features/employees/pages/CreateEmployeePage"));
const ThemeSelectionPage = lazyLoad(() => import("@features/theme/pages/ThemeSelectionPage"));
const CompaniesListPage = lazyLoad(() => import("@features/platform/pages/CompaniesListPage"));
const CompanyDetailsPage = lazyLoad(() => import("@features/platform/pages/CompanyDetailsPage"));
const MasterOperationsPage = lazyLoad(() => import("@features/platform/pages/MasterOperationsPage"));
const AllOperationsPage = lazyLoad(() => import("@features/operations/pages/AllOperationsPage"));
const AllCompaniesPage = lazyLoad(() => import("@features/companies/pages/AllCompaniesPage"));
const CreateCompanyPage = lazyLoad(() => import("@features/companies/pages/CreateCompanyPage"));
const AllHeadOfficesPage = lazyLoad(() => import("@features/head-offices/pages/AllHeadOfficesPage"));
const CreateHeadOfficePage = lazyLoad(() => import("@features/head-offices/pages/CreateHeadOfficePage"));
const AllProjectsPage = lazyLoad(() => import("@features/projects/pages/AllProjectsPage"));
const CreateProjectPage = lazyLoad(() => import("@features/projects/pages/CreateProjectPage"));
const ProjectDetailsPage = lazyLoad(() => import("@features/projects/pages/ProjectDetailsPage"));
const AllSitesPage = lazyLoad(() => import("@features/sites/pages/AllSitesPage"));
const CreateSitePage = lazyLoad(() => import("@features/sites/pages/CreateSitePage"));
const EmployeeMembershipPage = lazyLoad(() => import("@features/employees/pages/EmployeeMembershipPage"));
const EmployeeRoleAssignmentPage = lazyLoad(() => import("@features/employees/pages/EmployeeRoleAssignmentPage"));
const EmployeeOperationsPage = lazyLoad(() => import("@features/employees/pages/EmployeeOperationsPage"));
const MyProfilePage = lazyLoad(() => import("@features/profile/pages/MyProfilePage"));
const NotificationPage = lazyLoad(() => import("@features/notification/pages/NotificationPage"));
const AttendancePage = lazyLoad(() => import("@features/attendance/pages/AttendancePage"));
const AllAttendancePoliciesPage = lazyLoad(() => import("@features/attendance/pages/AllAttendancePoliciesPage"));
const AttendancePolicyDetailsPage = lazyLoad(() => import("@features/attendance/pages/AttendancePolicyDetailsPage"));
const CreateAttendancePolicyPage = lazyLoad(() => import("@features/attendance/pages/CreateAttendancePolicyPage"));
const DailyReportsListPage = lazyLoad(() => import("@features/daily-reports/pages/DailyReportsListPage"));
const DailyReportDetailsPage = lazyLoad(() => import("@features/daily-reports/pages/DailyReportDetailsPage"));
const EmployeeDocumentsPage = lazyLoad(() => import("@features/employees/pages/EmployeeDocumentsPage"));


/* -------------------------------------------------------------------------- */
/*  PUBLIC ROUTES (outside the app layout)                                    */
/*                                                                            */
/*  guestOnly: true  -> logged-in users are redirected to home (e.g. login)   */
/*  guestOnly: false -> reachable with or without login (default)             */
/* -------------------------------------------------------------------------- */
export const publicRouteConfig = [
  // Open to everyone
  { path: ROUTES.COMPANIES.VERIFY, element: VerifyCompanyPage },
  { path: ROUTES.EMPLOYEES.VERIFY, element: VerifyEmployeePage },

  // Guests only
  { path: ROUTES.AUTH.ROOT, element: LoginPage, guestOnly: true },
];


export const privateRouteConfig = [
  {
    path: ROUTES.HOME.ROOT,
    element: DashboardPage,
    // roles: [ROLES.MASTER, ROLES.SUPER_ADMIN],
    // permissions: [PERMISSIONS.VIEW_DASHBOARD],
    // public: true
  },
  { path: ROUTES.THEME.ROOT, element: ThemeSelectionPage },

  //Profile Routes
  { path: ROUTES.PROFILE.ROOT, element: MyProfilePage },

  // platform admin Routes
  { path: ROUTES.PLATFORM.COMPANIES, element: CompaniesListPage },
  // { path: ROUTES.PLATFORM.COMPANY_CREATE, element: CreateCompanyPage },
  { path: ROUTES.PLATFORM.COMPANY_DETAILS, element: CompanyDetailsPage },
  { path: ROUTES.PLATFORM.OPERATIONS, element: MasterOperationsPage },

  // Company Routes
  { path: ROUTES.COMPANIES.ROOT, element: AllCompaniesPage, roles: [ROLES.PLATFORM_ADMIN], },
  { path: ROUTES.COMPANIES.CREATE, element: CreateCompanyPage, roles: [ROLES.PLATFORM_ADMIN], },

  // Operations Routes
  { path: ROUTES.OPERATIONS.ROOT, element: AllOperationsPage, roles: [ROLES.PLATFORM_ADMIN] },

  // Head Offices Routes
  { path: ROUTES.HEAD_OFFICES.ROOT, element: AllHeadOfficesPage, permissions: [PERMISSIONS.HEAD_OFFICE.READ], },
  { path: ROUTES.HEAD_OFFICES.CREATE, element: CreateHeadOfficePage, permissions: [PERMISSIONS.HEAD_OFFICE.CREATE] },

  //Projects Routes
  { path: ROUTES.PROJECTS.ROOT, element: AllProjectsPage, permissions: [PERMISSIONS.PROJECT.READ] },
  { path: ROUTES.PROJECTS.CREATE, element: CreateProjectPage, permissions: [PERMISSIONS.PROJECT.CREATE] },
  { path: ROUTES.PROJECTS.DETAILS, element: ProjectDetailsPage, permissions: [PERMISSIONS.PROJECT.READ] },

  //Sites Routes
  { path: ROUTES.SITES.ROOT, element: AllSitesPage, permissions: [PERMISSIONS.SITE.READ] },
  { path: ROUTES.SITES.CREATE, element: CreateSitePage, permissions: [PERMISSIONS.SITE.CREATE] },

  // Departments Routes
  { path: ROUTES.DEPARTMENTS.ROOT, element: AllDepartmentsPage, permissions: [PERMISSIONS.DEPARTMENT.READ] },
  { path: ROUTES.DEPARTMENTS.CREATE, element: CreateDepartmentPage, permissions: [PERMISSIONS.DEPARTMENT.CONFIGURE] },
  { path: ROUTES.DEPARTMENTS.OPERATIONS, element: DepartmentOperationsPage, permissions: [PERMISSIONS.DEPARTMENT.CONFIGURE] },

  // Employees Routes
  { path: ROUTES.EMPLOYEES.ROOT, element: AllEmployeesPage, permissions: [PERMISSIONS.EMPLOYEE.READ] },
  { path: ROUTES.EMPLOYEES.CREATE, element: CreateEmployeePage, permissions: [PERMISSIONS.EMPLOYEE.INVITE] },
  { path: ROUTES.EMPLOYEES.MEMBERSHIPS, element: EmployeeMembershipPage, permissions: [PERMISSIONS.EMPLOYEE.MANAGE] },
  { path: ROUTES.EMPLOYEES.ROLES, element: EmployeeRoleAssignmentPage, permissions: [PERMISSIONS.EMPLOYEE.MANAGE] },
  { path: ROUTES.EMPLOYEES.OPERATIONS, element: EmployeeOperationsPage, permissions: [PERMISSIONS.EMPLOYEE.MANAGE] },
  { path: ROUTES.EMPLOYEES.DOCUMENTS, element: EmployeeDocumentsPage, permissions: [PERMISSIONS.EMPLOYEE.READ] },

  // Attendance Routes
  { path: ROUTES.ATTENDANCE.ROOT, element: AttendancePage, permissions: [PERMISSIONS.ATTENDANCE.READ], },
  { path: ROUTES.ATTENDANCE.POLICIES, element: AllAttendancePoliciesPage, permissions: [PERMISSIONS.ATTENDANCE.MANAGE], },
  { path: ROUTES.ATTENDANCE.POLICY_DETAILS, element: AttendancePolicyDetailsPage, permissions: [PERMISSIONS.ATTENDANCE.MANAGE] },
  { path: ROUTES.ATTENDANCE.CREATE_POLICY, element: CreateAttendancePolicyPage, permissions: [PERMISSIONS.ATTENDANCE.MANAGE] },
  { path: "/attendance/muster-roll", element: DailyReportsListPage, permissions: [PERMISSIONS.ATTENDANCE.READ] },

  // Daily Reports & Settlement Routes (Separate Feature)
  { path: ROUTES.DAILY_REPORTS.ROOT, element: DailyReportsListPage, permissions: [PERMISSIONS.ATTENDANCE.READ] },
  { path: ROUTES.DAILY_REPORTS.DETAILS, element: DailyReportDetailsPage, permissions: [PERMISSIONS.ATTENDANCE.READ] },
  { path: "/attendance/daily-reports", element: DailyReportsListPage, permissions: [PERMISSIONS.ATTENDANCE.READ] },
  { path: "/attendance/daily-reports/:id", element: DailyReportDetailsPage, permissions: [PERMISSIONS.ATTENDANCE.READ] },

  // Notifications Routes
  { path: ROUTES.NOTIFICATIONS.ROOT, element: NotificationPage, roles: [ROLES.COMPANY_OWNER] },

];
