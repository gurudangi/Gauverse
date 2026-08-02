import { Router } from "express";
import { authenticate, optionalAuthenticate } from "../../middleware/auth.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { orderController } from "./order.controller.js";

export const ordersRouter = Router();

ordersRouter.get("/mine", authenticate, asyncHandler(orderController.listMine));
ordersRouter.post("/", optionalAuthenticate, asyncHandler(orderController.create));
