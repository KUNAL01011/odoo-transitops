import { Router } from "express";
import { fuelController } from "@/controllers";
import { authenticate, authorize, validate } from "@/middlewares";
import {
  createFuelLogSchema,
  updateFuelLogSchema,
  getAllLogsQuerySchema,
} from "@/validators";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validate(getAllLogsQuerySchema, "query"),
  fuelController.getAllFuelLogs
);
router.get("/:id", fuelController.getFuelLogById);

router.post(
  "/",
  authorize("DRIVER", "FLEET_MANAGER", "FINANCIAL_ANALYST", "ADMIN"),
  validate(createFuelLogSchema),
  fuelController.createFuelLog
);
router.put(
  "/:id",
  authorize("FLEET_MANAGER", "FINANCIAL_ANALYST", "ADMIN"),
  validate(updateFuelLogSchema),
  fuelController.updateFuelLog
);
router.delete("/:id", authorize("ADMIN"), fuelController.deleteFuelLog);

export default router;
