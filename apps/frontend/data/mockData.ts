import type {
  Role,
  UserStatus,
  VehicleType,
  VehicleStatus,
  LicenseCategory,
  DriverStatus,
  TripStatus,
  MaintenanceStatus,
  ExpenseType,
  NotificationType,
  AppModule,
  User,
  Vehicle,
  Driver,
  Trip,
  MaintenanceLog,
  FuelLog,
  Expense,
  Notification,
  RolePermission,
  SystemSettings,
  ApiResponseShape
} from "../src/types/type";

// ---------------------------------------------------------------
// USERS — one per role, matches Screen 0's "One login, Four roles"
// ---------------------------------------------------------------

export const mockUsers: User[] = [
  { id: 1, name: "Raven K.", email: "raven.k@transitops.in", role: "DISPATCHER", status: "ACTIVE" },
  { id: 2, name: "Kavya Nair", email: "kavya.nair@transitops.in", role: "FLEET_MANAGER", status: "ACTIVE" },
  { id: 3, name: "Meera Iyer", email: "meera.iyer@transitops.in", role: "SAFETY_OFFICER", status: "ACTIVE" },
  { id: 4, name: "Arjun Mehta", email: "arjun.mehta@transitops.in", role: "FINANCIAL_ANALYST", status: "ACTIVE" },
];

// ---------------------------------------------------------------
// VEHICLES — 6 total, one of each status so every badge color renders
// ---------------------------------------------------------------

export const mockVehicles: Vehicle[] = [
  { id: 1, regNo: "GJ01AB4521", name: "VAN-05", type: "VAN", maxLoadCapacity: 500, odometer: 74000, acquisitionCost: 620000, status: "ON_TRIP" },
  { id: 2, regNo: "GJ01AB9978", name: "TRUCK-01", type: "TRUCK", maxLoadCapacity: 5000, odometer: 182000, acquisitionCost: 2450000, status: "AVAILABLE" },
  { id: 3, regNo: "GJ01AB8120", name: "MINI-03", type: "MINI_TRUCK", maxLoadCapacity: 1000, odometer: 66000, acquisitionCost: 410000, status: "IN_SHOP" },
  { id: 4, regNo: "GJ01AB0078", name: "VAN-09", type: "VAN", maxLoadCapacity: 750, odometer: 241900, acquisitionCost: 590000, status: "RETIRED" },
  { id: 5, regNo: "GJ05CD3345", name: "TRUCK-04", type: "TRUCK", maxLoadCapacity: 7000, odometer: 95000, acquisitionCost: 2800000, status: "ON_TRIP" },
  { id: 6, regNo: "GJ01EF6610", name: "VAN-12", type: "VAN", maxLoadCapacity: 500, odometer: 12000, acquisitionCost: 640000, status: "AVAILABLE" },
];

// ---------------------------------------------------------------
// DRIVERS — includes one expired-license + one suspended, on purpose,
// so the "blocked from trip assignment" rule has something to show
// ---------------------------------------------------------------

export const mockDrivers: Driver[] = [
  { id: 1, name: "Alex", licenseNumber: "DL-88213", licenseCategory: "LMV", licenseExpiry: "2027-12-01", contactNumber: "+91-9876500001", safetyScore: 96, tripCompletions: 145, status: "ON_TRIP" },
  { id: 2, name: "John", licenseNumber: "DL-44120", licenseCategory: "HMV", licenseExpiry: "2025-03-20", contactNumber: "+91-9922000002", safetyScore: 58, tripCompletions: 91, status: "SUSPENDED" },
  { id: 3, name: "Priya Verma", licenseNumber: "DL-77031", licenseCategory: "LMV", licenseExpiry: "2026-08-15", contactNumber: "+91-9911000003", safetyScore: 99, tripCompletions: 210, status: "ON_TRIP" },
  { id: 4, name: "Suresh", licenseNumber: "DL-90045", licenseCategory: "HMV", licenseExpiry: "2027-01-10", contactNumber: "+91-9744000004", safetyScore: 88, tripCompletions: 132, status: "OFF_DUTY" },
  { id: 5, name: "Divya Rao", licenseNumber: "DL-55210", licenseCategory: "LMV", licenseExpiry: "2026-11-01", contactNumber: "+91-9812000005", safetyScore: 92, tripCompletions: 60, status: "AVAILABLE" },
];

// ---------------------------------------------------------------
// TRIPS — one of each status: Draft, Dispatched, Completed, Cancelled
// ---------------------------------------------------------------

