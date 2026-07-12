import { prisma } from "@/configs";
import { ApiError } from "@/utils";
import { HTTP_STATUS, DRIVER_MESSAGES } from "@/constants";
import { DriverStatus } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";

export interface GetAllDriversParams {
  page: number;
  limit: number;
  status?: DriverStatus;
  search?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  expiringSoon?: boolean;
}

export const driverService = {
  async create(data: {
    name: string;
    licenseNumber: string;
    licenseCategory: string;
    licenseExpiry: string;
    contactNumber: string;
    safetyScore?: number;
    status?: DriverStatus;
  }) {
    const existing = await prisma.driver.findUnique({
      where: { licenseNumber: data.licenseNumber },
    });
    if (existing)
      throw new ApiError(HTTP_STATUS.CONFLICT, DRIVER_MESSAGES.LICENSE_EXISTS);

    return prisma.driver.create({
      data: {
        ...data,
        licenseExpiry: new Date(data.licenseExpiry),
      },
    });
  },

  async getAll({
    page,
    limit,
    status,
    search,
    sortBy,
    sortOrder,
    expiringSoon,
  }: GetAllDriversParams) {
    const where: Prisma.DriverWhereInput = {};
    if (status) where.status = status;
    if (expiringSoon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      where.licenseExpiry = { lte: thirtyDaysFromNow, gte: new Date() };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { licenseNumber: { contains: search, mode: "insensitive" } },
        { contactNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.DriverOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };
    const skip = (page - 1) * limit;

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({ where, orderBy, skip, take: limit }),
      prisma.driver.count({ where }),
    ]);

    return {
      data: drivers,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async getById(id: string) {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: { _count: { select: { trips: true } } },
    });
    if (!driver)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, DRIVER_MESSAGES.NOT_FOUND);
    return driver;
  },

  async update(
    id: string,
    data: Partial<{
      name: string;
      licenseCategory: string;
      licenseExpiry: string;
      contactNumber: string;
      safetyScore: number;
      status: DriverStatus;
    }>
  ) {
    await driverService.getById(id);
    return prisma.driver.update({
      where: { id },
      data: {
        ...data,
        ...(data.licenseExpiry && {
          licenseExpiry: new Date(data.licenseExpiry),
        }),
      },
    });
  },

  async delete(id: string) {
    await driverService.getById(id);
    return prisma.driver.delete({ where: { id } });
  },

  /* ---- Dispatch-eligibility helpers ---- */
  async assertDispatchable(id: string) {
    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, DRIVER_MESSAGES.NOT_FOUND);
    if (driver.status === "SUSPENDED")
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, DRIVER_MESSAGES.SUSPENDED);
    if (driver.status === "ON_TRIP")
      throw new ApiError(HTTP_STATUS.CONFLICT, DRIVER_MESSAGES.ALREADY_ON_TRIP);
    if (new Date(driver.licenseExpiry) < new Date())
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        DRIVER_MESSAGES.LICENSE_EXPIRED
      );
    return driver;
  },

  async getDispatchable() {
    return prisma.driver.findMany({
      where: {
        status: "AVAILABLE",
        licenseExpiry: { gt: new Date() },
      },
      orderBy: { name: "asc" },
    });
  },
};
