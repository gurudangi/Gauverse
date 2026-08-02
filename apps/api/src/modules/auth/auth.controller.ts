import type { Response } from "express";
import { AppError } from "../../shared/errors/AppError.js";
import type { AuthenticatedRequest } from "./auth.types.js";
import { authService } from "./auth.service.js";
import { loginSchema, refreshSchema, registerSchema, updateProfileSchema } from "./auth.validators.js";

export const authController = {
  async register(req: AuthenticatedRequest, res: Response) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid registration data", 400);
    }
    const result = await authService.register(parsed.data);
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: result,
    });
  },

  async login(req: AuthenticatedRequest, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid login data", 400);
    }
    const result = await authService.login(parsed.data);
    res.json({
      success: true,
      message: "Logged in successfully",
      data: result,
    });
  },

  async refresh(req: AuthenticatedRequest, res: Response) {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError("Refresh token is required", 400);
    }
    const result = await authService.refresh(parsed.data.refreshToken);
    res.json({
      success: true,
      message: "Token refreshed",
      data: result,
    });
  },

  async logout(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }
    await authService.logout(req.user.id);
    res.json({ success: true, message: "Logged out successfully" });
  },

  async me(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }
    const result = await authService.me(req.user.id);
    res.json({ success: true, data: result });
  },

  async updateProfile(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid profile data", 400);
    }
    const user = await authService.updateProfile(req.user.id, parsed.data);
    res.json({
      success: true,
      message: "Profile updated",
      data: { user },
    });
  },
};
