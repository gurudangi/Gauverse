import type { Response } from "express";
import { AppError } from "../../shared/errors/AppError.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { adoptionService, cowService } from "./adoption.service.js";
import { createAdoptionSchema, upsertCowSchema } from "./adoption.validators.js";

export const cowController = {
  async list(_req: AuthenticatedRequest, res: Response) {
    const cows = await cowService.listCows();
    res.json({ success: true, data: cows });
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    const cow = await cowService.getCow(req.params.id as string);
    res.json({ success: true, data: cow });
  },

  async listPlans(_req: AuthenticatedRequest, res: Response) {
    res.json({ success: true, data: cowService.listPlans() });
  },

  async create(req: AuthenticatedRequest, res: Response) {
    const parsed = upsertCowSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid cow data", 400);
    }
    const cow = await cowService.createCow(parsed.data);
    res.status(201).json({ success: true, message: "Cow created", data: cow });
  },

  async update(req: AuthenticatedRequest, res: Response) {
    const parsed = upsertCowSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid cow data", 400);
    }
    const cow = await cowService.updateCow(req.params.id as string, parsed.data);
    res.json({ success: true, message: "Cow updated", data: cow });
  },
};

export const adoptionController = {
  async create(req: AuthenticatedRequest, res: Response) {
    const parsed = createAdoptionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid adoption data", 400);
    }
    const adoption = await adoptionService.adopt({
      ...parsed.data,
      userId: req.user?.id ?? null,
    });
    res.status(201).json({
      success: true,
      message: "Cow adoption recorded. Certificate reference is ready.",
      data: {
        adoptionId: adoption.id,
        cowName: adoption.cowName,
        plan: adoption.plan,
        amount: adoption.amount,
        receiptNumber: adoption.receiptNumber,
        certificateId: adoption.certificateId,
        endsAt: adoption.endsAt,
      },
    });
  },

  async listMine(req: AuthenticatedRequest, res: Response) {
    if (!req.user) throw new AppError("Authentication required", 401);
    const rows = await adoptionService.listMine(req.user.id);
    res.json({ success: true, data: rows });
  },

  async listAll(_req: AuthenticatedRequest, res: Response) {
    const rows = await adoptionService.listAll();
    res.json({ success: true, data: rows });
  },
};
