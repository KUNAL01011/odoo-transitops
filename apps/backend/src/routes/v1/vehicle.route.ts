import { Router } from "express";
import { vehicleController } from "@/controllers";
import { authenticate, authorize, validate } from "@/middlewares";
import {
  createVehicleSchema,
  updateVehicleSchema,
  getAllVehiclesQuerySchema,
} from "@/validators";

const router = Router();

router.use(authenticate);

// All authenticated users can view vehicles
router.get(
  "/",
  validate(getAllVehiclesQuerySchema, "query"),
  vehicleController.getAllVehicles
);
router.get("/dispatchable", vehicleController.getDispatchableVehicles);
router.get("/:id", vehicleController.getVehicleById);

// Fleet Manager & Admin only for mutations
router.post(
  "/",
  authorize("FLEET_MANAGER", "ADMIN"),
  validate(createVehicleSchema),
  vehicleController.createVehicle
);
router.put(
  "/:id",
  authorize("FLEET_MANAGER", "ADMIN"),
  validate(updateVehicleSchema),
  vehicleController.updateVehicle
);
router.delete("/:id", authorize("ADMIN"), vehicleController.deleteVehicle);

export default router;
