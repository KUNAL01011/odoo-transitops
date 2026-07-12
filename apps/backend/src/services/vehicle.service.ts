import { ApiError } from "@/utils";
import { HTTP_STATUS, VEHICLE_MESSAGES } from "@/constants";
import { VehicleStatus, VehicleType } from "@/generated/prisma/enums";
import { prisma } from "@/configs";
import { Prisma } from "@/generated/prisma/client";

export interface GetAllVehiclesParams {
  page: number;
  limit: number;
  type?: VehicleType;
  status?: VehicleStatus;
  region?: string;
  search?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export const vehicleService = {
  async create(data: {
    registrationNumber: string;
    name: string;
    type: VehicleType;
    maxLoadCapacity: number;
    odometer?: number;
    acquisitionCost: number;
    status?: VehicleStatus;
    region?: string;
  }) {
    const existing = await prisma.vehicle.findUnique({
      where: { registrationNumber: data.registrationNumber },
    });
    if (existing)
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        VEHICLE_MESSAGES.REG_NUMBER_EXISTS
      );

    return prisma.vehicle.create({ data });
  },

  async getAll({
    page,
    limit,
    type,
    status,
    region,
    search,
    sortBy,
    sortOrder,
  }: GetAllVehiclesParams) {
    const where: Prisma.VehicleWhereInput = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (region) where.region = { contains: region, mode: "insensitive" };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { registrationNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.VehicleOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };
    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({ where, orderBy, skip, take: limit }),
      prisma.vehicle.count({ where }),
    ]);

    return {
      data: vehicles,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async getById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        _count: {
          select: { trips: true, maintenanceLogs: true, fuelLogs: true },
        },
      },
    });
    if (!vehicle)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, VEHICLE_MESSAGES.NOT_FOUND);
    return vehicle;
  },

  async update(
    id: string,
    data: Partial<{
      name: string;
      type: VehicleType;
      maxLoadCapacity: number;
      odometer: number;
      acquisitionCost: number;
      status: VehicleStatus;
      region: string;
    }>
  ) {
    await vehicleService.getById(id); // 404 check
    return prisma.vehicle.update({ where: { id }, data });
  },

  async delete(id: string) {
    await vehicleService.getById(id);
    return prisma.vehicle.delete({ where: { id } });
  },

  /* ---- Dispatch-eligibility helpers ---- */
  async assertDispatchable(id: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, VEHICLE_MESSAGES.NOT_FOUND);
    if (vehicle.status === "RETIRED" || vehicle.status === "IN_SHOP")
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        VEHICLE_MESSAGES.CANNOT_DISPATCH
      );
    if (vehicle.status === "ON_TRIP")
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        VEHICLE_MESSAGES.ALREADY_ON_TRIP
      );
    return vehicle;
  },

  async getDispatchable() {
    return prisma.vehicle.findMany({
      where: { status: "AVAILABLE" },
      orderBy: { name: "asc" },
    });
  },
};
