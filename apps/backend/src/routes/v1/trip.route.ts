import { Router } from "express";
import { tripController } from "@/controllers";
import { authenticate, authorize, validate } from "@/middlewares";
import {
  createTripSchema,
  completeTripSchema,
  getAllTripsQuerySchema,
} from "@/validators";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  validate(getAllTripsQuerySchema, "query"),
  tripController.getAllTrips
);
router.get("/:id", tripController.getTripById);

// Drivers & Fleet Managers create trips
router.post(
  "/",
  authorize("DRIVER", "FLEET_MANAGER", "ADMIN"),
  validate(createTripSchema),
  tripController.createTrip
);

// Fleet Manager dispatches
router.patch(
  "/:id/dispatch",
  authorize("FLEET_MANAGER", "DRIVER", "ADMIN"),
  tripController.dispatchTrip
);

// Complete with odometer + fuel data
router.patch(
  "/:id/complete",
  authorize("DRIVER", "FLEET_MANAGER", "ADMIN"),
  validate(completeTripSchema),
  tripController.completeTrip
);

// Cancel
router.patch(
  "/:id/cancel",
  authorize("FLEET_MANAGER", "ADMIN"),
  tripController.cancelTrip
);

router.delete("/:id", authorize("ADMIN"), tripController.deleteTrip);

export default router;
