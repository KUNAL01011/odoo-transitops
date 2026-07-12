import bcrypt from "bcryptjs";
import { ApiError } from "@/utils";
import { HTTP_STATUS, AUTH_MESSAGES } from "@/constants";
import { Role } from "@/generated/prisma/enums";
import { prisma } from "@/configs";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/utils/auth-helper.util";

export const authService = {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        AUTH_MESSAGES.INVALID_CREDENTIALS
      );

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        AUTH_MESSAGES.INVALID_CREDENTIALS
      );

    const tokens = authService._generateTokens(user.id, user.role);
    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  },

  async refreshTokens(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user)
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.UNAUTHORIZED);

    return authService._generateTokens(user.id, user.role);
  },

  _generateTokens(userId: number, role: Role) {
    return {
      accessToken: signAccessToken({ userId, role }),
      refreshToken: signRefreshToken({ userId, role }),
    };
  },
};
