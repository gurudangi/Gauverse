import { Schema, model } from "mongoose";

const dailyReportSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    reportDate: { type: String, required: true, index: true },
    summary: { type: String, required: true },
    cowsChecked: { type: Number, required: true, min: 0 },
    milkTotalLitres: { type: Number, required: true, min: 0 },
    issues: { type: String, default: "" },
    recordedByUserId: { type: String, required: true, index: true },
    recordedByName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

dailyReportSchema.index(
  { reportDate: 1, recordedByUserId: 1 },
  { unique: true },
);

export const DailyReport = model("DailyReport", dailyReportSchema);
