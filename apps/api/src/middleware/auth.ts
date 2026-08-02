import type { NextFunction, Response } from "express";
import { AppError } from "../shared/errors/AppError.js";
import type { PermissionCode } from "../shared/rbac/permissions.js";
import { authRepository } from "../modules/auth/auth.repository.js";
import type { AuthenticatedRequest } from "../modules/auth/auth.types.js";
import { verifyAccessToken } from "../modules/auth/token.js";

async function loadUserFromToken(token: string) {
  const payload = verifyAccessToken(token);
  const user = await authRepository.findById(payload.sub);
  if (!user || !user.isActive) {
    return null;
  }
  const permissions = await authRepository.getPermissionsForRoles(
    user.roles as typeof payload.roles,
  );
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles as typeof payload.roles,
    permissions,
  };
}

export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = header.slice("Bearer ".length).trim();
    const authUser = await loadUserFromToken(token);
    if (!authUser) {
      throw new AppError("Authentication required", 401);
    }

    req.user = authUser;
    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    next(new AppError("Invalid or expired access token", 401));
  }
}

/** Attaches user when a valid Bearer token is present; never fails the request. */
export async function optionalAuthenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      const token = header.slice("Bearer ".length).trim();
      const authUser = await loadUserFromToken(token);
      if (authUser) req.user = authUser;
    }
  } catch {
    // ignore invalid optional tokens
  }
  next();
}

export function requirePermission(...required: PermissionCode[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Authentication required", 401));
      return;
    }

    const allowed = required.every((permission) =>
      req.user!.permissions.includes(permission),
    );

    if (!allowed) {
      next(new AppError("Forbidden: insufficient permissions", 403));
      return;
    }

    next();
  };
}
