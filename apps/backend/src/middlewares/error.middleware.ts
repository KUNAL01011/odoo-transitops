import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { MulterError } from "multer";
import { ApiError } from "@/utils/api-error.util";
import { ApiResponse } from "@/utils/api-response.util";
import { myEnvironment } from "@/configs/env.config";
import { logger } from "@/utils";

export const notFoundHandler = (
  request: Request,
  _response: Response,
  next: NextFunction
): void => {
  const error = new ApiError(
    404,
    `Route not found : ${request.method} ${request.originalUrl}`
  );
  return next(error);
};

export const errorHandler = (
  err: unknown, // <-- Fixed the 'any' warning
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error: ApiError;

  // 1. Convert the incoming 'err' into our standard 'ApiError'
  if (err instanceof ApiError) {
    error = err; // No longer a useless assignment because 'error' is empty when declared
  } else if (err instanceof ZodError) {
    error = new ApiError(403, err.issues[0].message);
  } else if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      error = new ApiError(
        400,
        "File too large. Documents must be under 10MB."
      );
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      error = new ApiError(400, `Unsupported file type: ${err.field}`);
    } else {
      error = new ApiError(400, `Upload error: ${err.message}`);
    }
  } else if (err instanceof Error) {
    // Check specifically for JWT errors
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      error = new ApiError(
        401,
        `Unauthorized | ${err.name === "TokenExpiredError" ? "Token expired" : "Invalid token"}`
      );
    } else {
      error = new ApiError(500, err.message);
    }
  } else {
    error = new ApiError(500, "Unknown error occurred");
  }

  // 2. Log the sanitized error
  logger.error(`[${error.statusCode}] ${error.message}`);

  // 3. Format the response
  const apiResponse = new ApiResponse<null>(
    error.statusCode,
    null,
    error.message
  );

  // 4. Attach stack trace in development mode
  if (myEnvironment.NODE_ENV === "development" && error.stack) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (apiResponse as any).stack = error.stack;
  }

  return res.status(apiResponse.statusCode).json(apiResponse);
};
