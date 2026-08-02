import { PaymentTransaction } from "../../models/PaymentTransaction.js";
import { QUERY_MAX_MS } from "../../shared/constants.js";
import type { PaymentTransactionDoc } from "./payment.types.js";

function toIso(v: Date | string | null | undefined): string | null {
  if (!v) return null;
  return v instanceof Date ? v.toISOString() : new Date(v).toISOString();
}

function toPayment(doc: {
  id: string;
  purpose: PaymentTransactionDoc["purpose"];
  status: PaymentTransactionDoc["status"];
  amount: number;
  amountPaise: number;
  currency?: string;
  customerName: string;
  email: string;
  phone: string;
  userId?: string | null;
  payload: Record<string, unknown>;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  receipt: string;
  entityType?: string | null;
  entityId?: string | null;
  fulfillment?: Record<string, unknown> | null;
  failureReason?: string | null;
  paidAt?: Date | string | null;
  createdAt: Date | string;
}): PaymentTransactionDoc {
  return {
    id: doc.id,
    purpose: doc.purpose,
    status: doc.status,
    amount: doc.amount,
    amountPaise: doc.amountPaise,
    currency: doc.currency ?? "INR",
    customerName: doc.customerName,
    email: doc.email,
    phone: doc.phone,
    userId: doc.userId ?? null,
    payload: doc.payload,
    razorpayOrderId: doc.razorpayOrderId ?? null,
    razorpayPaymentId: doc.razorpayPaymentId ?? null,
    razorpaySignature: doc.razorpaySignature ?? null,
    receipt: doc.receipt,
    entityType: doc.entityType ?? null,
    entityId: doc.entityId ?? null,
    fulfillment: doc.fulfillment ?? null,
    failureReason: doc.failureReason ?? null,
    paidAt: toIso(doc.paidAt),
    createdAt: toIso(doc.createdAt)!,
  };
}

export const paymentRepository = {
  async create(row: PaymentTransactionDoc): Promise<PaymentTransactionDoc> {
    await PaymentTransaction.create({
      ...row,
      paidAt: row.paidAt ? new Date(row.paidAt) : null,
      createdAt: new Date(row.createdAt),
    });
    return row;
  },

  async findById(id: string): Promise<PaymentTransactionDoc | null> {
    const row = await PaymentTransaction.findOne({ id }).maxTimeMS(QUERY_MAX_MS).lean();
    return row ? toPayment(row as Parameters<typeof toPayment>[0]) : null;
  },

  async findByRazorpayOrderId(
    razorpayOrderId: string,
  ): Promise<PaymentTransactionDoc | null> {
    const row = await PaymentTransaction.findOne({ razorpayOrderId })
      .maxTimeMS(QUERY_MAX_MS)
      .lean();
    return row ? toPayment(row as Parameters<typeof toPayment>[0]) : null;
  },

  async claimForFulfillment(id: string): Promise<PaymentTransactionDoc | null> {
    const row = await PaymentTransaction.findOneAndUpdate(
      { id, status: "created" },
      { $set: { status: "processing" } },
      { new: true, maxTimeMS: QUERY_MAX_MS },
    ).lean();
    return row ? toPayment(row as Parameters<typeof toPayment>[0]) : null;
  },

  async markPaid(
    id: string,
    data: {
      razorpayPaymentId: string;
      razorpaySignature: string;
      entityType: string;
      entityId: string;
      fulfillment: Record<string, unknown>;
    },
  ): Promise<PaymentTransactionDoc | null> {
    const row = await PaymentTransaction.findOneAndUpdate(
      { id, status: { $in: ["created", "processing"] } },
      {
        $set: {
          status: "paid",
          razorpayPaymentId: data.razorpayPaymentId,
          razorpaySignature: data.razorpaySignature,
          entityType: data.entityType,
          entityId: data.entityId,
          fulfillment: data.fulfillment,
          failureReason: null,
          paidAt: new Date(),
        },
      },
      { new: true, maxTimeMS: QUERY_MAX_MS },
    ).lean();
    return row ? toPayment(row as Parameters<typeof toPayment>[0]) : null;
  },

  async markFailed(id: string, reason: string): Promise<void> {
    await PaymentTransaction.updateOne(
      { id },
      { $set: { status: "failed", failureReason: reason } },
    );
  },

  async listRecent(limit = 50): Promise<PaymentTransactionDoc[]> {
    const rows = await PaymentTransaction.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .maxTimeMS(QUERY_MAX_MS)
      .lean();
    return rows.map((r) => toPayment(r as Parameters<typeof toPayment>[0]));
  },
};
