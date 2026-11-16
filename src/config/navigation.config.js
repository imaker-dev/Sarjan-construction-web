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
      },
      {
        title: "Master Operations",
        icon: IconListCheck,
        path: ROUTES.OPERATIONS.ROOT,
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
      },
      {
        title: "Projects",
        icon: IconBriefcase,
        path: ROUTES.PROJECTS.ROOT,
      },
      {
        title: "Sites",
        icon: IconMapPin,
        path: ROUTES.SITES.ROOT,
      },
      {
        title: "Departments",
        icon: IconBuilding,
        path: ROUTES.DEPARTMENTS.ROOT,
      },
      {
        title: "Employees",
        icon: IconUsers,
        path: ROUTES.EMPLOYEES.ROOT,
        //  badge: {
        //   text: "New",
        //   color: "primary",
        // },
      },
    ],
  },
];
