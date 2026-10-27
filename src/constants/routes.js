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

  // USERS 
  USER:{
    ROOT: "/users",
  },

  THEME: {
    ROOT: "/themes",
  },
};