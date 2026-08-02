import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/auth.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { PERMISSIONS } from "../../shared/rbac/permissions.js";
import { subscriptionController } from "./subscription.controller.js";

export const subscriptionsRouter = Router();

subscriptionsRouter.get("/plans", asyncHandler(subscriptionController.listPlans));
subscriptionsRouter.get("/mine", authenticate, asyncHandler(subscriptionController.listMine));
subscriptionsRouter.post("/", authenticate, asyncHandler(subscriptionController.create));
subscriptionsRouter.post("/:id/pause", authenticate, asyncHandler(subscriptionController.pause));
subscriptionsRouter.post("/:id/resume", authenticate, asyncHandler(subscriptionController.resume));
subscriptionsRouter.post("/:id/cancel", authenticate, asyncHandler(subscriptionController.cancel));
subscriptionsRouter.get(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.SUBSCRIPTIONS_READ),
  asyncHandler(subscriptionController.listAll),
);
