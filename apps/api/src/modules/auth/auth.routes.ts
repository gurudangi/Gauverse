import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/auth.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { PERMISSIONS } from "../../shared/rbac/permissions.js";
import { authController } from "./auth.controller.js";
import type { AuthenticatedRequest } from "./auth.types.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(authController.register));
authRouter.post("/login", asyncHandler(authController.login));
authRouter.post("/refresh", asyncHandler(authController.refresh));
authRouter.post("/logout", authenticate, asyncHandler(authController.logout));
authRouter.get("/me", authenticate, asyncHandler(authController.me));
authRouter.patch("/profile", authenticate, asyncHandler(authController.updateProfile));

/** Smoke-check for RBAC wiring (users:read). */
authRouter.get(
  "/admin-check",
  authenticate,
  requirePermission(PERMISSIONS.USERS_READ),
  asyncHandler(async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    res.json({
      success: true,
      message: "RBAC OK",
      data: { userId: user?.id, roles: user?.roles },
    });
  }),
);
