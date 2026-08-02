import { Router } from "express";
import { authenticate, optionalAuthenticate, requirePermission } from "../../middleware/auth.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { PERMISSIONS } from "../../shared/rbac/permissions.js";
import { adoptionController, cowController } from "./adoption.controller.js";

export const cowsRouter = Router();
export const adoptionsRouter = Router();

cowsRouter.get("/", asyncHandler(cowController.list));
cowsRouter.get("/plans", asyncHandler(cowController.listPlans));
cowsRouter.get("/:id", asyncHandler(cowController.getById));
cowsRouter.post(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.ADOPTIONS_WRITE),
  asyncHandler(cowController.create),
);
cowsRouter.patch(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.ADOPTIONS_WRITE),
  asyncHandler(cowController.update),
);

adoptionsRouter.get("/mine", authenticate, asyncHandler(adoptionController.listMine));
adoptionsRouter.post("/", optionalAuthenticate, asyncHandler(adoptionController.create));
adoptionsRouter.get(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.ADOPTIONS_READ),
  asyncHandler(adoptionController.listAll),
);
