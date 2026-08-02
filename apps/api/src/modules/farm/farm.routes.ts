import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/auth.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { PERMISSIONS } from "../../shared/rbac/permissions.js";
import { farmController } from "./farm.controller.js";

export const farmRouter = Router();

farmRouter.use(authenticate);

farmRouter.get(
  "/stats",
  requirePermission(PERMISSIONS.FARM_READ),
  asyncHandler(farmController.stats),
);

farmRouter.get(
  "/cows",
  requirePermission(PERMISSIONS.FARM_READ),
  asyncHandler(farmController.listCows),
);

farmRouter.patch(
  "/cows/:id",
  requirePermission(PERMISSIONS.FARM_WRITE),
  asyncHandler(farmController.updateCow),
);

farmRouter.get(
  "/milk",
  requirePermission(PERMISSIONS.FARM_READ),
  asyncHandler(farmController.listMilk),
);
farmRouter.post(
  "/milk",
  requirePermission(PERMISSIONS.FARM_WRITE),
  asyncHandler(farmController.createMilk),
);

farmRouter.get(
  "/health",
  requirePermission(PERMISSIONS.FARM_READ),
  asyncHandler(farmController.listHealth),
);
farmRouter.post(
  "/health",
  requirePermission(PERMISSIONS.FARM_WRITE),
  asyncHandler(farmController.createHealth),
);

farmRouter.get(
  "/feed",
  requirePermission(PERMISSIONS.FARM_READ),
  asyncHandler(farmController.listFeed),
);
farmRouter.post(
  "/feed",
  requirePermission(PERMISSIONS.FARM_WRITE),
  asyncHandler(farmController.createFeed),
);

farmRouter.get(
  "/vaccinations",
  requirePermission(PERMISSIONS.FARM_READ),
  asyncHandler(farmController.listVaccinations),
);
farmRouter.post(
  "/vaccinations",
  requirePermission(PERMISSIONS.FARM_WRITE),
  asyncHandler(farmController.createVaccination),
);

farmRouter.get(
  "/reports",
  requirePermission(PERMISSIONS.FARM_READ),
  asyncHandler(farmController.listDailyReports),
);
farmRouter.post(
  "/reports",
  requirePermission(PERMISSIONS.FARM_WRITE),
  asyncHandler(farmController.createDailyReport),
);
