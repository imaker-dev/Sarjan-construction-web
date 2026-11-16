export const ROUTES = {
  // =========================
  // HOME
  // =========================
  HOME: {
    ROOT: "/",
    ANALYTICAL: "/analytical",
    ECOMMERCE: "/ecommerce",
    FRONTEND_PAGES: "/frontend-pages",
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
    DETAILS: "/departments/:id",
    EDIT: "/departments/:id/edit",
    OPERATIONS: "/departments/operations",
  },

  // =========================
  // EMPLOYEES
  // =========================
  EMPLOYEES: {
    ROOT: "/employees",
    CREATE: "/employees/create",
    DETAILS: "/employees/:id",
    EDIT: "/employees/:id/edit",
    VERIFY: "/verify-employee"
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
};
