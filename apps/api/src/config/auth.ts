import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name]?.trim() || fallback;
  if (!value) {
    throw new Error(`${name} is required. Set it in apps/api/.env`);
  }
  return value;
}

export const authConfig = {
  jwtAccessSecret: required(
    "JWT_ACCESS_SECRET",
    "dev-access-secret-change-me-in-production",
  ),
  jwtRefreshSecret: required(
    "JWT_REFRESH_SECRET",
    "dev-refresh-secret-change-me-in-production",
  ),
  accessTokenTtl: process.env.JWT_ACCESS_TTL?.trim() || "15m",
  refreshTokenTtl: process.env.JWT_REFRESH_TTL?.trim() || "7d",
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
  superAdminEmail:
    process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase() || "admin@gauverse.local",
  superAdminPassword: process.env.SUPER_ADMIN_PASSWORD?.trim() || "ChangeMe@12345",
  superAdminName: process.env.SUPER_ADMIN_NAME?.trim() || "Super Admin",
  farmStaffEmail:
    process.env.FARM_STAFF_EMAIL?.trim().toLowerCase() || "farm@gauverse.local",
  farmStaffPassword: process.env.FARM_STAFF_PASSWORD?.trim() || "ChangeMe@12345",
  farmStaffName: process.env.FARM_STAFF_NAME?.trim() || "Farm Staff",
  inventoryEmail:
    process.env.INVENTORY_EMAIL?.trim().toLowerCase() || "inventory@gauverse.local",
  inventoryPassword: process.env.INVENTORY_PASSWORD?.trim() || "ChangeMe@12345",
  inventoryName: process.env.INVENTORY_NAME?.trim() || "Inventory Manager",
};
