import { z } from "zod";

const VehicleTypeEnum = z.enum([
  "TRUCK",
  "VAN",
  "BUS",
  "BIKE",
  "CAR",
  "TRAILER",
]);
const VehicleStatusEnum = z.enum([
  "AVAILABLE",
  "ON_TRIP",
  "IN_SHOP",
  "RETIRED",
]);

export const createVehicleSchema = z.object({
  registrationNumber: z.string().min(1),
  name: z.string().min(1),
  type: VehicleTypeEnum,
  maxLoadCapacity: z.number().positive(),
  odometer: z.number().min(0).optional(),
  acquisitionCost: z.number().positive(),
  status: VehicleStatusEnum.optional(),
  region: z.string().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial().omit({
  registrationNumber: true,
});

export const getAllVehiclesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  type: VehicleTypeEnum.optional(),
  status: VehicleStatusEnum.optional(),
  region: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
