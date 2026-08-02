export const ROLES = {
  CUSTOMER: "customer",
  VOLUNTEER: "volunteer",
  FARM_STAFF: "farm_staff",
  INVENTORY_MANAGER: "inventory_manager",
  SALES_TEAM: "sales_team",
  VETERINARY_DOCTOR: "veterinary_doctor",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

export type RoleCode = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  USERS_READ: "users:read",
  USERS_WRITE: "users:write",
  PRODUCTS_READ: "products:read",
  PRODUCTS_WRITE: "products:write",
  ORDERS_READ: "orders:read",
  ORDERS_WRITE: "orders:write",
  ORDERS_MANAGE: "orders:manage",
  DONATIONS_READ: "donations:read",
  DONATIONS_WRITE: "donations:write",
  ADOPTIONS_READ: "adoptions:read",
  ADOPTIONS_WRITE: "adoptions:write",
  SUBSCRIPTIONS_READ: "subscriptions:read",
  SUBSCRIPTIONS_WRITE: "subscriptions:write",
  FARM_READ: "farm:read",
  FARM_WRITE: "farm:write",
  INVENTORY_READ: "inventory:read",
  INVENTORY_WRITE: "inventory:write",
  CMS_READ: "cms:read",
  CMS_WRITE: "cms:write",
  REPORTS_READ: "reports:read",
  SETTINGS_WRITE: "settings:write",
  ROLES_MANAGE: "roles:manage",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

/** Default role → permission grants (seeded into Role collection). */
export const ROLE_PERMISSIONS: Record<RoleCode, PermissionCode[]> = {
  [ROLES.CUSTOMER]: [
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_WRITE,
    PERMISSIONS.DONATIONS_WRITE,
    PERMISSIONS.ADOPTIONS_WRITE,
    PERMISSIONS.SUBSCRIPTIONS_WRITE,
  ],
  [ROLES.VOLUNTEER]: [PERMISSIONS.CMS_READ, PERMISSIONS.FARM_READ],
  [ROLES.FARM_STAFF]: [PERMISSIONS.FARM_READ, PERMISSIONS.FARM_WRITE],
  [ROLES.INVENTORY_MANAGER]: [
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.INVENTORY_WRITE,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.PRODUCTS_WRITE,
  ],
  [ROLES.SALES_TEAM]: [
    PERMISSIONS.ORDERS_READ,
    PERMISSIONS.ORDERS_MANAGE,
    PERMISSIONS.PRODUCTS_READ,
    PERMISSIONS.USERS_READ,
  ],
  [ROLES.VETERINARY_DOCTOR]: [PERMISSIONS.FARM_READ, PERMISSIONS.FARM_WRITE],
  [ROLES.ADMIN]: ALL_PERMISSIONS.filter((p) => p !== PERMISSIONS.ROLES_MANAGE),
  [ROLES.SUPER_ADMIN]: ALL_PERMISSIONS,
};
