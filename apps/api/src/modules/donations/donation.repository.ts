import { Donation } from "../../models/Donation.js";
import { QUERY_MAX_MS } from "../../shared/constants.js";
import type { DonationDoc } from "./donation.types.js";

function toDonation(doc: {
  id: string;
  userId?: string | null;
  donorName: string;
  email: string;
  phone: string;
  type: DonationDoc["type"];
  amount: number;
  message?: string;
  isRecurring: boolean;
  status: DonationDoc["status"];
  paymentMode: DonationDoc["paymentMode"];
  receiptNumber: string;
  certificateId: string;
  createdAt: Date | string;
}): DonationDoc {
  return {
    id: doc.id,
    userId: doc.userId ?? null,
    donorName: doc.donorName,
    email: doc.email,
    phone: doc.phone,
    type: doc.type,
    amount: doc.amount,
    message: doc.message ?? "",
    isRecurring: doc.isRecurring,
    status: doc.status,
    paymentMode: doc.paymentMode,
    receiptNumber: doc.receiptNumber,
    certificateId: doc.certificateId,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : new Date(doc.createdAt).toISOString(),
  };
}

export const donationRepository = {
  async create(donation: DonationDoc): Promise<DonationDoc> {
    await Donation.create({
      ...donation,
      createdAt: new Date(donation.createdAt),
    });
    return donation;
  },

  async findByUserId(userId: string): Promise<DonationDoc[]> {
    const rows = await Donation.find({ userId })
      .sort({ createdAt: -1 })
      .maxTimeMS(QUERY_MAX_MS)
      .lean();
    return rows.map(toDonation);
  },

  async findById(id: string): Promise<DonationDoc | null> {
    const row = await Donation.findOne({ id }).maxTimeMS(QUERY_MAX_MS).lean();
    return row ? toDonation(row) : null;
  },
};
