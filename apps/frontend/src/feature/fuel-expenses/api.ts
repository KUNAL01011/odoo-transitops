// ================================================================
// Fuel & Expenses — API_DOCUMENTATION.md §11
// ================================================================

import { ExpenseInput, FuelLogInput } from "@/src/helpers/validation";
import { apiClient } from "@/src/lib/api-client";
import { queryKeys } from "@/src/lib/query-keys";
import { Expense, FuelLog } from "@/src/lib/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface FuelLogFilters extends Record<string, unknown> {
  vehicleId?: number;
}
export interface ExpenseFilters extends Record<string, unknown> {
  vehicleId?: number;
}

class FuelExpenseService {
  listFuelLogs(filters?: FuelLogFilters) {
    return apiClient.get<FuelLog[]>(
      "/fuel-logs",
      filters as
        Record<string, string | number | boolean | null | undefined> | undefined
    );
  }
  createFuelLog(payload: FuelLogInput) {
    return apiClient.post<FuelLog>("/fuel-logs", payload);
  }
  listExpenses(filters?: ExpenseFilters) {
    return apiClient.get<Expense[]>(
      "/expenses",
      filters as
        Record<string, string | number | boolean | null | undefined> | undefined
    );
  }
  createExpense(payload: ExpenseInput) {
    return apiClient.post<Expense>("/expenses", payload);
  }
}

export const fuelExpenseService = new FuelExpenseService();

export function useFuelLogs(filters?: FuelLogFilters) {
  return useQuery({
    queryKey: queryKeys.fuelLogs.list(filters),
    queryFn: () => fuelExpenseService.listFuelLogs(filters),
  });
}

export function useExpenses(filters?: ExpenseFilters) {
  return useQuery({
    queryKey: queryKeys.expenses.list(filters),
    queryFn: () => fuelExpenseService.listExpenses(filters),
  });
}

export function useCreateFuelLog() {
  const qc = useQueryClient();
  return useMutation<FuelLog, unknown, FuelLogInput>({
    mutationFn: (variables: FuelLogInput) =>
      fuelExpenseService.createFuelLog(variables),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.fuelLogs.all });
      qc.invalidateQueries({
        queryKey: queryKeys.vehicles.operationalCost(variables.vehicleId),
      });
      qc.invalidateQueries({ queryKey: queryKeys.analytics.summary() });
    },
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation<Expense, unknown, ExpenseInput>({
    mutationFn: (variables: ExpenseInput) =>
      fuelExpenseService.createExpense(variables),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.expenses.all });
      qc.invalidateQueries({
        queryKey: queryKeys.vehicles.operationalCost(variables.vehicleId),
      });
      qc.invalidateQueries({ queryKey: queryKeys.analytics.summary() });
    },
  });
}
