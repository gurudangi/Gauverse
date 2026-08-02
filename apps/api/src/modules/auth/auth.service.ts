import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { authConfig } from "../../config/auth.js";
import { AppError } from "../../shared/errors/AppError.js";
import { ROLES, type RoleCode } from "../../shared/rbac/permissions.js";
import { authRepository } from "./auth.repository.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "./token.js";

function publicUser(user: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roles: RoleCode[];
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    roles: user.roles,
  };
}

function refreshExpiryDate(): Date {
  const match = /^(\d+)([dhms])$/.exec(authConfig.refreshTokenTtl);
  const amount = match ? Number(match[1]) : 7;
  const unit = match?.[2] ?? "d";
  const ms =
    unit === "d"
      ? amount * 24 * 60 * 60 * 1000
      : unit === "h"
        ? amount * 60 * 60 * 1000
        : unit === "m"
          ? amount * 60 * 1000
          : amount * 1000;
  return new Date(Date.now() + ms);
}

async function issueTokens(user: {
  id: string;
  email: string;
  name: string;
  phone?: string;
  roles: RoleCode[];
}) {
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    roles: user.roles,
  });
  const refreshToken = signRefreshToken(user.id);
  const refreshTokenHash = await bcrypt.hash(refreshToken, authConfig.bcryptRounds);
  await authRepository.setRefreshToken(user.id, refreshTokenHash, refreshExpiryDate());

  const permissions = await authRepository.getPermissionsForRoles(user.roles);

  return {
    user: publicUser(user),
    permissions,
    accessToken,
    refreshToken,
  };
}

export const authService = {
  async register(input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError("An account with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, authConfig.bcryptRounds);
    const user = await authRepository.createUser({
      id: uuid(),
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      passwordHash,
      roles: [ROLES.CUSTOMER],
    });

    return issueTokens({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles as RoleCode[],
    });
  },

  async login(input: { email: string; password: string }) {
    const user = await authRepository.findByEmail(input.email, true);
    if (!user || !user.isActive) {
      throw new AppError("Invalid email or password", 401);
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash as string);
    if (!valid) {
      throw new AppError("Invalid email or password", 401);
    }

    return issueTokens({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles as RoleCode[],
    });
  },

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const user = await authRepository.findById(payload.sub, true);
    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    if (
      user.refreshTokenExpiresAt &&
      new Date(user.refreshTokenExpiresAt as Date).getTime() < Date.now()
    ) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const matches = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash as string,
    );
    if (!matches) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    return issueTokens({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles as RoleCode[],
    });
  },

  async logout(userId: string) {
    await authRepository.setRefreshToken(userId, null, null);
  },

  async me(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new AppError("User not found", 404);
    }
    const permissions = await authRepository.getPermissionsForRoles(
      user.roles as RoleCode[],
    );
    return {
      user: publicUser({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roles: user.roles as RoleCode[],
      }),
      permissions,
    };
  },

  async updateProfile(userId: string, input: { name?: string; phone?: string }) {
    if (!input.name && input.phone === undefined) {
      throw new AppError("Nothing to update", 400);
    }
    const user = await authRepository.updateProfile(userId, input);
    if (!user || !user.isActive) {
      throw new AppError("User not found", 404);
    }
    return publicUser({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles as RoleCode[],
    });
  },
};
