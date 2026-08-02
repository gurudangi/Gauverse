import type { Response } from "express";
import { AppError } from "../../shared/errors/AppError.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { donationService } from "./donation.service.js";
import { createDonationSchema } from "./donation.validators.js";

export const donationController = {
  async create(req: AuthenticatedRequest, res: Response) {
    const parsed = createDonationSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message ?? "Invalid donation data",
        400,
      );
    }

    const donation = await donationService.createDonation({
      ...parsed.data,
      userId: req.user?.id ?? null,
    });

    res.status(201).json({
      success: true,
      message: "Thank you! Your donation receipt and certificate references are ready.",
      data: {
        donationId: donation.id,
        receiptNumber: donation.receiptNumber,
        certificateId: donation.certificateId,
        amount: donation.amount,
        type: donation.type,
        isRecurring: donation.isRecurring,
      },
    });
  },

  async listMine(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    const donations = await donationService.listMyDonations(req.user.id);
    res.json({ success: true, data: donations });
  },
};
