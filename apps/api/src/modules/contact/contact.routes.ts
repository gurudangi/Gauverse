import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { contactController } from "./contact.controller.js";

export const contactRouter = Router();

contactRouter.post("/", asyncHandler(contactController.create));
