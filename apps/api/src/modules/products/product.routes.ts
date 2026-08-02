import { Router } from "express";
import { authenticate, requirePermission } from "../../middleware/auth.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { PERMISSIONS } from "../../shared/rbac/permissions.js";
import { productController } from "./product.controller.js";

export const productsRouter = Router();

productsRouter.get("/", asyncHandler(productController.list));
productsRouter.get("/:id", asyncHandler(productController.getById));
productsRouter.post(
  "/",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCTS_WRITE),
  asyncHandler(productController.create),
);
productsRouter.patch(
  "/:id",
  authenticate,
  requirePermission(PERMISSIONS.PRODUCTS_WRITE),
  asyncHandler(productController.update),
);
