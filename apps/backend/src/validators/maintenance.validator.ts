import { z } from "zod";

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().cuid(),
  description: z.string().min(1),
  cost: z.number().min(0).optional(),
});

export const updateMaintenanceSchema = z.object({
  description: z.string().min(1).optional(),
  cost: z.number().min(0).optional(),
});

export const closeMaintenanceSchema = z.object({
  cost: z.number().min(0).optional(), // finalize cost on close
});

export const createFuelLogSchema = z.object({
  vehicleId: z.string().cuid(),
  tripId: z.string().cuid().optional(),
  liters: z.number().positive(),
  cost: z.number().positive(),
  date: z.string().optional(),
});

export const updateFuelLogSchema = createFuelLogSchema.partial().omit({
  vehicleId: true,
});

export const createExpenseSchema = z.object({
  vehicleId: z.string().cuid(),
  tripId: z.string().cuid().optional(),
  type: z.enum(["FUEL", "TOLL", "MAINTENANCE", "OTHER"]),
  description: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial().omit({
  vehicleId: true,
});

export const getAllLogsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  vehicleId: z.string().optional(),
  tripId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
