import { Request, Response, NextFunction } from "express";
import { authHelper, ApiError } from "@/utils";
import { myEnvironment, prisma } from "@/configs";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Unauthorized — please log in");
    }

    const decoded = authHelper.verifyToken<{ id: string }>(
      token,
      myEnvironment.ACCESS_SECRET!
    );

    const user = await prisma.user.findFirst({
      where: {
        id: decoded.id,
      },
    });
    if (!user) {
      throw new ApiError(401, "User not found");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = (req.user as any)?.role ?? "user";
    if (!roles.includes(userRole)) {
      return next(new ApiError(403, "Forbidden"));
    }
    next();
  };
};