export const mockTrips: Trip[] = [
  { id: 1, tripCode: "TR001", source: "Gandhinagar Depot", destination: "Ahmedabad Hub", vehicleId: 1, driverId: 1, cargoWeight: 450, plannedDistance: 38, finalOdometer: null, fuelConsumedLiters: null, status: "DISPATCHED", cancellationReason: null, dispatchedAt: "2026-07-12T08:05:00Z", completedAt: null, cancelledAt: null },
  { id: 2, tripCode: "TR002", source: "Vatva Industrial Area", destination: "Sanand Warehouse", vehicleId: 5, driverId: 3, cargoWeight: 3200, plannedDistance: 120, finalOdometer: null, fuelConsumedLiters: null, status: "DISPATCHED", cancellationReason: null, dispatchedAt: "2026-07-12T06:30:00Z", completedAt: null, cancelledAt: null },
  { id: 3, tripCode: "TR003", source: "Naroda Depot", destination: "Vastral Yard", vehicleId: null, driverId: null, cargoWeight: 300, plannedDistance: 15, finalOdometer: null, fuelConsumedLiters: null, status: "DRAFT", cancellationReason: null, dispatchedAt: null, completedAt: null, cancelledAt: null },
  { id: 4, tripCode: "TR004", source: "Manasa", destination: "Kalol Depot", vehicleId: 3, driverId: 5, cargoWeight: 600, plannedDistance: 42, finalOdometer: null, fuelConsumedLiters: null, status: "CANCELLED", cancellationReason: "Vehicle went to shop", dispatchedAt: "2026-07-11T09:15:00Z", completedAt: null, cancelledAt: "2026-07-11T10:00:00Z" },
  { id: 5, tripCode: "TR005", source: "Ahmedabad Hub", destination: "Gandhinagar Depot", vehicleId: 6, driverId: 4, cargoWeight: 200, plannedDistance: 38, finalOdometer: 12038, fuelConsumedLiters: 4.8, status: "COMPLETED", cancellationReason: null, dispatchedAt: "2026-07-11T07:00:00Z", completedAt: "2026-07-11T08:40:00Z", cancelledAt: null },
  { id: 6, tripCode: "TR006", source: "Sanand Warehouse", destination: "Vatva Industrial Area", vehicleId: 2, driverId: 2, cargoWeight: 4200, plannedDistance: 95, finalOdometer: 181500, fuelConsumedLiters: 42, status: "COMPLETED", cancellationReason: null, dispatchedAt: "2026-07-08T06:00:00Z", completedAt: "2026-07-08T09:20:00Z", cancelledAt: null },
  { id: 7, tripCode: "TR007", source: "Kalol Depot", destination: "Naroda Depot", vehicleId: 1, driverId: 1, cargoWeight: 380, plannedDistance: 30, finalOdometer: 73950, fuelConsumedLiters: 6.2, status: "COMPLETED", cancellationReason: null, dispatchedAt: "2026-07-10T07:30:00Z", completedAt: "2026-07-10T08:45:00Z", cancelledAt: null },
];

// ---------------------------------------------------------------
// MAINTENANCE LOGS
// ---------------------------------------------------------------

export const mockMaintenanceLogs: MaintenanceLog[] = [
  { id: 1, vehicleId: 3, serviceType: "Tyre Replace", cost: 6200, date: "2026-07-11", status: "ACTIVE", closedAt: null },
  { id: 2, vehicleId: 4, serviceType: "Engine Overhaul", cost: 18000, date: "2026-05-02", status: "COMPLETED", closedAt: "2026-05-05" },
  { id: 3, vehicleId: 2, serviceType: "Oil Change", cost: 2500, date: "2026-06-20", status: "COMPLETED", closedAt: "2026-06-21" },
  { id: 4, vehicleId: 1, serviceType: "Brake Inspection", cost: 1800, date: "2026-06-01", status: "COMPLETED", closedAt: "2026-06-02" },
];

// ---------------------------------------------------------------
// FUEL LOGS
// ---------------------------------------------------------------

export const mockFuelLogs: FuelLog[] = [
  { id: 1, vehicleId: 1, tripId: 7, liters: 22, cost: 2850, date: "2026-07-10" },
  { id: 2, vehicleId: 2, tripId: 6, liters: 85, cost: 11000, date: "2026-07-08" },
  { id: 3, vehicleId: 6, tripId: 5, liters: 18, cost: 2340, date: "2026-07-11" },
  { id: 4, vehicleId: 5, tripId: 2, liters: 60, cost: 7800, date: "2026-07-12" },
  { id: 5, vehicleId: 1, tripId: null, liters: 20, cost: 2600, date: "2026-07-05" },
];

