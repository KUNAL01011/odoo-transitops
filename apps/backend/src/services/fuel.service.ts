import { prisma } from "@/configs";
import { ApiError } from "@/utils";
import { HTTP_STATUS, FUEL_MESSAGES } from "@/constants";
import { Prisma } from "@/generated/prisma/client";

export interface GetAllFuelLogsParams {
  page: number;
  limit: number;
  vehicleId?: string;
  tripId?: string;
  from?: string;
  to?: string;
  sortOrder: "asc" | "desc";
}

export const fuelService = {
  async create(data: {
    vehicleId: string;
    tripId?: string;
    liters: number;
    cost: number;
    date?: string;
  }) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });
    if (!vehicle)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Vehicle not found");

    return prisma.fuelLog.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
      },
      include: {
        vehicle: { select: { id: true, name: true, registrationNumber: true } },
        trip: { select: { id: true, source: true, destination: true } },
      },
    });
  },

  async getAll({
    page,
    limit,
    vehicleId,
    tripId,
    from,
    to,
    sortOrder,
  }: GetAllFuelLogsParams) {
    const where: Prisma.FuelLogWhereInput = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (tripId) where.tripId = tripId;
    if (from || to) {
      where.date = {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      };
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.fuelLog.findMany({
        where,
        orderBy: { date: sortOrder },
        skip,
        take: limit,
        include: {
          vehicle: {
            select: { id: true, name: true, registrationNumber: true },
          },
          trip: { select: { id: true, source: true, destination: true } },
        },
      }),
      prisma.fuelLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async getById(id: string) {
    const log = await prisma.fuelLog.findUnique({
      where: { id },
      include: { vehicle: true, trip: true },
    });
    if (!log)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, FUEL_MESSAGES.NOT_FOUND);
    return log;
  },

  async update(
    id: string,
    data: Partial<{
      liters: number;
      cost: number;
      date: string;
      tripId: string;
    }>
  ) {
    await fuelService.getById(id);
    return prisma.fuelLog.update({
      where: { id },
      data: {
        ...data,
        ...(data.date && { date: new Date(data.date) }),
      },
    });
  },

  async delete(id: string) {
    await fuelService.getById(id);
    return prisma.fuelLog.delete({ where: { id } });
  },
};
