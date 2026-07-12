import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { HTTP_STATUS, TRIP_MESSAGES } from "@/constants";
import { tripService } from "@/services";

export const createTrip = asyncHandler(async (req: Request, res: Response) => {
  const trip = await tripService.create(req.body, req.user.id!);
  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, trip, TRIP_MESSAGES.CREATED));
});

export const getAllTrips = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = "1",
    limit = "10",
    status,
    vehicleId,
    driverId,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    from,
    to,
  } = req.query as Record<string, string>;

  const result = await tripService.getAll({
    page: Number(page),
    limit: Number(limit),
    status: status as any,
    vehicleId,
    driverId,
    search,
    sortBy,
    sortOrder: sortOrder as "asc" | "desc",
    from,
    to,
  });

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, TRIP_MESSAGES.TRIPS_FETCHED));
});

export const getTripById = asyncHandler(async (req: Request, res: Response) => {
  const trip = await tripService.getById(req.params.id as string);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, trip, TRIP_MESSAGES.FETCHED));
});

export const dispatchTrip = asyncHandler(
  async (req: Request, res: Response) => {
    const trip = await tripService.dispatch(req.params.id as string);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, trip, TRIP_MESSAGES.DISPATCHED));
  }
);

export const completeTrip = asyncHandler(
  async (req: Request, res: Response) => {
    const trip = await tripService.complete(req.params.id as string, req.body);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, trip, TRIP_MESSAGES.COMPLETED));
  }
);

export const cancelTrip = asyncHandler(async (req: Request, res: Response) => {
  const trip = await tripService.cancel(req.params.id as string);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, trip, TRIP_MESSAGES.CANCELLED));
});

export const deleteTrip = asyncHandler(async (req: Request, res: Response) => {
  await tripService.delete(req.params.id as string);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, TRIP_MESSAGES.DELETED));
});
