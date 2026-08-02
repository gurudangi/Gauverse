import jwt from "jsonwebtoken";
import { authConfig } from "../../config/auth.js";
import type { RoleCode } from "../../shared/rbac/permissions.js";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  roles: RoleCode[];
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  type: "refresh";
}

export function signAccessToken(payload: Omit<AccessTokenPayload, "type">): string {
  return jwt.sign({ ...payload, type: "access" }, authConfig.jwtAccessSecret, {
    expiresIn: authConfig.accessTokenTtl,
  } as jwt.SignOptions);
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: "refresh" }, authConfig.jwtRefreshSecret, {
    expiresIn: authConfig.refreshTokenTtl,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, authConfig.jwtAccessSecret) as AccessTokenPayload;
  if (payload.type !== "access") {
    throw new Error("Invalid access token");
  }
  return payload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, authConfig.jwtRefreshSecret) as RefreshTokenPayload;
  if (payload.type !== "refresh") {
    throw new Error("Invalid refresh token");
  }
  return payload;
}
