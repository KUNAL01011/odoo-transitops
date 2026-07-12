import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { HTTP_STATUS, ANALYTICS_MESSAGES } from "@/constants";
import { analyticsService } from "@/services";

export const getDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    const { region, type } = req.query as { region?: string; type?: string };
    const data = await analyticsService.getDashboard({ region, type });
    return res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(
          HTTP_STATUS.OK,
          data,
          ANALYTICS_MESSAGES.DASHBOARD_FETCHED
        )
      );
  }
);

export const getReport = asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.query as { from?: string; to?: string };
  const data = await analyticsService.getReport(from, to);
  return res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(HTTP_STATUS.OK, data, ANALYTICS_MESSAGES.REPORT_FETCHED)
    );
});
