import { Subscription } from "../../models/Subscription.js";
import { QUERY_MAX_MS } from "../../shared/constants.js";
import type { SubscriptionDoc } from "./subscription.types.js";

function toIso(v: Date | string | null | undefined): string | null {
  if (!v) return null;
  return v instanceof Date ? v.toISOString() : new Date(v).toISOString();
}

function toSubscription(doc: {
  id: string;
  userId?: string | null;
  planCode: SubscriptionDoc["planCode"];
  planName: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  quantityLitres: number;
  frequency: SubscriptionDoc["frequency"];
  amountMonthly: number;
  status: SubscriptionDoc["status"];
  paymentMode: SubscriptionDoc["paymentMode"];
  receiptNumber: string;
  startsAt: Date | string;
  nextDeliveryAt: Date | string;
  pausedAt?: Date | string | null;
  cancelledAt?: Date | string | null;
  createdAt: Date | string;
}): SubscriptionDoc {
  return {
    id: doc.id,
    userId: doc.userId ?? null,
    planCode: doc.planCode,
    planName: doc.planName,
    customerName: doc.customerName,
    email: doc.email,
    phone: doc.phone,
    address: doc.address,
    quantityLitres: doc.quantityLitres,
    frequency: doc.frequency,
    amountMonthly: doc.amountMonthly,
    status: doc.status,
    paymentMode: doc.paymentMode,
    receiptNumber: doc.receiptNumber,
    startsAt: toIso(doc.startsAt)!,
    nextDeliveryAt: toIso(doc.nextDeliveryAt)!,
    pausedAt: toIso(doc.pausedAt),
    cancelledAt: toIso(doc.cancelledAt),
    createdAt: toIso(doc.createdAt)!,
  };
}

export const subscriptionRepository = {
  async create(sub: SubscriptionDoc): Promise<SubscriptionDoc> {
    await Subscription.create({
      ...sub,
      startsAt: new Date(sub.startsAt),
      nextDeliveryAt: new Date(sub.nextDeliveryAt),
      pausedAt: sub.pausedAt ? new Date(sub.pausedAt) : null,
      cancelledAt: sub.cancelledAt ? new Date(sub.cancelledAt) : null,
      createdAt: new Date(sub.createdAt),
    });
    return sub;
  },

  async findById(id: string): Promise<SubscriptionDoc | null> {
    const row = await Subscription.findOne({ id }).maxTimeMS(QUERY_MAX_MS).lean();
    return row ? toSubscription(row as Parameters<typeof toSubscription>[0]) : null;
  },

  async findByUserId(userId: string): Promise<SubscriptionDoc[]> {
    const rows = await Subscription.find({ userId })
      .sort({ createdAt: -1 })
      .maxTimeMS(QUERY_MAX_MS)
      .lean();
    return rows.map((r) => toSubscription(r as Parameters<typeof toSubscription>[0]));
  },

  async findAll(): Promise<SubscriptionDoc[]> {
    const rows = await Subscription.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .maxTimeMS(QUERY_MAX_MS)
      .lean();
    return rows.map((r) => toSubscription(r as Parameters<typeof toSubscription>[0]));
  },

  async updateStatus(
    id: string,
    data: {
      status: SubscriptionDoc["status"];
      pausedAt?: Date | null;
      cancelledAt?: Date | null;
      nextDeliveryAt?: Date;
    },
  ): Promise<SubscriptionDoc | null> {
    const row = await Subscription.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true, maxTimeMS: QUERY_MAX_MS },
    ).lean();
    return row ? toSubscription(row as Parameters<typeof toSubscription>[0]) : null;
  },

  async count(): Promise<number> {
    return Subscription.countDocuments();
  },
};
