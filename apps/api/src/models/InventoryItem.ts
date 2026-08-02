import { Schema, model } from "mongoose";

export const INVENTORY_CATEGORIES = [
  "products",
  "feed",
  "medicine",
  "packaging",
  "cleaning",
  "office",
] as const;

const inventoryItemSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: INVENTORY_CATEGORIES,
      required: true,
      index: true,
    },
    unit: { type: String, required: true },
    quantityOnHand: { type: Number, required: true, min: 0, default: 0 },
    reorderLevel: { type: Number, required: true, min: 0, default: 5 },
    productId: { type: String, default: null, index: true },
    location: { type: String, default: "Main store" },
    notes: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const InventoryItem = model("InventoryItem", inventoryItemSchema);
