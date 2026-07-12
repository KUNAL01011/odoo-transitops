import { prisma } from "@/configs";
import { ApiError } from "@/utils";
import { HTTP_STATUS, TRIP_MESSAGES } from "@/constants";
import { vehicleService } from "./vehicle.service";
import { driverService } from "./driver.service";
import { Prisma } from "@/generated/prisma/client";

export interface GetAllTripsParams {
  page: number;
  limit: number;
  status?: "DRAFT" | "DISPATCHED" | "COMPLETED" | "CANCELLED";
  vehicleId?: string;
  driverId?: string;
  search?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  from?: string;
  to?: string;
}

const tripInclude = {
  vehicle: {
    select: { id: true, name: true, registrationNumber: true, type: true },
  },
  driver: { select: { id: true, name: true, licenseNumber: true } },
  dispatchedBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.TripInclude;

export const tripService = {
  async create(
    data: {
      source: string;
      destination: string;
      vehicleId: string;
      driverId: string;
      cargoWeight: number;
      plannedDistance: number;
      notes?: string;
    },
    dispatchedById: string
  ) {
    // Validate vehicle & driver eligibility
    const vehicle = await vehicleService.assertDispatchable(data.vehicleId);
    await driverService.assertDispatchable(data.driverId);

    // Business rule: cargo weight must not exceed max load capacity
    if (data.cargoWeight > vehicle.maxLoadCapacity) {
      throw new ApiError(
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        TRIP_MESSAGES.OVERWEIGHT
      );
    }

    return prisma.trip.create({
      data: { ...data, dispatchedById },
      include: tripInclude,
    });
  },

  async getAll({
    page,
    limit,
    status,
    vehicleId,
    driverId,
    search,
    sortBy,
    sortOrder,
    from,
    to,
  }: GetAllTripsParams) {
    const where: Prisma.TripWhereInput = {};
    if (status) where.status = status;
    if (vehicleId) where.vehicleId = vehicleId;
    if (driverId) where.driverId = driverId;
    if (from || to) {
      where.createdAt = {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      };
    }
    if (search) {
      where.OR = [
        { source: { contains: search, mode: "insensitive" } },
        { destination: { contains: search, mode: "insensitive" } },
        { vehicle: { name: { contains: search, mode: "insensitive" } } },
        { driver: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const orderBy: Prisma.TripOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };
    const skip = (page - 1) * limit;

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: tripInclude,
      }),
      prisma.trip.count({ where }),
    ]);

    return {
      data: trips,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async getById(id: string) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        ...tripInclude,
        fuelLogs: true,
        expenses: true,
      },
    });
    if (!trip)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, TRIP_MESSAGES.NOT_FOUND);
    return trip;
  },

  /* ---- Dispatch: DRAFT → DISPATCHED ---- */
  async dispatch(id: string) {
    const trip = await tripService.getById(id);
    if (trip.status !== "DRAFT")
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        TRIP_MESSAGES.CANNOT_DISPATCH
      );

    // Re-validate eligibility at dispatch time (state may have changed since create)
    await vehicleService.assertDispatchable(trip.vehicleId);
    await driverService.assertDispatchable(trip.driverId);

    // Atomic: update trip + vehicle + driver status
    const [updated] = await prisma.$transaction([
      prisma.trip.update({
        where: { id },
        data: { status: "DISPATCHED", startedAt: new Date() },
        include: tripInclude,
      }),
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: "ON_TRIP" },
      }),
      prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: "ON_TRIP" },
      }),
    ]);

    return updated;
  },

  /* ---- Complete: DISPATCHED → COMPLETED ---- */
  async complete(
    id: string,
    data: {
      finalOdometer: number;
      fuelConsumed: number;
      actualDistance: number;
      notes?: string;
    }
  ) {
    const trip = await tripService.getById(id);
    if (trip.status !== "DISPATCHED")
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        TRIP_MESSAGES.CANNOT_COMPLETE
      );

    const [updated] = await prisma.$transaction([
      prisma.trip.update({
        where: { id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          finalOdometer: data.finalOdometer,
          fuelConsumed: data.fuelConsumed,
          actualDistance: data.actualDistance,
          notes: data.notes,
        },
        include: tripInclude,
      }),
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: "AVAILABLE", odometer: data.finalOdometer },
      }),
      prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: "AVAILABLE" },
      }),
    ]);

    return updated;
  },

  /* ---- Cancel: DRAFT | DISPATCHED → CANCELLED ---- */
  async cancel(id: string) {
    const trip = await tripService.getById(id);
    if (trip.status !== "DRAFT" && trip.status !== "DISPATCHED")
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, TRIP_MESSAGES.CANNOT_CANCEL);

    const wasDispatched = trip.status === "DISPATCHED";

    const updates: Parameters<typeof prisma.$transaction>[0] = [
      prisma.trip.update({
        where: { id },
        data: { status: "CANCELLED", cancelledAt: new Date() },
        include: tripInclude,
      }),
    ];

    // Restore only if was dispatched (resources were locked)
    if (wasDispatched) {
      updates.push(
        prisma.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: "AVAILABLE" },
        }),
        prisma.driver.update({
          where: { id: trip.driverId },
          data: { status: "AVAILABLE" },
        })
      );
    }

    const [updated] = await prisma.$transaction(updates);
    return updated;
  },

  async delete(id: string) {
    const trip = await tripService.getById(id);
    if (trip.status === "DISPATCHED")
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot delete an active dispatched trip"
      );
    return prisma.trip.delete({ where: { id } });
  },
};
