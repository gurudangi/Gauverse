import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    priceLabel: { type: String, required: true },
    unit: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    badge: { type: String, default: null },
    stock: { type: Number, required: true, min: 0 },
  },
  { versionKey: false },
);

export const Product = model("Product", productSchema);
