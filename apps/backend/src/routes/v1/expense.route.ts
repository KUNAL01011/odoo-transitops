import { Router } from "express";
import { expenseController } from "@/controllers";
import { authenticate, authorize, validate } from "@/middlewares";
import {
  createExpenseSchema,
  updateExpenseSchema,
  getAllLogsQuerySchema,
} from "@/validators";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validate(getAllLogsQuerySchema, "query"),
  expenseController.getAllExpenses
);
router.get("/:id", expenseController.getExpenseById);

router.post(
  "/",
  authorize("DRIVER", "FLEET_MANAGER", "FINANCIAL_ANALYST", "ADMIN"),
  validate(createExpenseSchema),
  expenseController.createExpense
);
router.put(
  "/:id",
  authorize("FLEET_MANAGER", "FINANCIAL_ANALYST", "ADMIN"),
  validate(updateExpenseSchema),
  expenseController.updateExpense
);
router.delete("/:id", authorize("ADMIN"), expenseController.deleteExpense);

export default router;
