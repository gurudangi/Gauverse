import { Schema, model } from "mongoose";

const vaccinationRecordSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    cowId: { type: String, required: true, index: true },
    cowName: { type: String, required: true },
    vaccineName: { type: String, required: true },
    dose: { type: String, default: "" },
    nextDueAt: { type: Date, default: null },
    recordedByUserId: { type: String, required: true, index: true },
    recordedByName: { type: String, required: true },
    notes: { type: String, default: "" },
    recordedAt: { type: Date, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const VaccinationRecord = model("VaccinationRecord", vaccinationRecordSchema);
