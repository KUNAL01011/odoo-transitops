export type Role =
  "FLEET_MANAGER" | "DISPATCHER" | "SAFETY_OFFICER" | "FINANCIAL_ANALYST";
export type UserStatus = "ACTIVE" | "LOCKED" | "INACTIVE";
export type VehicleType = "VAN" | "TRUCK" | "MINI_TRUCK" | "BUS" | "OTHER";
export type VehicleStatus = "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";
export type LicenseCategory = "LMV" | "HMV" | "OTHER";
export type DriverStatus = "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";
export type TripStatus = "DRAFT" | "DISPATCHED" | "COMPLETED" | "CANCELLED";
export type MaintenanceStatus = "ACTIVE" | "COMPLETED";
export type ExpenseType = "TOLL" | "OTHER";
export type NotificationType =
  | "LICENSE_EXPIRING"
  | "TRIP_DISPATCHED"
  | "TRIP_COMPLETED"
  | "TRIP_CANCELLED"
  | "MAINTENANCE_OPENED"
  | "MAINTENANCE_CLOSED"
  | "ACCOUNT_LOCKED";
export type AppModule =
  | "DASHBOARD"
  | "FLEET"
  | "DRIVERS"
  | "TRIPS"
  | "MAINTENANCE"
  | "FUEL_EXPENSES"
  | "ANALYTICS"
  | "SETTINGS";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
}

export interface Vehicle {
  id: number;
  regNo: string;
  name: string;
  type: VehicleType;
  maxLoadCapacity: number; // kg
  odometer: number;
  acquisitionCost: number;
  status: VehicleStatus;
}

export interface Driver {
  id: number;
  name: string;
  licenseNumber: string;
  licenseCategory: LicenseCategory;
  licenseExpiry: string; // ISO date
  contactNumber: string;
  safetyScore: number;
  tripCompletions: number;
  status: DriverStatus;
}

export interface Trip {
  id: number;
  tripCode: string;
  source: string;
  destination: string;
  vehicleId: number | null;
  driverId: number | null;
  cargoWeight: number;
  plannedDistance: number;
  finalOdometer: number | null;
  fuelConsumedLiters: number | null;
  status: TripStatus;
  cancellationReason: string | null;
  dispatchedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
}

export interface MaintenanceLog {
  id: number;
  vehicleId: number;
  serviceType: string;
  cost: number;
  date: string;
  status: MaintenanceStatus;
  closedAt: string | null;
}

export interface FuelLog {
  id: number;
  vehicleId: number;
  tripId: number | null;
  liters: number;
  cost: number;
  date: string;
}

export interface Expense {
  id: number;
  vehicleId: number;
  type: ExpenseType;
  amount: number;
  date: string;
  description?: string;
}

export interface Notification {
  id: number;
  userId: number | null;
  role: Role | null;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface RolePermission {
  role: Role;
  module: AppModule;
  canView: boolean;
  canEdit: boolean;
}

export interface SystemSettings {
  depotName: string;
  licenseAlertDays: number;
  currency: string;
  distanceUnit: string;
}

export interface DashboardSummary {
  kpis: {
    activeVehicles: number;
    availableVehicles: number;
    vehiclesInMaintenance: number;
    activeTrips: number;
    pendingTrips: number;
    driversOnDuty: number;
    fleetUtilizationPct: number;
  };
  recentTrips: Array<{
    tripCode: string;
    vehicle: string;
    driver: string;
    status: TripStatus;
    eta: string;
  }>;
  vehicleStatusBreakdown: Record<VehicleStatus, number>;
}

export interface AnalyticsSummary {
  fuelEfficiencyKmPerL: number;
  fleetUtilizationPct: number;
  operationalCost: number;
  vehicleRoiPct: number;
}

export interface OperationalCost {
  vehicleId: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalOperationalCost: number;
}

export interface ApiResponseShape<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface AnalyticsSummary {
  fuelEfficiencyKmPerL: number;
  fleetUtilizationPct: number;
  operationalCost: number;
  vehicleRoiPct: number;
  // Optional context/trend fields — NOT computed by the current Express
  // routes. Frontend renders gracefully without them; add them to the
  // /analytics/summary response once the backend computes real deltas.
  fuelEfficiencyDeltaPct?: number;
  fleetUtilizationDeltaPct?: number;
  operationalCostDeltaPct?: number;
  operationalCostDeltaReason?: string;
  roiIndustryTargetPct?: number;
}

export interface TopCostVehicle {
  vehicle: string;
  cost: number;
  // Optional — needs the backend to also surface the vehicle type (for the
  // icon) and a human-readable reason (needs either a stored field or a
  // "most expensive line item" query per vehicle). Neither exists yet.
  vehicleType?: VehicleType;
  primaryCostReason?: string;
}

export interface PerformanceAlert {
  id: string;
  severity: "warning" | "overdue";
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

// lib/types.ts — added
export interface SystemSettings {
  depotName: string;
  licenseAlertDays: number;
  currency: string;
  distanceUnit: string;
}

export interface SecurityOverview {
  activeSessions: number;
  authFailures24h: number;
}
