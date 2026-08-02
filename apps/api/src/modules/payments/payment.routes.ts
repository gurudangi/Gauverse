import { Router } from "express";
import {
  authenticate,
  optionalAuthenticate,
  requirePermission,
} from "../../middleware/auth.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { PERMISSIONS } from "../../shared/rbac/permissions.js";
import { paymentController } from "./payment.controller.js";

export const paymentsRouter = Router();

paymentsRouter.get("/config", asyncHandler(paymentController.config));

paymentsRouter.post(
  "/intents",
  optionalAuthenticate,
  asyncHandler(paymentController.createIntent),
);

paymentsRouter.post(
  "/verify",
  optionalAuthenticate,
  asyncHandler(paymentController.verify),
);

paymentsRouter.get(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.REPORTS_READ),
  asyncHandler(paymentController.list),
);
