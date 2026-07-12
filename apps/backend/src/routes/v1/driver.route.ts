import { Router } from "express";
import { driverController } from "@/controllers";
import { authenticate, authorize, validate } from "@/middlewares";
import {
  createDriverSchema,
  updateDriverSchema,
  getAllDriversQuerySchema,
} from "@/validators";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validate(getAllDriversQuerySchema, "query"),
  driverController.getAllDrivers
);
router.get("/dispatchable", driverController.getDispatchableDrivers);
router.get("/:id", driverController.getDriverById);

router.post(
  "/",
  authorize("FLEET_MANAGER", "SAFETY_OFFICER", "ADMIN"),
  validate(createDriverSchema),
  driverController.createDriver
);
router.put(
  "/:id",
  authorize("FLEET_MANAGER", "SAFETY_OFFICER", "ADMIN"),
  validate(updateDriverSchema),
  driverController.updateDriver
);
router.delete("/:id", authorize("ADMIN"), driverController.deleteDriver);

export default router;
