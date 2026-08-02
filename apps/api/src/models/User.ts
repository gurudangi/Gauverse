import { Schema, model, type InferSchemaType } from "mongoose";
import type { RoleCode } from "../shared/rbac/permissions.js";

const userSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, trim: true, default: "" },
    passwordHash: { type: String, required: true, select: false },
    roles: {
      type: [String],
      required: true,
      default: ["customer"],
    },
    isActive: { type: Boolean, default: true },
    refreshTokenHash: { type: String, default: null, select: false },
    refreshTokenExpiresAt: { type: Date, default: null, select: false },
  },
  { timestamps: true, versionKey: false },
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  roles: RoleCode[];
};

export const User = model("User", userSchema);
