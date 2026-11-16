import { ROUTES } from "@constants/routes";
import DashboardPage from "@features/dashboard/pages/DashboardPage";
import AllDepartmentsPage from "@features/departments/pages/AllDepartmentsPage";
import CreateDepartmentPage from "@features/departments/pages/CreateDepartmentPage";
import DepartmentOperationsPage from "@features/departments/pages/DepartmentOperationsPage";
import AllEmployeesPage from "@features/employees/pages/AllEmployeesPage";
import CreateEmployeePage from "@features/employees/pages/CreateEmployeePage";
import ThemeSelectionPage from "@features/theme/pages/ThemeSelectionPage";
import CompaniesListPage from "@features/platform/pages/CompaniesListPage";
// import CreateCompanyPage from "@features/platform/pages/CreateCompanyPage";
import CompanyDetailsPage from "@features/platform/pages/CompanyDetailsPage";
import MasterOperationsPage from "@features/platform/pages/MasterOperationsPage";
import AllOperationsPage from "@features/operations/pages/AllOperationsPage";
import AllCompaniesPage from "@features/companies/pages/AllCompaniesPage";
import CreateCompanyPage from "@features/companies/pages/CreateCompanyPage";
import VerifyCompanyPage from "@features/companies/pages/VerifyCompanyPage";

export const routeConfig = [
  {
    path: ROUTES.HOME.ROOT,
    element: DashboardPage,
    // roles: [ROLES.MASTER, ROLES.SUPER_ADMIN],
    // permissions: [PERMISSIONS.VIEW_DASHBOARD],
    // public: true
  },
  { path: ROUTES.THEME.ROOT, element: ThemeSelectionPage },

  // platform admin routes
  { path: ROUTES.PLATFORM.COMPANIES, element: CompaniesListPage },
  // { path: ROUTES.PLATFORM.COMPANY_CREATE, element: CreateCompanyPage },
  { path: ROUTES.PLATFORM.COMPANY_DETAILS, element: CompanyDetailsPage },
  { path: ROUTES.PLATFORM.OPERATIONS, element: MasterOperationsPage },

  // Company routes
  { path: ROUTES.COMPANIES.ROOT, element: AllCompaniesPage },
  { path: ROUTES.COMPANIES.CREATE, element: CreateCompanyPage },
  { path: ROUTES.COMPANIES.VERIFY, element: VerifyCompanyPage },

  // Operations routes
  { path: ROUTES.OPERATIONS.ROOT, element: AllOperationsPage },

  // Departments routes
  { path: ROUTES.DEPARTMENTS.ROOT, element: AllDepartmentsPage },
  { path: ROUTES.DEPARTMENTS.CREATE, element: CreateDepartmentPage },

  // operations route
  { path: ROUTES.DEPARTMENTS.OPERATIONS, element: DepartmentOperationsPage },

  // employees routes
  { path: ROUTES.EMPLOYEES.ROOT, element: AllEmployeesPage },
  { path: ROUTES.EMPLOYEES.CREATE, element: CreateEmployeePage },
];
