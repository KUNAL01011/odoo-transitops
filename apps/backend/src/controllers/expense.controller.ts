import type { Request, Response } from "express";
import { asyncHandler, ApiResponse } from "@/utils";
import { HTTP_STATUS, EXPENSE_MESSAGES } from "@/constants";
import { expenseService } from "@/services";

export const createExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const expense = await expenseService.create(req.body);
    return res
      .status(HTTP_STATUS.CREATED)
      .json(
        new ApiResponse(HTTP_STATUS.CREATED, expense, EXPENSE_MESSAGES.CREATED)
      );
  }
);

export const getAllExpenses = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      page = "1",
      limit = "10",
      vehicleId,
      tripId,
      from,
      to,
      sortOrder = "desc",
    } = req.query as Record<string, string>;

    const result = await expenseService.getAll({
      page: Number(page),
      limit: Number(limit),
      vehicleId,
      tripId,
      from,
      to,
      sortOrder: sortOrder as "asc" | "desc",
    });

    return res
      .status(HTTP_STATUS.OK)
      .json(
        new ApiResponse(
          HTTP_STATUS.OK,
          result,
          EXPENSE_MESSAGES.EXPENSES_FETCHED
        )
      );
  }
);

export const getExpenseById = asyncHandler(
  async (req: Request, res: Response) => {
    const expense = await expenseService.getById(req.params.id as string);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, expense, EXPENSE_MESSAGES.FETCHED));
  }
);

export const updateExpense = asyncHandler(
  async (req: Request, res: Response) => {
    const expense = await expenseService.update(
      req.params.id as string,
      req.body
    );
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, expense, EXPENSE_MESSAGES.UPDATED));
  }
);

export const deleteExpense = asyncHandler(
  async (req: Request, res: Response) => {
    await expenseService.delete(req.params.id as string);
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, null, EXPENSE_MESSAGES.DELETED));
  }
);
