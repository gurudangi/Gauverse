import { Schema, model } from "mongoose";

const cowSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    breed: { type: String, required: true, default: "Gir" },
    ageYears: { type: Number, required: true, min: 0 },
    milkYieldLabel: { type: String, required: true },
    image: { type: String, required: true },
    traits: { type: [String], default: [] },
    description: { type: String, required: true },
    availableForAdoption: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["healthy", "under_care", "retired"],
      default: "healthy",
    },
  },
  { versionKey: false },
);

export const Cow = model("Cow", cowSchema);
