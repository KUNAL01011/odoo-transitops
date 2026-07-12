import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { HTTP_STATUS, DRIVER_MESSAGES } from "@/constants";
import { driverService } from "@/services";
import { DriverStatus } from "@/generated/prisma/enums";

export const createDriver = asyncHandler(
  async (req: Request, res: Response) => {
    const driver = await driverService.create(req.body);
    return res
      .status(HTTP_STATUS.CREATED)
      .json(
        new ApiResponse(HTTP_STATUS.CREATED, driver, DRIVER_MESSAGES.CREATED)
      );
  }
);

export const getAllDrivers = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = "1",
      limit = "10",
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      expiringSoon,
    } = req.query as Record<string, string>;

    const result = await driverService.getAll({
      page: Number(page),
      limit: Number(limit),
      status: status as DriverStatus | undefined,
      search,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
      expiringSoon: expiringSoon === "true",
    });

    return res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(HTTP_STATUS.OK, result, DRIVER_MESSAGES.DRIVERS_FETCHED)
      );
  }
);

export const getDriverById = asyncHandler(
  async (req: Request, res: Response) => {
    const driver = await driverService.getById(req.params.id as string);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, driver, DRIVER_MESSAGES.FETCHED));
  }
);

export const updateDriver = asyncHandler(
  async (req: Request, res: Response) => {
    const driver = await driverService.update(
      req.params.id as string,
      req.body
    );
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, driver, DRIVER_MESSAGES.UPDATED));
  }
);

export const deleteDriver = asyncHandler(
  async (req: Request, res: Response) => {
    await driverService.delete(req.params.id as string);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, null, DRIVER_MESSAGES.DELETED));
  }
);

export const getDispatchableDrivers = asyncHandler(
  async (_req: Request, res: Response) => {
    const drivers = await driverService.getDispatchable();
    return res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(
          HTTP_STATUS.OK,
          drivers,
          DRIVER_MESSAGES.DRIVERS_FETCHED
        )
      );
  }
);
