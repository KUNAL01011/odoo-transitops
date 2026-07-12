import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { HTTP_STATUS, VEHICLE_MESSAGES } from "@/constants";
import { vehicleService } from "@/services";
import { VehicleStatus, VehicleType } from "@/generated/prisma/enums";

export const createVehicle = asyncHandler(
  async (req: Request, res: Response) => {
    const vehicle = await vehicleService.create(req.body);
    return res
      .status(HTTP_STATUS.CREATED)
      .json(
        new ApiResponse(HTTP_STATUS.CREATED, vehicle, VEHICLE_MESSAGES.CREATED)
      );
  }
);

export const getAllVehicles = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = "1",
      limit = "10",
      type,
      status,
      region,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query as Record<string, string>;

    const result = await vehicleService.getAll({
      page: Number(page),
      limit: Number(limit),
      type: type as VehicleType | undefined,
      status: status as VehicleStatus | undefined,
      region,
      search,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
    });

    return res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(
          HTTP_STATUS.OK,
          result,
          VEHICLE_MESSAGES.VEHICLES_FETCHED
        )
      );
  }
);

export const getVehicleById = asyncHandler(
  async (req: Request, res: Response) => {
    const vehicle = await vehicleService.getById(req.params.id as string);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, vehicle, VEHICLE_MESSAGES.FETCHED));
  }
);

export const updateVehicle = asyncHandler(
  async (req: Request, res: Response) => {
    const vehicle = await vehicleService.update(
      req.params.id as string,
      req.body
    );
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, vehicle, VEHICLE_MESSAGES.UPDATED));
  }
);

export const deleteVehicle = asyncHandler(
  async (req: Request, res: Response) => {
    await vehicleService.delete(req.params.id as string);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, null, VEHICLE_MESSAGES.DELETED));
  }
);

export const getDispatchableVehicles = asyncHandler(
  async (req: Request, res: Response) => {
    const vehicles = await vehicleService.getDispatchable();
    return res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(
          HTTP_STATUS.OK,
          vehicles,
          VEHICLE_MESSAGES.VEHICLES_FETCHED
        )
      );
  }
);
