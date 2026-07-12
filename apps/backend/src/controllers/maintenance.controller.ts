import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { HTTP_STATUS, MAINTENANCE_MESSAGES } from "@/constants";
import { maintenanceService } from "@/services";

export const createMaintenance = asyncHandler(
  async (req: Request, res: Response) => {
    const log = await maintenanceService.create(req.body);
    return res
      .status(HTTP_STATUS.CREATED)
      .json(
        new ApiResponse(HTTP_STATUS.CREATED, log, MAINTENANCE_MESSAGES.CREATED)
      );
  }
);

export const getAllMaintenance = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = "1",
      limit = "10",
      vehicleId,
      isActive,
      sortOrder = "desc",
    } = req.query as Record<string, string>;

    const result = await maintenanceService.getAll({
      page: Number(page),
      limit: Number(limit),
      vehicleId,
      isActive: isActive !== undefined ? isActive === "true" : undefined,
      sortOrder: sortOrder as "asc" | "desc",
    });

    return res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(
          HTTP_STATUS.OK,
          result,
          MAINTENANCE_MESSAGES.LOGS_FETCHED
        )
      );
  }
);

export const getMaintenanceById = asyncHandler(
  async (req: Request, res: Response) => {
    const log = await maintenanceService.getById(req.params.id as string);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, log, MAINTENANCE_MESSAGES.FETCHED));
  }
);

export const updateMaintenance = asyncHandler(
  async (req: Request, res: Response) => {
    const log = await maintenanceService.update(
      req.params.id as string,
      req.body
    );
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, log, MAINTENANCE_MESSAGES.UPDATED));
  }
);

export const closeMaintenance = asyncHandler(
  async (req: Request, res: Response) => {
    const { cost } = req.body as { cost?: number };
    const log = await maintenanceService.close(req.params.id as string, cost);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, log, MAINTENANCE_MESSAGES.CLOSED));
  }
);

export const deleteMaintenance = asyncHandler(
  async (req: Request, res: Response) => {
    await maintenanceService.delete(req.params.id as string);
    return res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(HTTP_STATUS.OK, null, MAINTENANCE_MESSAGES.DELETED)
      );
  }
);
