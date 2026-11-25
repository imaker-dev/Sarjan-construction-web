import { PERMISSIONS } from "@constants/permissions";
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
  IconClockCheck,
  IconReportAnalytics,
  IconClipboardList,
  IconShieldCog,
  IconCalendarTime,
  IconShieldCheck,
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
        permissions: [PERMISSIONS.HEAD_OFFICE.READ],
      },
      {
        title: "Projects",
        icon: IconBriefcase,
        path: ROUTES.PROJECTS.ROOT,
        permissions: [PERMISSIONS.PROJECT.READ],
      },
      {
        title: "Sites",
        icon: IconMapPin,
        path: ROUTES.SITES.ROOT,
        permissions: [PERMISSIONS.SITE.READ],
      },
      {
        title: "Departments",
        icon: IconBuilding,
        path: ROUTES.DEPARTMENTS.ROOT,
        permissions: [PERMISSIONS.DEPARTMENT.READ],
      },
      {
        title: "Employees",
        icon: IconUsers,
        path: ROUTES.EMPLOYEES.ROOT,
        permissions: [PERMISSIONS.EMPLOYEE.READ],
        //  badge: {
        //   text: "New",
        //   color: "primary",
        // },
      },
      {
        title: "Work Schedules",
        icon: IconCalendarTime,
        path: ROUTES.SCHEDULES.ROOT,
        permissions: [PERMISSIONS.WORK_SCHEDULE.READ],
      },
    ],
  },
  {
    section: "ATTENDANCE & REPORTING",
    items: [
      {
        title: "Attendance",
        icon: IconClockCheck,
        path: ROUTES.ATTENDANCE.ROOT,
        permissions: [PERMISSIONS.ATTENDANCE.READ],
      },
      {
        title: "Daily Reports",
        icon: IconReportAnalytics,
        path: ROUTES.DAILY_REPORTS.ROOT,
        permissions: [PERMISSIONS.ATTENDANCE.READ],
      },
      {
        title: "Attendance Policies",
        icon: IconShieldCheck,
        path: ROUTES.ATTENDANCE.POLICIES,
        permissions: [PERMISSIONS.ATTENDANCE.MANAGE],
      }
    ],
  },
];
