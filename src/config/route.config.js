import { ROUTES } from "@constants/routes";
import DashboardPage from "@features/dashboard/pages/DashboardPage";
import AllDepartmentsPage from "@features/departments/pages/AllDepartmentsPage";
import CreateDepartmentPage from "@features/departments/pages/CreateDepartmentPage";
import DepartmentOperationsPage from "@features/departments/pages/DepartmentOperationsPage";
import AllEmployeesPage from "@features/employees/pages/AllEmployeesPage";
import CreateEmployeePage from "@features/employees/pages/CreateEmployeePage";
import CreateOnboardingPage from "@features/onboard/pages/CreateOnboardingPage";
import OnboardingsPage from "@features/onboard/pages/OnboardingsPage";
import VerifyOnboardingPage from "@features/onboard/pages/VerifyOnboardingPage";
import ThemeSelectionPage from "@features/theme/pages/ThemeSelectionPage";
import AllUsersPage from "@features/users/pages/AllUsersPage";
import CompaniesListPage from "@features/platform/pages/CompaniesListPage";
import CreateCompanyPage from "@features/platform/pages/CreateCompanyPage";
import CompanyDetailsPage from "@features/platform/pages/CompanyDetailsPage";
import MasterOperationsPage from "@features/platform/pages/MasterOperationsPage";

export const routeConfig = [
  {
    path: ROUTES.HOME.ROOT,
    element: DashboardPage,
    // roles: [ROLES.MASTER, ROLES.SUPER_ADMIN],
    // permissions: [PERMISSIONS.VIEW_DASHBOARD],
    // public: true
  },
  { path: ROUTES.USER.ROOT, element: AllUsersPage },
  { path: ROUTES.THEME.ROOT, element: ThemeSelectionPage },

  // platform admin routes
  { path: ROUTES.PLATFORM.COMPANIES, element: CompaniesListPage },
  { path: ROUTES.PLATFORM.COMPANY_CREATE, element: CreateCompanyPage },
  { path: ROUTES.PLATFORM.COMPANY_DETAILS, element: CompanyDetailsPage },
  { path: ROUTES.PLATFORM.OPERATIONS, element: MasterOperationsPage },

  { path: ROUTES.ONBOARDING.ROOT, element: OnboardingsPage },
  { path: ROUTES.ONBOARDING.CREATE, element: CreateOnboardingPage },
  { path: ROUTES.ONBOARDING.VERIFY, element: VerifyOnboardingPage },

  // departments routes
  { path: ROUTES.DEPARTMENTS.ROOT, element: AllDepartmentsPage },
  { path: ROUTES.DEPARTMENTS.CREATE, element: CreateDepartmentPage },

  // operations route
  { path: ROUTES.DEPARTMENTS.OPERATIONS, element: DepartmentOperationsPage },

  // employees routes
  { path: ROUTES.EMPLOYEES.ROOT, element: AllEmployeesPage },
  { path: ROUTES.EMPLOYEES.CREATE, element: CreateEmployeePage }
];