// ---------------------------------------------------------------
// EXPENSES
// ---------------------------------------------------------------

export const mockExpenses: Expense[] = [
  { id: 1, vehicleId: 1, type: "TOLL", amount: 150, date: "2026-07-10" },
  { id: 2, vehicleId: 2, type: "TOLL", amount: 420, date: "2026-07-08" },
  { id: 3, vehicleId: 5, type: "OTHER", amount: 300, date: "2026-07-09", description: "Parking" },
  { id: 4, vehicleId: 3, type: "OTHER", amount: 1200, date: "2026-07-11", description: "Towing to service center" },
];

// ---------------------------------------------------------------
// NOTIFICATIONS
// ---------------------------------------------------------------

export const mockNotifications: Notification[] = [
  { id: 1, userId: 3, role: "SAFETY_OFFICER", type: "LICENSE_EXPIRING", message: "Driver John's HMV license expired on 20 Mar 2025 — reinstatement blocked until renewed.", isRead: false, createdAt: "2026-07-12T07:00:00Z" },
  { id: 2, userId: 1, role: "DISPATCHER", type: "TRIP_DISPATCHED", message: "TR001 dispatched — VAN-05 / Alex, ETA 45 min.", isRead: true, createdAt: "2026-07-12T08:05:00Z" },
  { id: 3, userId: 2, role: "FLEET_MANAGER", type: "MAINTENANCE_OPENED", message: "MINI-03 flagged for Tyre Replace — status set to In Shop.", isRead: false, createdAt: "2026-07-11T09:00:00Z" },
  { id: 4, userId: 4, role: "FINANCIAL_ANALYST", type: "TRIP_COMPLETED", message: "TR005 completed — fuel and odometer logged for VAN-12.", isRead: false, createdAt: "2026-07-11T08:40:00Z" },
  { id: 5, userId: 1, role: "DISPATCHER", type: "TRIP_CANCELLED", message: "TR004 cancelled — vehicle went to shop mid-dispatch.", isRead: true, createdAt: "2026-07-11T10:00:00Z" },
  { id: 6, userId: 3, role: "SAFETY_OFFICER", type: "LICENSE_EXPIRING", message: "Driver Priya Verma's license expires in 34 days (15 Aug 2026).", isRead: false, createdAt: "2026-07-12T06:00:00Z" },
];

// ---------------------------------------------------------------
// SETTINGS & RBAC MATRIX (mirrors §3 of API_DOCUMENTATION.md)
// ---------------------------------------------------------------

export const mockSettings: SystemSettings = {
  licenseAlertDays: 30,
  currency: "INR",
  distanceUnit: "km",
};

export const mockRolePermissions: RolePermission[] = [
  { role: "FLEET_MANAGER", module: "DASHBOARD", canView: true, canEdit: false },
  { role: "FLEET_MANAGER", module: "FLEET", canView: true, canEdit: true },
  { role: "FLEET_MANAGER", module: "DRIVERS", canView: true, canEdit: false },
  { role: "FLEET_MANAGER", module: "TRIPS", canView: true, canEdit: false },
  { role: "FLEET_MANAGER", module: "MAINTENANCE", canView: true, canEdit: true },
  { role: "FLEET_MANAGER", module: "FUEL_EXPENSES", canView: true, canEdit: true },
  { role: "FLEET_MANAGER", module: "ANALYTICS", canView: true, canEdit: false },
  { role: "FLEET_MANAGER", module: "SETTINGS", canView: true, canEdit: true },

  { role: "DISPATCHER", module: "DASHBOARD", canView: true, canEdit: false },
  { role: "DISPATCHER", module: "FLEET", canView: true, canEdit: false },
  { role: "DISPATCHER", module: "DRIVERS", canView: true, canEdit: false },
  { role: "DISPATCHER", module: "TRIPS", canView: true, canEdit: true },
  { role: "DISPATCHER", module: "MAINTENANCE", canView: true, canEdit: false },
  { role: "DISPATCHER", module: "FUEL_EXPENSES", canView: false, canEdit: false },
  { role: "DISPATCHER", module: "ANALYTICS", canView: true, canEdit: false },
  { role: "DISPATCHER", module: "SETTINGS", canView: false, canEdit: false },

  { role: "SAFETY_OFFICER", module: "DASHBOARD", canView: true, canEdit: false },
  { role: "SAFETY_OFFICER", module: "FLEET", canView: true, canEdit: false },
  { role: "SAFETY_OFFICER", module: "DRIVERS", canView: true, canEdit: true },
  { role: "SAFETY_OFFICER", module: "TRIPS", canView: true, canEdit: false },
  { role: "SAFETY_OFFICER", module: "MAINTENANCE", canView: true, canEdit: false },
  { role: "SAFETY_OFFICER", module: "FUEL_EXPENSES", canView: false, canEdit: false },
  { role: "SAFETY_OFFICER", module: "ANALYTICS", canView: true, canEdit: false },
  { role: "SAFETY_OFFICER", module: "SETTINGS", canView: false, canEdit: false },

  { role: "FINANCIAL_ANALYST", module: "DASHBOARD", canView: true, canEdit: false },
  { role: "FINANCIAL_ANALYST", module: "FLEET", canView: true, canEdit: false },
  { role: "FINANCIAL_ANALYST", module: "DRIVERS", canView: true, canEdit: false },
  { role: "FINANCIAL_ANALYST", module: "TRIPS", canView: true, canEdit: false },
  { role: "FINANCIAL_ANALYST", module: "MAINTENANCE", canView: true, canEdit: false },
  { role: "FINANCIAL_ANALYST", module: "FUEL_EXPENSES", canView: true, canEdit: true },
  { role: "FINANCIAL_ANALYST", module: "ANALYTICS", canView: true, canEdit: true },
  { role: "FINANCIAL_ANALYST", module: "SETTINGS", canView: false, canEdit: false },
];

