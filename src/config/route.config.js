import { ROUTES } from "@constants/routes";
import DashboardPage from "@features/dashboard/pages/DashboardPage";
import AllDepartmentsPage from "@features/departments/pages/AllDepartmentsPage";
import CreateDepartmentPage from "@features/departments/pages/CreateDepartmentPage";
import DepartmentOperationsPage from "@features/departments/pages/DepartmentOperationsPage";
import AllEmployeesPage from "@features/employees/pages/AllEmployeesPage";
import CreateEmployeePage from "@features/employees/pages/CreateEmployeePage";
import ThemeSelectionPage from "@features/theme/pages/ThemeSelectionPage";
import CompaniesListPage from "@features/platform/pages/CompaniesListPage";
import CompanyDetailsPage from "@features/platform/pages/CompanyDetailsPage";
import MasterOperationsPage from "@features/platform/pages/MasterOperationsPage";
import AllOperationsPage from "@features/operations/pages/AllOperationsPage";
import AllCompaniesPage from "@features/companies/pages/AllCompaniesPage";
import CreateCompanyPage from "@features/companies/pages/CreateCompanyPage";
import VerifyCompanyPage from "@features/companies/pages/VerifyCompanyPage";
import AllHeadOfficesPage from "@features/head-offices/pages/AllHeadOfficesPage";
import CreateHeadOfficePage from "@features/head-offices/pages/CreateHeadOfficePage";
import AllProjectsPage from "@features/projects/pages/AllProjectsPage";
import CreateProjectPage from "@features/projects/pages/CreateProjectPage";
import AllSitesPage from "@features/sites/pages/AllSitesPage";
import CreateSitePage from "@features/sites/pages/CreateSitePage";
import { ROLES } from "@constants/roles";
import EmployeeMembershipPage from "@features/employees/pages/EmployeeMembershipPage";
import EmployeeRoleAssignmentPage from "@features/employees/pages/EmployeeRoleAssignmentPage";
import EmployeeOperationsPage from "@features/employees/pages/EmployeeOperationsPage";

export const routeConfig = [
  {
    path: ROUTES.HOME.ROOT,
    element: DashboardPage,
    // roles: [ROLES.MASTER, ROLES.SUPER_ADMIN],
    // permissions: [PERMISSIONS.VIEW_DASHBOARD],
    // public: true
  },
  { path: ROUTES.THEME.ROOT, element: ThemeSelectionPage },

  // platform admin Routes
  { path: ROUTES.PLATFORM.COMPANIES, element: CompaniesListPage },
  // { path: ROUTES.PLATFORM.COMPANY_CREATE, element: CreateCompanyPage },
  { path: ROUTES.PLATFORM.COMPANY_DETAILS, element: CompanyDetailsPage },
  { path: ROUTES.PLATFORM.OPERATIONS, element: MasterOperationsPage },

  // Company Routes
  { path: ROUTES.COMPANIES.ROOT, element: AllCompaniesPage, roles: [ROLES.PLATFORM_ADMIN], },
  { path: ROUTES.COMPANIES.CREATE, element: CreateCompanyPage, roles: [ROLES.PLATFORM_ADMIN], },
  { path: ROUTES.COMPANIES.VERIFY, element: VerifyCompanyPage, roles: [ROLES.PLATFORM_ADMIN], },

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
];
