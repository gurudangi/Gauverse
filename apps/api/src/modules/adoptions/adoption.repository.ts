import { Adoption } from "../../models/Adoption.js";
import { QUERY_MAX_MS } from "../../shared/constants.js";
import type { AdoptionDoc } from "./adoption.types.js";

function toAdoption(doc: {
  id: string;
  userId?: string | null;
  cowId: string;
  cowName: string;
  adopterName: string;
  email: string;
  phone: string;
  plan: AdoptionDoc["plan"];
  amount: number;
  months: number;
  status: AdoptionDoc["status"];
  paymentMode: AdoptionDoc["paymentMode"];
  receiptNumber: string;
  certificateId: string;
  startsAt: Date | string;
  endsAt: Date | string;
  createdAt: Date | string;
}): AdoptionDoc {
  const toIso = (v: Date | string) =>
    v instanceof Date ? v.toISOString() : new Date(v).toISOString();
  return {
    id: doc.id,
    userId: doc.userId ?? null,
    cowId: doc.cowId,
    cowName: doc.cowName,
    adopterName: doc.adopterName,
    email: doc.email,
    phone: doc.phone,
    plan: doc.plan,
    amount: doc.amount,
    months: doc.months,
    status: doc.status,
    paymentMode: doc.paymentMode,
    receiptNumber: doc.receiptNumber,
    certificateId: doc.certificateId,
    startsAt: toIso(doc.startsAt),
    endsAt: toIso(doc.endsAt),
    createdAt: toIso(doc.createdAt),
  };
}

export const adoptionRepository = {
  async create(adoption: AdoptionDoc): Promise<AdoptionDoc> {
    await Adoption.create({
      ...adoption,
      startsAt: new Date(adoption.startsAt),
      endsAt: new Date(adoption.endsAt),
      createdAt: new Date(adoption.createdAt),
    });
    return adoption;
  },

  async findByUserId(userId: string): Promise<AdoptionDoc[]> {
    const rows = await Adoption.find({ userId })
      .sort({ createdAt: -1 })
      .maxTimeMS(QUERY_MAX_MS)
      .lean();
    return rows.map(toAdoption);
  },

  async findAll(): Promise<AdoptionDoc[]> {
    const rows = await Adoption.find()
      .sort({ createdAt: -1 })
      .maxTimeMS(QUERY_MAX_MS)
      .lean();
    return rows.map(toAdoption);
  },

  async count(): Promise<number> {
    return Adoption.countDocuments();
  },
};
