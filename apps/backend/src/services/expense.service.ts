import { prisma } from "@/configs";
import { ApiError } from "@/utils";
import { HTTP_STATUS, EXPENSE_MESSAGES } from "@/constants";
import type { ExpenseType } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";

export interface GetAllExpensesParams {
  page: number;
  limit: number;
  vehicleId?: string;
  tripId?: string;
  from?: string;
  to?: string;
  sortOrder: "asc" | "desc";
}

export const expenseService = {
  async create(data: {
    vehicleId: string;
    tripId?: string;
    type: ExpenseType;
    description: string;
    amount: number;
    date?: string;
  }) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });
    if (!vehicle)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Vehicle not found");

    return prisma.expense.create({
      data: {
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
      },
      include: {
        vehicle: { select: { id: true, name: true, registrationNumber: true } },
        trip: { select: { id: true, source: true, destination: true } },
      },
    });
  },

  async getAll({
    page,
    limit,
    vehicleId,
    tripId,
    from,
    to,
    sortOrder,
  }: GetAllExpensesParams) {
    const where: Prisma.ExpenseWhereInput = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (tripId) where.tripId = tripId;
    if (from || to) {
      where.date = {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      };
    }

    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: sortOrder },
        skip,
        take: limit,
        include: {
          vehicle: {
            select: { id: true, name: true, registrationNumber: true },
          },
          trip: { select: { id: true, source: true, destination: true } },
        },
      }),
      prisma.expense.count({ where }),
    ]);

    return {
      data: expenses,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async getById(id: string) {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { vehicle: true, trip: true },
    });
    if (!expense)
      throw new ApiError(HTTP_STATUS.NOT_FOUND, EXPENSE_MESSAGES.NOT_FOUND);
    return expense;
  },

  async update(
    id: string,
    data: Partial<{
      type: ExpenseType;
      description: string;
      amount: number;
      date: string;
      tripId: string;
    }>
  ) {
    await expenseService.getById(id);
    return prisma.expense.update({
      where: { id },
      data: {
        ...data,
        ...(data.date && { date: new Date(data.date) }),
      },
    });
  },

  async delete(id: string) {
    await expenseService.getById(id);
    return prisma.expense.delete({ where: { id } });
  },
};
