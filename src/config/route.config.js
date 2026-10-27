import { ROUTES } from "@constants/routes";
import DashboardPage from "@features/dashboard/pages/DashboardPage";
import ThemeSelectionPage from "@features/theme/pages/ThemeSelectionPage";
import AllUsersPage from "@features/users/pages/AllUsersPage";

export const routeConfig = [
  {
    path: ROUTES.HOME.ROOT,
    element: DashboardPage,
    // roles: [ROLES.MASTER, ROLES.SUPER_ADMIN],
    // permissions: [PERMISSIONS.VIEW_DASHBOARD],
    // public: true
  },
  { path: ROUTES.USER.ROOT, element: AllUsersPage, },
  { path: ROUTES.THEME.ROOT, element: ThemeSelectionPage, },
];
