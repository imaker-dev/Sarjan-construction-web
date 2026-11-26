export const ROUTES = {
  // =========================
  // HOME
  // =========================
  HOME: {
    ROOT: "/",
    ANALYTICAL: "/analytical",
  },

  PROFILE: {
    ROOT: "/my-profile",
  },

  // =========================
  // COMPANIES
  // =========================
  COMPANIES: {
    ROOT: "/companies",
    CREATE: "/companies/create",
    DETAILS: "/companies/:id",
    EDIT: "/companies/:id/edit",
    VERIFY: "/verify-company",
    DELEGATIONS: "/company/delegations",
  },

  // =========================
  // HEAD OFFICES
  // =========================
  HEAD_OFFICES: {
    ROOT: "/head-offices",
    CREATE: "/head-offices/create",
    DETAILS: "/head-offices/:id",
    EDIT: "/head-offices/create",
  },

  // =========================
  // PROJECTS
  // =========================
  PROJECTS: {
    ROOT: "/projects",
    CREATE: "/projects/create",
    DETAILS: "/projects/details",
    EDIT: "/projects/create",
  },

  // =========================
  // SITES
  // =========================
  SITES: {
    ROOT: "/sites",
    CREATE: "/sites/create",
    DETAILS: "/sites/details",
    EDIT: "/sites/:id/edit",
  },

  // =========================
  // OPERATIONS
  // =========================
  OPERATIONS: {
    ROOT: "/operations",
    CREATE: "/operations/create",
    DETAILS: "/operations/:id",
    EDIT: "/operations/:id/edit",
  },

  DEPARTMENTS: {
    ROOT: "/departments",
    CREATE: "/departments/create",
    DETAILS: "/departments/details",
    EDIT: "/departments/create",
    OPERATIONS: "/departments/operations",
  },

  SCHEDULES: {
    ROOT: "/schedules",
    CREATE: "/schedules/create",
    DETAILS: "/schedules/details",
  },

  // =========================
  // EMPLOYEES
  // =========================
  EMPLOYEES: {
    ROOT: "/employees",
    CREATE: "/employees/create",
    DETAILS: "/employees/:id",
    EDIT: "/employees/:id/edit",
    MEMBERSHIPS: "/employees/membership",
    ROLES: "/employees/role-assignments",
    OPERATIONS: "/employees/operations",
    DOCUMENTS: "/employees/documents",
    VERIFY: "/verify-employee",
  },

  // =========================
  // APPS
  // =========================
  APPS: {
    CHAT: "/chat",
    CALENDAR: "/calendar",
    EMAIL: "/email",
    KANBAN: "/kanban",

    USER_PROFILE: {
      ROOT: "/user-profile",
      PROFILE: "/user-profile",
      SETTINGS: "/user-profile/settings",
    },

    ECOMMERCE: {
      ROOT: "/ecommerce",
      PRODUCTS: "/ecommerce/products",
      PRODUCT_DETAILS: (id) => `/ecommerce/products/${id}`,
      ORDERS: "/ecommerce/orders",
    },

    CONTACTS: "/contacts",
    COURSES: "/courses",
    EMPLOYEE: "/employee",
    NOTES: "/notes",
    TICKETS: "/tickets",
    CONTACT_LIST: "/contact-list",
    INVOICE: "/invoice",
    TODO: "/todo",
  },

  // =========================
  // AUTH
  // =========================
  AUTH: {
    ROOT: "/auth",
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },

  THEME: {
    ROOT: "/themes",
  },

  // =========================
  // PLATFORM ADMIN
  // =========================
  PLATFORM: {
    ROOT: "/platform",
    COMPANIES: "/platform/companies",
    COMPANY_CREATE: "/platform/companies/create",
    COMPANY_DETAILS: "/platform/companies/:companyId",
    OPERATIONS: "/platform/operations",
  },

  // =========================
  // ATTENDANCE
  // =========================
  ATTENDANCE: {
    ROOT: "/attendance",
    POLICIES: "/policies",
    POLICY_DETAILS: "/policies/policy",
    CREATE_POLICY: "/policies/create",
    UPDATE_POLICY: "/policies/create",
    DAILY_REPORTS: "/daily-reports",
    DAILY_REPORT_DETAILS: "/daily-reports/:id",
    MUSTER_ROLL: "/daily-reports?tab=muster-roll",
  },

  // =========================
  // DAILY REPORTS (CENTRAL FINANCE & SITE AUDIT)
  // =========================
  DAILY_REPORTS: {
    ROOT: "/daily-reports",
    DETAILS: "/daily-reports/:id",
    MUSTER_ROLL: "/daily-reports?tab=muster-roll",
  },

  // =========================
  // LEAVE
  // =========================
  LEAVE: {
    ROOT: "/leave",
  },

  // =========================
  // NOTIFICATION
  // =========================
  NOTIFICATIONS: {
    ROOT: "/notifications",
  },
};
