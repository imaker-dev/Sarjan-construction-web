import { ROLES } from "@constants/roles";
import { ROUTES } from "@constants/routes";
import { lazyLoad } from "@utils/lazy.utils";

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
const AllSitesPage = lazyLoad(() => import("@features/sites/pages/AllSitesPage"));
const CreateSitePage = lazyLoad(() => import("@features/sites/pages/CreateSitePage"));
const EmployeeMembershipPage = lazyLoad(() => import("@features/employees/pages/EmployeeMembershipPage"));
const EmployeeRoleAssignmentPage = lazyLoad(() => import("@features/employees/pages/EmployeeRoleAssignmentPage"));
const EmployeeOperationsPage = lazyLoad(() => import("@features/employees/pages/EmployeeOperationsPage"));
const MyProfilePage = lazyLoad(() => import("@features/profile/pages/MyProfilePage"));
const NotificationPage = lazyLoad(() => import("@features/notification/pages/NotificationPage"));
const AttendancePage = lazyLoad(() => import("@features/attendance/pages/AttendancePage"));

export const routeConfig = [
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
  { path: ROUTES.HEAD_OFFICES.ROOT, element: AllHeadOfficesPage, roles: [ROLES.COMPANY_OWNER], },
  { path: ROUTES.HEAD_OFFICES.CREATE, element: CreateHeadOfficePage,roles: [ROLES.COMPANY_OWNER] },

  //Projects Routes
  { path: ROUTES.PROJECTS.ROOT, element: AllProjectsPage, roles: [ROLES.COMPANY_OWNER] },
  { path: ROUTES.PROJECTS.CREATE, element: CreateProjectPage, roles: [ROLES.COMPANY_OWNER] },

  //Sites Routes
  { path: ROUTES.SITES.ROOT, element: AllSitesPage, roles: [ROLES.COMPANY_OWNER] },
  { path: ROUTES.SITES.CREATE, element: CreateSitePage, roles: [ROLES.COMPANY_OWNER] },

  // Departments Routes
  { path: ROUTES.DEPARTMENTS.ROOT, element: AllDepartmentsPage, roles: [ROLES.COMPANY_OWNER] },
  { path: ROUTES.DEPARTMENTS.CREATE, element: CreateDepartmentPage, roles: [ROLES.COMPANY_OWNER] },
  { path: ROUTES.DEPARTMENTS.OPERATIONS, element: DepartmentOperationsPage },

  // Employees Routes
  { path: ROUTES.EMPLOYEES.ROOT, element: AllEmployeesPage, roles: [ROLES.COMPANY_OWNER] },
  { path: ROUTES.EMPLOYEES.CREATE, element: CreateEmployeePage, roles: [ROLES.COMPANY_OWNER] },
  { path: ROUTES.EMPLOYEES.MEMBERSHIPS, element: EmployeeMembershipPage, roles: [ROLES.COMPANY_OWNER] },
  { path: ROUTES.EMPLOYEES.ROLES, element: EmployeeRoleAssignmentPage, roles: [ROLES.COMPANY_OWNER] },
  { path: ROUTES.EMPLOYEES.OPERATIONS, element: EmployeeOperationsPage, roles: [ROLES.COMPANY_OWNER] },

  // Attendance Routes
  { path: ROUTES.ATTENDANCE.ROOT, element: AttendancePage },

  // Notifications Routes
  { path: ROUTES.NOTIFICATIONS.ROOT, element: NotificationPage, roles: [ROLES.COMPANY_OWNER] },
  
];
