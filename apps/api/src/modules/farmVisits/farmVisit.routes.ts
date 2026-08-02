import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { farmVisitController } from "./farmVisit.controller.js";

export const farmVisitsRouter = Router();

farmVisitsRouter.post("/", asyncHandler(farmVisitController.create));
