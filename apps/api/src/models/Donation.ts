import { Schema, model } from "mongoose";

const donationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: null, index: true },
    donorName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["gauseva", "feed", "medical", "infrastructure", "general", "monthly"],
    },
    amount: { type: Number, required: true, min: 1 },
    message: { type: String, default: "" },
    isRecurring: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["completed", "refunded"],
      default: "completed",
    },
    paymentMode: {
      type: String,
      enum: ["recorded", "razorpay"],
      default: "recorded",
    },
    receiptNumber: { type: String, required: true, unique: true },
    certificateId: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const Donation = model("Donation", donationSchema);
