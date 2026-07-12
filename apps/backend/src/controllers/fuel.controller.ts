import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { HTTP_STATUS, FUEL_MESSAGES } from "@/constants";
import { fuelService } from "@/services";

export const createFuelLog = asyncHandler(
  async (req: Request, res: Response) => {
    const log = await fuelService.create(req.body);
    return res
      .status(HTTP_STATUS.CREATED)
      .json(new ApiResponse(HTTP_STATUS.CREATED, log, FUEL_MESSAGES.CREATED));
  }
);

export const getAllFuelLogs = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = "1",
      limit = "10",
      vehicleId,
      tripId,
      from,
      to,
      sortOrder = "desc",
    } = req.query as Record<string, string>;

    const result = await fuelService.getAll({
      page: Number(page),
      limit: Number(limit),
      vehicleId,
      tripId,
      from,
      to,
      sortOrder: sortOrder as "asc" | "desc",
    });

    return res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(HTTP_STATUS.OK, result, FUEL_MESSAGES.LOGS_FETCHED)
      );
  }
);

export const getFuelLogById = asyncHandler(
  async (req: Request, res: Response) => {
    const log = await fuelService.getById(req.params.id as string);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, log, FUEL_MESSAGES.FETCHED));
  }
);

export const updateFuelLog = asyncHandler(
  async (req: Request, res: Response) => {
    const log = await fuelService.update(req.params.id as string, req.body);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, log, FUEL_MESSAGES.UPDATED));
  }
);

export const deleteFuelLog = asyncHandler(
  async (req: Request, res: Response) => {
    await fuelService.delete(req.params.id as string);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, null, FUEL_MESSAGES.DELETED));
  }
);
