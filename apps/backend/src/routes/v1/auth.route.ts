import { Router } from "express";
import { authController } from "@/controllers";
import { validate, authenticate } from "@/middlewares";
import { loginSchema, refreshTokenSchema } from "@/validators";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refreshTokens
);
router.get("/me", authenticate, authController.getMe);

export default router;
