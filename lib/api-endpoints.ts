// API Endpoints constants for better maintainability
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },

  // Ideas
  IDEAS: {
    LIST: "/ideas",
    CREATE: "/ideas",
    VOTE: (id: string) => `/ideas/${id}/vote`,
    REPORT: (id: string) => `/ideas/${id}/report`,
    UPDATE: (id: string) => `/ideas/${id}`,
    DELETE: (id: string) => `/ideas/${id}`,
  },

  // Users
  USERS: {
    LIST: "/users",
    ME: "/users/me",
    MY_VOTES: "/users/me/votes",
    UPDATE_ROLE: (id: string) => `/users/${id}/role`,
    PROFILE: (id: string) => `/users/${id}`,
  },

  // Admin
  ADMIN: {
    STATS: "/admin/stats",
    REPORTS: "/admin/reports",
    SETTINGS: "/admin/settings",
  },
} as const
