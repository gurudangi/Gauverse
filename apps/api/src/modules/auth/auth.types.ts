import type { Request } from "express";
import type { PermissionCode, RoleCode } from "../shared/rbac/permissions.js";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: RoleCode[];
  permissions: PermissionCode[];
}

export type AuthenticatedRequest = Request & {
  user?: AuthUser;
};
