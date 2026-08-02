import { Schema, model } from "mongoose";

const orderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, default: null, index: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, index: true },
    address: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "delivered"],
      default: "pending",
    },
    paymentMode: {
      type: String,
      enum: ["recorded", "razorpay"],
      default: "recorded",
    },
    paymentId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const Order = model("Order", orderSchema);
