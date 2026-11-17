import { ROLES } from "@constants/roles";
import { ROUTES } from "@constants/routes";

import {
  IconLayoutDashboard,
  IconShoppingBag,
  IconUsers,
  IconListCheck,
  IconBuilding,
  IconBuildingSkyscraper,
  IconBriefcase,
  IconMapPin,
} from "@tabler/icons-react";

export const NAV_CONFIG = [
  {
    section: "HOME",

    items: [
      {
        title: "Dashboard",
        icon: IconLayoutDashboard,
        path: ROUTES.HOME.ROOT,
      },

      {
        title: "Analytical",
        icon: IconLayoutDashboard,
        path: ROUTES.HOME.ANALYTICAL,
      },

      {
        title: "eCommerce",
        icon: IconShoppingBag,
        path: ROUTES.HOME.ECOMMERCE,
      },
    ],
  },

  {
    section: "PLATFORM",
    items: [
      {
        title: "Companies",
        icon: IconBuilding,
        path: ROUTES.COMPANIES.ROOT,
        roles: [ROLES.PLATFORM_ADMIN],
      },
      {
        title: "Master Operations",
        icon: IconListCheck,
        path: ROUTES.OPERATIONS.ROOT,
        roles: [ROLES.PLATFORM_ADMIN],
      },
    ],
  },

  {
    section: "ORGANIZATION",
    items: [
      {
        title: "Head Offices",
        icon: IconBuildingSkyscraper,
        path: ROUTES.HEAD_OFFICES.ROOT,
        roles: [ROLES.COMPANY_OWNER]
      },
      {
        title: "Projects",
        icon: IconBriefcase,
        path: ROUTES.PROJECTS.ROOT,
        roles: [ROLES.COMPANY_OWNER]
      },
      {
        title: "Sites",
        icon: IconMapPin,
        path: ROUTES.SITES.ROOT,
        roles: [ROLES.COMPANY_OWNER]
      },
      {
        title: "Departments",
        icon: IconBuilding,
        path: ROUTES.DEPARTMENTS.ROOT,
        roles: [ROLES.COMPANY_OWNER]
      },
      {
        title: "Employees",
        icon: IconUsers,
        path: ROUTES.EMPLOYEES.ROOT,
        roles: [ROLES.COMPANY_OWNER]
        //  badge: {
        //   text: "New",
        //   color: "primary",
        // },
      },
    ],
  },
];
