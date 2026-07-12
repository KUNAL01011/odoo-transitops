export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },

  dashboard: (filters?: Record<string, unknown>) =>
    ["dashboard", filters] as const,

  vehicles: {
    all: ["vehicles"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["vehicles", "list", filters] as const,
    available: ["vehicles", "available"] as const,
    detail: (id: number) => ["vehicles", "detail", id] as const,
    history: (id: number) => ["vehicles", "detail", id, "history"] as const,
    operationalCost: (id: number) =>
      ["vehicles", "detail", id, "operational-cost"] as const,
  },

  drivers: {
    all: ["drivers"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["drivers", "list", filters] as const,
    available: ["drivers", "available"] as const,
    detail: (id: number) => ["drivers", "detail", id] as const,
  },

  trips: {
    all: ["trips"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["trips", "list", filters] as const,
    detail: (id: number) => ["trips", "detail", id] as const,
  },

  maintenance: {
    all: ["maintenance"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["maintenance", "list", filters] as const,
    detail: (id: number) => ["maintenance", "detail", id] as const,
  },

  fuelLogs: {
    all: ["fuel-logs"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["fuel-logs", "list", filters] as const,
  },

  expenses: {
    all: ["expenses"] as const,
    list: (filters?: Record<string, unknown>) =>
      ["expenses", "list", filters] as const,
  },

  analytics: {
    summary: (filters?: Record<string, unknown>) =>
      ["analytics", "summary", filters] as const,
    monthlyTrend: ["analytics", "monthly-trend"] as const,
    topMaintenanceVehicles: ["analytics", "top-maintenance-vehicles"] as const,
  },

  settings: {
    general: ["settings", "general"] as const,
    rbac: ["settings", "rbac"] as const,
  },

  notifications: {
    all: ["notifications"] as const,
  },
};
