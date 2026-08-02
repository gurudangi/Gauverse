import { Schema, model } from "mongoose";

export const MOVEMENT_TYPES = [
  "purchase",
  "receive",
  "issue",
  "sale",
  "adjustment",
  "return",
] as const;

const inventoryMovementSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    itemId: { type: String, required: true, index: true },
    itemName: { type: String, required: true },
    sku: { type: String, required: true },
    type: {
      type: String,
      enum: MOVEMENT_TYPES,
      required: true,
      index: true,
    },
    quantityDelta: { type: Number, required: true },
    quantityAfter: { type: Number, required: true, min: 0 },
    unitCost: { type: Number, default: null },
    referenceType: { type: String, default: null },
    referenceId: { type: String, default: null, index: true },
    notes: { type: String, default: "" },
    recordedByUserId: { type: String, default: null, index: true },
    recordedByName: { type: String, default: "System" },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false },
);

export const InventoryMovement = model("InventoryMovement", inventoryMovementSchema);
