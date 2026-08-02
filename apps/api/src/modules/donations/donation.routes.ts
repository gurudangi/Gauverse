import { Router } from "express";
import { authenticate, optionalAuthenticate } from "../../middleware/auth.js";
import { asyncHandler } from "../../shared/middleware/asyncHandler.js";
import { donationController } from "./donation.controller.js";

export const donationsRouter = Router();

donationsRouter.get("/mine", authenticate, asyncHandler(donationController.listMine));
donationsRouter.post("/", optionalAuthenticate, asyncHandler(donationController.create));
