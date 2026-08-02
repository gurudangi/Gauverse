import { Schema, model } from "mongoose";

const adoptionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: null, index: true },
    cowId: { type: String, required: true, index: true },
    cowName: { type: String, required: true },
    adopterName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    plan: {
      type: String,
      enum: ["monthly", "quarterly", "yearly"],
      required: true,
    },
    amount: { type: Number, required: true, min: 1 },
    months: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    paymentMode: {
      type: String,
      enum: ["recorded", "razorpay"],
      default: "recorded",
    },
    receiptNumber: { type: String, required: true, unique: true },
    certificateId: { type: String, required: true, unique: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const Adoption = model("Adoption", adoptionSchema);
