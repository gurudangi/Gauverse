import { v4 as uuid } from "uuid";
import { AppError } from "../../shared/errors/AppError.js";
import { donationRepository } from "./donation.repository.js";
import type { CreateDonationInput, DonationDoc } from "./donation.types.js";

function stamp(prefix: string): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const suffix = uuid().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `${prefix}-${y}${m}${day}-${suffix}`;
}

export const donationService = {
  async createDonation(input: CreateDonationInput): Promise<DonationDoc> {
    if (input.amount < 11) {
      throw new AppError("Minimum donation is ₹11", 400);
    }

    const donation: DonationDoc = {
      id: uuid(),
      userId: input.userId ?? null,
      donorName: input.donorName,
      email: input.email.toLowerCase(),
      phone: input.phone,
      type: input.type,
      amount: input.amount,
      message: input.message ?? "",
      isRecurring: input.type === "monthly",
      status: "completed",
      paymentMode: input.paymentMode ?? "recorded",
      receiptNumber: stamp("RCP"),
      certificateId: stamp("CERT"),
      createdAt: new Date().toISOString(),
    };

    return donationRepository.create(donation);
  },

  async listMyDonations(userId: string) {
    return donationRepository.findByUserId(userId);
  },

  async getDonation(id: string) {
    const donation = await donationRepository.findById(id);
    if (!donation) {
      throw new AppError("Donation not found", 404);
    }
    return donation;
  },
};
