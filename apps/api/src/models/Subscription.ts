import { Schema, model } from "mongoose";

const subscriptionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: null, index: true },
    planCode: { type: String, required: true },
    planName: { type: String, required: true },
    customerName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    quantityLitres: { type: Number, required: true, min: 1 },
    frequency: {
      type: String,
      enum: ["daily", "weekly"],
      required: true,
    },
    amountMonthly: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["active", "paused", "cancelled"],
      default: "active",
      index: true,
    },
    paymentMode: {
      type: String,
      enum: ["recorded", "razorpay"],
      default: "recorded",
    },
    receiptNumber: { type: String, required: true, unique: true },
    startsAt: { type: Date, required: true },
    nextDeliveryAt: { type: Date, required: true },
    pausedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const Subscription = model("Subscription", subscriptionSchema);
