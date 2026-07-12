import { z } from "zod";

export const createTripSchema = z.object({
  source: z.string().min(1),
  destination: z.string().min(1),
  vehicleId: z.string().cuid(),
  driverId: z.string().cuid(),
  cargoWeight: z.number().positive(),
  plannedDistance: z.number().positive(),
  notes: z.string().optional(),
});

export const completeTripSchema = z.object({
  finalOdometer: z.number().positive(),
  fuelConsumed: z.number().positive(),
  actualDistance: z.number().positive(),
  notes: z.string().optional(),
});

export const getAllTripsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(["DRAFT", "DISPATCHED", "COMPLETED", "CANCELLED"]).optional(),
  vehicleId: z.string().optional(),
  driverId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});
