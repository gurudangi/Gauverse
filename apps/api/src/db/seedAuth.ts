import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { authConfig } from "../config/auth.js";
import { Role } from "../models/Role.js";
import { User } from "../models/User.js";
import {
  ROLE_PERMISSIONS,
  ROLES,
  type RoleCode,
} from "../shared/rbac/permissions.js";

const ROLE_LABELS: Record<RoleCode, string> = {
  [ROLES.CUSTOMER]: "Customer",
  [ROLES.VOLUNTEER]: "Volunteer",
  [ROLES.FARM_STAFF]: "Farm Staff",
  [ROLES.INVENTORY_MANAGER]: "Inventory Manager",
  [ROLES.SALES_TEAM]: "Sales Team",
  [ROLES.VETERINARY_DOCTOR]: "Veterinary Doctor",
  [ROLES.ADMIN]: "Admin",
  [ROLES.SUPER_ADMIN]: "Super Admin",
};

async function ensureUser(opts: {
  email: string;
  password: string;
  name: string;
  roles: RoleCode[];
  label: string;
}): Promise<void> {
  const existing = await User.findOne({ email: opts.email });
  if (existing) {
    console.log(`RBAC: ${opts.label} already exists (${opts.email})`);
    return;
  }

  const passwordHash = await bcrypt.hash(opts.password, authConfig.bcryptRounds);
  await User.create({
    id: uuid(),
    name: opts.name,
    email: opts.email,
    phone: "",
    passwordHash,
    roles: opts.roles,
    isActive: true,
  });
  console.log(`RBAC: seeded ${opts.label} (${opts.email})`);
}

export async function seedRolesAndAdmin(): Promise<void> {
  for (const code of Object.values(ROLES)) {
    await Role.updateOne(
      { code },
      {
        $set: {
          code,
          name: ROLE_LABELS[code],
          permissions: ROLE_PERMISSIONS[code],
        },
      },
      { upsert: true },
    );
  }
  console.log(`RBAC: synced ${Object.keys(ROLES).length} roles`);

  await ensureUser({
    email: authConfig.superAdminEmail,
    password: authConfig.superAdminPassword,
    name: authConfig.superAdminName,
    roles: [ROLES.SUPER_ADMIN],
    label: "super admin",
  });

  await ensureUser({
    email: authConfig.farmStaffEmail,
    password: authConfig.farmStaffPassword,
    name: authConfig.farmStaffName,
    roles: [ROLES.FARM_STAFF],
    label: "farm staff",
  });

  await ensureUser({
    email: authConfig.inventoryEmail,
    password: authConfig.inventoryPassword,
    name: authConfig.inventoryName,
    roles: [ROLES.INVENTORY_MANAGER],
    label: "inventory manager",
  });
}