// ---------------------------------------------------------------
// DASHBOARD SUMMARY — pre-aggregated, matches GET /api/dashboard
// (counts below are hand-computed from the arrays above, so they're
// internally consistent — recompute them yourself if you edit the data)
// ---------------------------------------------------------------

export const mockDashboardSummary = {
  kpis: {
    activeVehicles: 5, // excludes RETIRED
    availableVehicles: 2, // TRUCK-01, VAN-12
    vehiclesInMaintenance: 1, // MINI-03
    activeTrips: 2, // TR001, TR002
    pendingTrips: 1, // TR003
    driversOnDuty: 2, // Alex, Priya Verma
    fleetUtilizationPct: 40,
  },
  recentTrips: [
    { tripCode: "TR002", vehicle: "TRUCK-04", driver: "Priya Verma", status: "DISPATCHED" as TripStatus, eta: "2h 10m" },
    { tripCode: "TR001", vehicle: "VAN-05", driver: "Alex", status: "DISPATCHED" as TripStatus, eta: "45 min" },
    { tripCode: "TR003", vehicle: "—", driver: "—", status: "DRAFT" as TripStatus, eta: "Awaiting vehicle" },
    { tripCode: "TR004", vehicle: "MINI-03", driver: "Divya Rao", status: "CANCELLED" as TripStatus, eta: "—" },
  ],
  vehicleStatusBreakdown: {
    AVAILABLE: 2,
    ON_TRIP: 2,
    IN_SHOP: 1,
    RETIRED: 1,
  },
};

// ---------------------------------------------------------------
// ANALYTICS SUMMARY — matches GET /api/analytics/summary + trend endpoints
// ---------------------------------------------------------------

export const mockAnalyticsSummary = {
  fuelEfficiencyKmPerL: 8.4,
  fleetUtilizationPct: 40,
  operationalCost: 57160, // sum of all fuel + maintenance + expense rows above
  vehicleRoiPct: 14.2, // illustrative — spec's ROI formula needs "Revenue," which isn't tracked elsewhere; see API doc §12
};

export const mockMonthlyOperationalCostTrend = [
  { month: "Jan", cost: 38200 },
  { month: "Feb", cost: 41500 },
  { month: "Mar", cost: 36800 },
  { month: "Apr", cost: 44200 },
  { month: "May", cost: 49500 },
  { month: "Jun", cost: 52100 },
  { month: "Jul", cost: 57160 },
];

export const mockTopMaintenanceVehicles = [
  { vehicle: "VAN-09", cost: 18000 },
  { vehicle: "MINI-03", cost: 6200 },
  { vehicle: "TRUCK-01", cost: 2500 },
];

// ---------------------------------------------------------------
// OPTIONAL: mock ApiResponse<T> wrapper + fake-latency fetch helper
// Use this in a fetch abstraction so swapping in the real backend
// later is a one-line change (just delete the mock branch).
// ---------------------------------------------------------------

export function mockApiResponse<T>(data: T, message = "Success", statusCode = 200): ApiResponseShape<T> {
  return { statusCode, data, message, success: statusCode < 400 };
}

/** Simulates real network latency so loading states are visible during dev. */
export function mockFetch<T>(data: T, delayMs = 400): Promise<ApiResponseShape<T>> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockApiResponse(data)), delayMs);
  });
}
