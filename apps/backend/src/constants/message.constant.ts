/* ───────── Auth ───────── */
export const AUTH_MESSAGES = {
  REGISTERED: "Account created successfully",
  LOGGED_IN: "Logged in successfully",
  LOGGED_OUT: "Logged out successfully",
  TOKEN_REFRESHED: "Token refreshed successfully",
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_ALREADY_EXISTS: "User with this email already exists",
  USER_NOT_FOUND: "User not found",
  UNAUTHORIZED: "Unauthorized — please log in",
  TOKEN_EXPIRED: "Token expired",
  INVALID_TOKEN: "Invalid token",
  ACCOUNT_INACTIVE: "Account is inactive",
} as const;

/* ───────── Users ───────── */
export const USER_MESSAGES = {
  FETCHED: "User fetched successfully",
  USERS_FETCHED: "Users fetched successfully",
  UPDATED: "User updated successfully",
  DELETED: "User deleted successfully",
  NOT_FOUND: "User not found",
} as const;

/* ───────── Vehicles ───────── */
export const VEHICLE_MESSAGES = {
  CREATED: "Vehicle registered successfully",
  FETCHED: "Vehicle fetched successfully",
  VEHICLES_FETCHED: "Vehicles fetched successfully",
  UPDATED: "Vehicle updated successfully",
  DELETED: "Vehicle deleted successfully",
  NOT_FOUND: "Vehicle not found",
  REG_NUMBER_EXISTS: "Vehicle with this registration number already exists",
  CANNOT_DISPATCH: "Retired or In-Shop vehicles cannot be dispatched",
  ALREADY_ON_TRIP: "Vehicle is already on a trip",
  RETIRED: "Vehicle is retired and cannot be used",
} as const;

/* ───────── Drivers ───────── */
export const DRIVER_MESSAGES = {
  CREATED: "Driver registered successfully",
  FETCHED: "Driver fetched successfully",
  DRIVERS_FETCHED: "Drivers fetched successfully",
  UPDATED: "Driver updated successfully",
  DELETED: "Driver deleted successfully",
  NOT_FOUND: "Driver not found",
  LICENSE_EXISTS: "Driver with this license number already exists",
  LICENSE_EXPIRED: "Driver's license is expired — cannot be assigned to a trip",
  SUSPENDED: "Driver is suspended — cannot be assigned to a trip",
  ALREADY_ON_TRIP: "Driver is already on a trip",
} as const;

/* ───────── Trips ───────── */
export const TRIP_MESSAGES = {
  CREATED: "Trip created successfully",
  FETCHED: "Trip fetched successfully",
  TRIPS_FETCHED: "Trips fetched successfully",
  DISPATCHED: "Trip dispatched successfully",
  COMPLETED: "Trip completed successfully",
  CANCELLED: "Trip cancelled successfully",
  UPDATED: "Trip updated successfully",
  DELETED: "Trip deleted successfully",
  NOT_FOUND: "Trip not found",
  OVERWEIGHT: "Cargo weight exceeds vehicle's maximum load capacity",
  CANNOT_DISPATCH: "Only DRAFT trips can be dispatched",
  CANNOT_COMPLETE: "Only DISPATCHED trips can be completed",
  CANNOT_CANCEL: "Only DRAFT or DISPATCHED trips can be cancelled",
} as const;

/* ───────── Maintenance ───────── */
export const MAINTENANCE_MESSAGES = {
  CREATED: "Maintenance record created — vehicle status set to In Shop",
  FETCHED: "Maintenance record fetched successfully",
  LOGS_FETCHED: "Maintenance logs fetched successfully",
  CLOSED: "Maintenance closed — vehicle restored to Available",
  UPDATED: "Maintenance record updated successfully",
  DELETED: "Maintenance record deleted successfully",
  NOT_FOUND: "Maintenance record not found",
  ALREADY_CLOSED: "Maintenance record is already closed",
  VEHICLE_RETIRED: "Cannot close maintenance — vehicle is retired",
} as const;

/* ───────── Fuel Logs ───────── */
export const FUEL_MESSAGES = {
  CREATED: "Fuel log recorded successfully",
  FETCHED: "Fuel log fetched successfully",
  LOGS_FETCHED: "Fuel logs fetched successfully",
  UPDATED: "Fuel log updated successfully",
  DELETED: "Fuel log deleted successfully",
  NOT_FOUND: "Fuel log not found",
} as const;

/* ───────── Expenses ───────── */
export const EXPENSE_MESSAGES = {
  CREATED: "Expense recorded successfully",
  FETCHED: "Expense fetched successfully",
  EXPENSES_FETCHED: "Expenses fetched successfully",
  UPDATED: "Expense updated successfully",
  DELETED: "Expense deleted successfully",
  NOT_FOUND: "Expense not found",
} as const;

/* ───────── Analytics ───────── */
export const ANALYTICS_MESSAGES = {
  DASHBOARD_FETCHED: "Dashboard KPIs fetched successfully",
  REPORT_FETCHED: "Analytics report fetched successfully",
} as const;

/* ───────── Generic ───────── */
export const ERROR_MESSAGES = {
  VALIDATION_ERROR: "Validation failed",
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden — insufficient permissions",
  INTERNAL_ERROR: "Internal server error",
} as const;
