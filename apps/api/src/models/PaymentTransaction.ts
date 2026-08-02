import { Schema, model } from "mongoose";

const paymentTransactionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    purpose: {
      type: String,
      enum: ["donation", "order", "adoption", "subscription"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["created", "processing", "paid", "failed", "expired"],
      default: "created",
      index: true,
    },
    amount: { type: Number, required: true, min: 1 },
    amountPaise: { type: Number, required: true, min: 100 },
    currency: { type: String, default: "INR" },
    customerName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    userId: { type: String, default: null, index: true },
    payload: { type: Schema.Types.Mixed, required: true },
    razorpayOrderId: { type: String, default: null, index: true },
    razorpayPaymentId: { type: String, default: null, index: true },
    razorpaySignature: { type: String, default: null },
    receipt: { type: String, required: true, unique: true },
    entityType: { type: String, default: null },
    entityId: { type: String, default: null },
    fulfillment: { type: Schema.Types.Mixed, default: null },
    failureReason: { type: String, default: null },
    paidAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const PaymentTransaction = model(
  "PaymentTransaction",
  paymentTransactionSchema,
);
