import { Schema, model } from "mongoose";

const milkRecordSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    cowId: { type: String, required: true, index: true },
    cowName: { type: String, required: true },
    litres: { type: Number, required: true, min: 0 },
    session: { type: String, enum: ["morning", "evening"], required: true },
    recordedByUserId: { type: String, required: true, index: true },
    recordedByName: { type: String, required: true },
    notes: { type: String, default: "" },
    recordedAt: { type: Date, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const MilkRecord = model("MilkRecord", milkRecordSchema);
