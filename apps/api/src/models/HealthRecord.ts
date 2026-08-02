import { Schema, model } from "mongoose";

const healthRecordSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    cowId: { type: String, required: true, index: true },
    cowName: { type: String, required: true },
    condition: {
      type: String,
      enum: ["healthy", "under_observation", "sick", "recovering"],
      required: true,
    },
    temperatureC: { type: Number, default: null },
    symptoms: { type: String, default: "" },
    treatment: { type: String, default: "" },
    medicineGiven: { type: String, default: "" },
    recordedByUserId: { type: String, required: true, index: true },
    recordedByName: { type: String, required: true },
    notes: { type: String, default: "" },
    recordedAt: { type: Date, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const HealthRecord = model("HealthRecord", healthRecordSchema);
