import { Router } from "express";
import { analyticsController } from "@/controllers";
import { authenticate, authorize } from "@/middlewares";

const router = Router();

router.use(authenticate);

// Dashboard: all roles can view
router.get("/dashboard", analyticsController.getDashboard);

// Full report: Fleet Manager, Financial Analyst, Admin
router.get(
  "/report",
  authorize("FLEET_MANAGER", "FINANCIAL_ANALYST", "ADMIN"),
  analyticsController.getReport
);

export default router;
