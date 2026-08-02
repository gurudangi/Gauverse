import type { Response } from "express";
import { AppError } from "../../shared/errors/AppError.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { farmService } from "./farm.service.js";
import {
  createDailyReportSchema,
  createFeedSchema,
  createHealthSchema,
  createMilkSchema,
  createVaccinationSchema,
  updateFarmCowSchema,
} from "./farm.validators.js";

function actor(req: AuthenticatedRequest) {
  if (!req.user) throw new AppError("Authentication required", 401);
  return { userId: req.user.id, name: req.user.name };
}

function firstIssue(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Invalid request data";
}

export const farmController = {
  async stats(_req: AuthenticatedRequest, res: Response) {
    const data = await farmService.stats();
    res.json({ success: true, data });
  },

  async listCows(_req: AuthenticatedRequest, res: Response) {
    const data = await farmService.listCows();
    res.json({ success: true, data });
  },

  async updateCow(req: AuthenticatedRequest, res: Response) {
    const parsed = updateFarmCowSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(firstIssue(parsed.error), 400);
    const cow = await farmService.updateCow(req.params.id as string, parsed.data);
    res.json({ success: true, message: "Cow updated", data: cow });
  },

  async createMilk(req: AuthenticatedRequest, res: Response) {
    const parsed = createMilkSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(firstIssue(parsed.error), 400);
    const row = await farmService.recordMilk(parsed.data, actor(req));
    res.status(201).json({ success: true, message: "Milk collection recorded", data: row });
  },

  async listMilk(_req: AuthenticatedRequest, res: Response) {
    res.json({ success: true, data: await farmService.listMilk() });
  },

  async createHealth(req: AuthenticatedRequest, res: Response) {
    const parsed = createHealthSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(firstIssue(parsed.error), 400);
    const row = await farmService.recordHealth(parsed.data, actor(req));
    res.status(201).json({ success: true, message: "Health update recorded", data: row });
  },

  async listHealth(_req: AuthenticatedRequest, res: Response) {
    res.json({ success: true, data: await farmService.listHealth() });
  },

  async createFeed(req: AuthenticatedRequest, res: Response) {
    const parsed = createFeedSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(firstIssue(parsed.error), 400);
    const row = await farmService.recordFeed(parsed.data, actor(req));
    res.status(201).json({ success: true, message: "Feed record saved", data: row });
  },

  async listFeed(_req: AuthenticatedRequest, res: Response) {
    res.json({ success: true, data: await farmService.listFeed() });
  },

  async createVaccination(req: AuthenticatedRequest, res: Response) {
    const parsed = createVaccinationSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(firstIssue(parsed.error), 400);
    const row = await farmService.recordVaccination(parsed.data, actor(req));
    res.status(201).json({
      success: true,
      message: "Vaccination recorded",
      data: row,
    });
  },

  async listVaccinations(_req: AuthenticatedRequest, res: Response) {
    res.json({ success: true, data: await farmService.listVaccinations() });
  },

  async createDailyReport(req: AuthenticatedRequest, res: Response) {
    const parsed = createDailyReportSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(firstIssue(parsed.error), 400);
    const row = await farmService.submitDailyReport(parsed.data, actor(req));
    res.status(201).json({ success: true, message: "Daily report submitted", data: row });
  },

  async listDailyReports(_req: AuthenticatedRequest, res: Response) {
    res.json({ success: true, data: await farmService.listDailyReports() });
  },
};
