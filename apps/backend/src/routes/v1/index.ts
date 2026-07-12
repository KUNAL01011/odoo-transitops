import { Router } from "express";
import authRouter from "./auth.route";
import vehicleRouter from "./vehicle.route";
import driverRouter from "./driver.route";
import tripRouter from "./trip.route";
import maintenanceRouter from "./maintenance.route";
import fuelRouter from "./fuel.route";
import expenseRouter from "./expense.route";
import analyticsRouter from "./analytics.route";

const router = Router();

router.use("/auth", authRouter);
router.use("/vehicles", vehicleRouter);
router.use("/drivers", driverRouter);
router.use("/trips", tripRouter);
router.use("/maintenance", maintenanceRouter);
router.use("/fuel-logs", fuelRouter);
router.use("/expenses", expenseRouter);
router.use("/analytics", analyticsRouter);

export default router;
