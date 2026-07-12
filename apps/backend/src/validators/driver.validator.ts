import { z } from "zod";

const DriverStatusEnum = z.enum([
  "AVAILABLE",
  "ON_TRIP",
  "OFF_DUTY",
  "SUSPENDED",
]);

export const createDriverSchema = z.object({
  name: z.string().min(2),
  licenseNumber: z.string().min(1),
  licenseCategory: z.string().min(1),
  licenseExpiry: z.string().datetime({ offset: true }).or(z.string().date()),
  contactNumber: z.string().min(7),
  safetyScore: z.number().min(0).max(100).optional(),
  status: DriverStatusEnum.optional(),
});

export const updateDriverSchema = createDriverSchema.partial().omit({
  licenseNumber: true,
});

export const getAllDriversQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: DriverStatusEnum.optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  expiringSoon: z.string().optional(), // "true" = license expiring in 30 days
});
