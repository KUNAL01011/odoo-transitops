import { z } from "zod";

export const vehicleSchema = z.object({
  regNo: z.string().min(4, "Registration number looks too short"),
  name: z.string().min(1, "Name/model is required"),
  type: z.enum(["VAN", "TRUCK", "MINI_TRUCK", "BUS", "OTHER"]),
  maxLoadCapacity: z.number().positive("Capacity must be greater than 0"),
  acquisitionCost: z.number().nonnegative(),
});
export type VehicleInput = z.infer<typeof vehicleSchema>;

export const driverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  licenseNumber: z.string().min(4, "License number looks too short"),
  licenseCategory: z.enum(["LMV", "HMV", "OTHER"]),
  licenseExpiry: z.string().refine(d => !isNaN(Date.parse(d)), "Invalid date"),
  contactNumber: z.string().min(7, "Enter a valid contact number"),
});
export type DriverInput = z.infer<typeof driverSchema>;

// Cross-field capacity check happens in useCreateTrip's onError path against
// the selected vehicle's maxLoadCapacity (not knowable from the trip schema
// alone) — see features/trips/api.ts for the client-side pre-check helper.
export const tripSchema = z.object({
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  vehicleId: z.number({ error: "Select a vehicle" }),
  driverId: z.number({ error: "Select a driver" }),
  cargoWeight: z.number().positive("Cargo weight must be greater than 0"),
  plannedDistance: z.number().positive("Distance must be greater than 0"),
});
export type TripInput = z.infer<typeof tripSchema>;

export const tripCompleteSchema = z.object({
  finalOdometer: z.number().positive(),
  fuelConsumedLiters: z.number().nonnegative(),
});
export type TripCompleteInput = z.infer<typeof tripCompleteSchema>;

export const maintenanceSchema = z.object({
  vehicleId: z.number({ error: "Select a vehicle" }),
  serviceType: z.string().min(1, "Service type is required"),
  description: z.string().optional(),
  cost: z.number().nonnegative(),
  date: z.string().refine(d => !isNaN(Date.parse(d)), "Invalid date"),
});
export type MaintenanceInput = z.infer<typeof maintenanceSchema>;

export const fuelLogSchema = z.object({
  vehicleId: z.number({ error: "Select a vehicle" }),
  tripId: z.number().optional(),
  liters: z.number().positive(),
  cost: z.number().nonnegative(),
  date: z.string().refine(d => !isNaN(Date.parse(d)), "Invalid date"),
});
export type FuelLogInput = z.infer<typeof fuelLogSchema>;

export const expenseSchema = z.object({
  vehicleId: z.number({ error: "Select a vehicle" }),
  type: z.enum(["TOLL", "OTHER"]),
  amount: z.number().nonnegative(),
  date: z.string().refine(d => !isNaN(Date.parse(d)), "Invalid date"),
  description: z.string().optional(),
});
export type ExpenseInput = z.infer<typeof expenseSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(
    ["FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
    {
      error: "Select a role",
    }
  ),
  rememberMe: z.boolean().optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

// lib/utils/validation.ts — settingsSchema updated
export const settingsSchema = z.object({
  depotName: z.string().min(1, "Depot name is required"),
  currency: z.string().min(1),
  distanceUnit: z.enum(["km", "miles"]),
  licenseAlertDays: z.number().int().positive().optional(),
});
export type SettingsInput = z.infer<typeof settingsSchema>;
