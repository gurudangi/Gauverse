import { Role } from "../../models/Role.js";
import { User } from "../../models/User.js";
import type { PermissionCode, RoleCode } from "../../shared/rbac/permissions.js";

export const authRepository = {
  async findByEmail(email: string, withSecrets = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    if (withSecrets) {
      query.select("+passwordHash +refreshTokenHash +refreshTokenExpiresAt");
    }
    return query.lean();
  },

  async findById(id: string, withSecrets = false) {
    const query = User.findOne({ id });
    if (withSecrets) {
      query.select("+passwordHash +refreshTokenHash +refreshTokenExpiresAt");
    }
    return query.lean();
  },

  async createUser(data: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    passwordHash: string;
    roles: RoleCode[];
  }) {
    const user = await User.create(data);
    return user.toObject();
  },

  async setRefreshToken(
    userId: string,
    refreshTokenHash: string | null,
    refreshTokenExpiresAt: Date | null,
  ) {
    await User.updateOne(
      { id: userId },
      { $set: { refreshTokenHash, refreshTokenExpiresAt } },
    );
  },

  async getPermissionsForRoles(roles: RoleCode[]): Promise<PermissionCode[]> {
    const docs = await Role.find({ code: { $in: roles } }).lean();
    const set = new Set<PermissionCode>();
    for (const role of docs) {
      for (const permission of role.permissions as PermissionCode[]) {
        set.add(permission);
      }
    }
    return [...set];
  },

  async updateProfile(
    userId: string,
    data: { name?: string; phone?: string },
  ) {
    await User.updateOne({ id: userId }, { $set: data });
    return this.findById(userId);
  },
};
