import { ROUTES } from "@constants/routes";

import {
  IconLayoutDashboard,
  IconShoppingBag,
  IconLayout,
  IconMessageCircle,
  IconCalendar,
  IconMail,
  IconUser,
  IconShoppingCart,
  IconPhone,
  IconBook,
  IconUsers,
  IconFileText,
  IconTicket,
  IconAddressBook,
  IconReceipt,
  IconListCheck,
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

      {
        title: "Frontend pages",
        icon: IconLayout,
        children: [
          {
            title: "Landing Page",
            path: ROUTES.HOME.FRONTEND_PAGES.LANDING,
          },
          {
            title: "Pricing",
            path: ROUTES.HOME.FRONTEND_PAGES.PRICING,
          },
        ],
      },
    ],
  },

  {
    section: "APPS",

    items: [
      {
        title: "Chat",
        icon: IconMessageCircle,
        path: ROUTES.APPS.CHAT,
      },

      {
        title: "Calendar",
        icon: IconCalendar,
        path: ROUTES.APPS.CALENDAR,
      },

      {
        title: "Email",
        icon: IconMail,
        path: ROUTES.APPS.EMAIL,
      },

      {
        title: "User Profile",
        icon: IconUser,
        badge: {
          text: "New",
          color: "primary",
        },
        children: [
          {
            title: "Profile",
            path: ROUTES.APPS.USER_PROFILE.PROFILE,
          },
          {
            title: "Followers",
            path: ROUTES.APPS.USER_PROFILE.FOLLOWERS,
          },
        ],
      },

      {
        title: "Ecommerce",
        icon: IconShoppingCart,
      
        children: [
          {
            title: "Shop",
            path: ROUTES.APPS.ECOMMERCE.SHOP,
          },
          {
            title: "Checkout",
            path: ROUTES.APPS.ECOMMERCE.CHECKOUT,
          },
        ],
      },

      {
        title: "Contacts",
        icon: IconPhone,
        path: ROUTES.APPS.CONTACTS,
      },

      {
        title: "Courses",
        icon: IconBook,
        path: ROUTES.APPS.COURSES,
      },

      {
        title: "Employee",
        icon: IconUsers,
        path: ROUTES.APPS.EMPLOYEE,
      },

      {
        title: "Notes",
        icon: IconFileText,
        path: ROUTES.APPS.NOTES,
      },

      {
        title: "Tickets",
        icon: IconTicket,
        path: ROUTES.APPS.TICKETS,
      },

      {
        title: "Contact List",
        icon: IconAddressBook,
        path: ROUTES.APPS.CONTACT_LIST,
      },

      {
        title: "Invoice",
        icon: IconReceipt,
        children: [
          {
            title: "List",
            path: ROUTES.APPS.INVOICE.LIST,
          },
          {
            title: "Create",
            path: ROUTES.APPS.INVOICE.CREATE,
          },
        ],
      },

      {
        title: "ToDo",
        icon: IconListCheck,
        path: ROUTES.APPS.TODO,
      },
    ],
  },
];