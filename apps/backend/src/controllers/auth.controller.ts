import type { Request, Response } from "express";
import { asyncHandler, ApiResponse, ApiError } from "@/utils";
import { HTTP_STATUS, AUTH_MESSAGES } from "@/constants";
import { authService } from "@/services";
import { myEnvironment, prisma } from "@/configs";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body.email, req.body.password);

  const cookieOptions = (maxAge: number) => ({
    httpOnly: true,
    secure: myEnvironment.NODE_ENV === "production",
    sameSite: (myEnvironment.NODE_ENV === "production" ? "none" : "lax") as
      "none" | "lax",
    maxAge,
  });

  const setAccessCookie = (res: Response, token: string) => {
    res.cookie("accessToken", token, cookieOptions(15 * 24 * 60 * 60 * 1000)); // 15 min
  };

  const setRefreshCookie = (res: Response, token: string) => {
    res.cookie("refreshToken", token, cookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days
  };

  setAccessCookie(res, result.accessToken);
  setRefreshCookie(res, result.refreshToken);

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
  const user = await prisma.user.findUnique({
    where: {
      id: req.user?.id,
    },
  });
  if (!user) throw new ApiError(400, "User not found");
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, user, "OK"));
});
