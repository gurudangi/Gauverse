import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/auth.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { PERMISSIONS } from "../../shared/rbac/permissions.js";
import { adminController } from "./admin.controller.js";

export const adminRouter = Router();

adminRouter.use(authenticate);

adminRouter.get(
  "/stats",
  requirePermission(PERMISSIONS.REPORTS_READ),
  asyncHandler(adminController.stats),
);
adminRouter.get(
  "/orders",
  requirePermission(PERMISSIONS.ORDERS_MANAGE),
  asyncHandler(adminController.orders),
);
adminRouter.get(
  "/donations",
  requirePermission(PERMISSIONS.DONATIONS_READ),
  asyncHandler(adminController.donations),
);
adminRouter.get(
  "/users",
  requirePermission(PERMISSIONS.USERS_READ),
  asyncHandler(adminController.users),
);
