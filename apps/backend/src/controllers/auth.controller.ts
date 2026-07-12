import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { HTTP_STATUS, AUTH_MESSAGES } from "@/constants";
import { authService } from "@/services";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body.email, req.body.password);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, AUTH_MESSAGES.LOGGED_IN));
});

export const refreshTokens = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);
    return res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(HTTP_STATUS.OK, tokens, AUTH_MESSAGES.TOKEN_REFRESHED)
      );
  }
);

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  return res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        { userId: req.user.id, role: req.user.role },
        "OK"
      )
    );
});
