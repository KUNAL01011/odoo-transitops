import { prisma } from "@/configs";
import { ApiError } from "@/utils";
import { HTTP_STATUS, MAINTENANCE_MESSAGES } from "@/constants";
import { Prisma } from "@/generated/prisma/client";

export interface GetAllMaintenanceParams {
  page: number;
  limit: number;
  vehicleId?: string;
  isActive?: boolean;
  sortOrder: "asc" | "desc";
}

export const maintenanceService = {
  /* Creating a maintenance record → vehicle status = IN_SHOP (atomic) */
  async create(data: {
    vehicleId: string;
    description: string;
    cost?: number;
  }) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });
    if (!vehicle)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Vehicle not found");
    if (vehicle.status === "RETIRED")
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot create maintenance for a retired vehicle"
      );

    const [log] = await prisma.$transaction([
      prisma.maintenanceLog.create({ data }),
      prisma.vehicle.update({
        where: { id: data.vehicleId },
        data: { status: "IN_SHOP" },
      }),
    ]);

    return log;
  },

  async getAll({
    page,
    limit,
    vehicleId,
    isActive,
    sortOrder,
  }: GetAllMaintenanceParams) {
    const where: Prisma.MaintenanceLogWhereInput = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (typeof isActive === "boolean") where.isActive = isActive;

    const skip = (page - 1) * limit;
    const orderBy: Prisma.MaintenanceLogOrderByWithRelationInput = {
      startedAt: sortOrder,
    };

    const [logs, total] = await Promise.all([
      prisma.maintenanceLog.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          vehicle: {
            select: { id: true, name: true, registrationNumber: true },
          },
        },
      }),
      prisma.maintenanceLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async getById(id: string) {
    const log = await prisma.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });
    if (!log)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, MAINTENANCE_MESSAGES.NOT_FOUND);
    return log;
  },

  async update(id: string, data: { description?: string; cost?: number }) {
    await maintenanceService.getById(id);
    return prisma.maintenanceLog.update({ where: { id }, data });
  },

  /* Closing maintenance → vehicle status = AVAILABLE (unless retired) */
  async close(id: string, finalCost?: number) {
    const log = await maintenanceService.getById(id);
    if (!log.isActive)
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        MAINTENANCE_MESSAGES.ALREADY_CLOSED
      );

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: log.vehicleId },
    });
    if (vehicle?.status === "RETIRED")
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        MAINTENANCE_MESSAGES.VEHICLE_RETIRED
      );

    const updateData: Prisma.MaintenanceLogUpdateInput = {
      isActive: false,
      closedAt: new Date(),
      ...(finalCost !== undefined && { cost: finalCost }),
    };

    const [updated] = await prisma.$transaction([
      prisma.maintenanceLog.update({ where: { id }, data: updateData }),
      prisma.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: "AVAILABLE" },
      }),
    ]);

    return updated;
  },

  async delete(id: string) {
    await maintenanceService.getById(id);
    return prisma.maintenanceLog.delete({ where: { id } });
  },
};
