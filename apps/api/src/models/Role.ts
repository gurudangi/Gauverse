import { Schema, model } from "mongoose";
import type { PermissionCode, RoleCode } from "../shared/rbac/permissions.js";

const roleSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    permissions: { type: [String], required: true, default: [] },
  },
  { timestamps: true, versionKey: false },
);

export interface RoleDocument {
  code: RoleCode;
  name: string;
  permissions: PermissionCode[];
}

export const Role = model("Role", roleSchema);
