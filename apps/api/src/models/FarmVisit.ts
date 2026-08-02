import { Schema, model } from "mongoose";

const farmVisitSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    guests: { type: Number, required: true },
    timeSlot: { type: String, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const FarmVisit = model("FarmVisit", farmVisitSchema);
