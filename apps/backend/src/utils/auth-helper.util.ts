import jwt from "jsonwebtoken";
import { ApiError } from "./index";
import { HTTP_STATUS } from "@/constants";

const ACCESS_SECRET = process.env.ACCESS_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;
const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES ?? "15m";
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES ?? "7d";

export interface JwtPayload {
  userId: number;
  role: string;
}

export const signAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  } as jwt.SignOptions);

export const signRefreshToken = (payload: JwtPayload): string =>
  jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  } as jwt.SignOptions);

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError)
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Token expired");
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid token");
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
  } catch {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid refresh token");
  }
};
