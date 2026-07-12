import { Router } from "express";
import { maintenanceController } from "@/controllers";
import { authenticate, authorize, validate } from "@/middlewares";
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  closeMaintenanceSchema,
  getAllLogsQuerySchema,
} from "@/validators";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validate(getAllLogsQuerySchema, "query"),
  maintenanceController.getAllMaintenance
);
router.get("/:id", maintenanceController.getMaintenanceById);

router.post(
  "/",
  authorize("FLEET_MANAGER", "ADMIN"),
  validate(createMaintenanceSchema),
  maintenanceController.createMaintenance
);
router.put(
  "/:id",
  authorize("FLEET_MANAGER", "ADMIN"),
  validate(updateMaintenanceSchema),
  maintenanceController.updateMaintenance
);

// Close = vehicle back to AVAILABLE
router.patch(
  "/:id/close",
  authorize("FLEET_MANAGER", "ADMIN"),
  validate(closeMaintenanceSchema),
  maintenanceController.closeMaintenance
);

router.delete(
  "/:id",
  authorize("ADMIN"),
  maintenanceController.deleteMaintenance
);

export default router;
