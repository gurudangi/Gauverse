import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/auth.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { PERMISSIONS } from "../../shared/rbac/permissions.js";
import { inventoryController } from "./inventory.controller.js";

export const inventoryRouter = Router();

inventoryRouter.use(authenticate);

inventoryRouter.get(
  "/stats",
  requirePermission(PERMISSIONS.INVENTORY_READ),
  asyncHandler(inventoryController.stats),
);

inventoryRouter.get(
  "/movements",
  requirePermission(PERMISSIONS.INVENTORY_READ),
  asyncHandler(inventoryController.listMovements),
);

inventoryRouter.get(
  "/",
  requirePermission(PERMISSIONS.INVENTORY_READ),
  asyncHandler(inventoryController.list),
);

inventoryRouter.get(
  "/:id",
  requirePermission(PERMISSIONS.INVENTORY_READ),
  asyncHandler(inventoryController.get),
);

inventoryRouter.post(
  "/",
  requirePermission(PERMISSIONS.INVENTORY_WRITE),
  asyncHandler(inventoryController.create),
);

inventoryRouter.patch(
  "/:id",
  requirePermission(PERMISSIONS.INVENTORY_WRITE),
  asyncHandler(inventoryController.update),
);

inventoryRouter.post(
  "/:id/movements",
  requirePermission(PERMISSIONS.INVENTORY_WRITE),
  asyncHandler(inventoryController.move),
);
