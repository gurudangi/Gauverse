import type { Response } from "express";
import { AppError } from "../../shared/errors/AppError.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { subscriptionService } from "./subscription.service.js";
import { createSubscriptionSchema } from "./subscription.validators.js";

export const subscriptionController = {
  async listPlans(_req: AuthenticatedRequest, res: Response) {
    res.json({ success: true, data: subscriptionService.listPlans() });
  },

  async create(req: AuthenticatedRequest, res: Response) {
    const parsed = createSubscriptionSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        parsed.error.issues[0]?.message ?? "Invalid subscription data",
        400,
      );
    }
    if (!req.user) {
      throw new AppError("Sign in required to start a subscription", 401);
    }

    const sub = await subscriptionService.subscribe({
      ...parsed.data,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Subscription started! You can pause or resume anytime from your account.",
      data: {
        subscriptionId: sub.id,
        planName: sub.planName,
        amountMonthly: sub.amountMonthly,
        receiptNumber: sub.receiptNumber,
        nextDeliveryAt: sub.nextDeliveryAt,
        status: sub.status,
      },
    });
  },

  async listMine(req: AuthenticatedRequest, res: Response) {
    if (!req.user) throw new AppError("Authentication required", 401);
    const rows = await subscriptionService.listMine(req.user.id);
    res.json({ success: true, data: rows });
  },

  async listAll(_req: AuthenticatedRequest, res: Response) {
    const rows = await subscriptionService.listAll();
    res.json({ success: true, data: rows });
  },

  async pause(req: AuthenticatedRequest, res: Response) {
    if (!req.user) throw new AppError("Authentication required", 401);
    const sub = await subscriptionService.pause(req.params.id as string, req.user.id);
    res.json({ success: true, message: "Subscription paused", data: sub });
  },

  async resume(req: AuthenticatedRequest, res: Response) {
    if (!req.user) throw new AppError("Authentication required", 401);
    const sub = await subscriptionService.resume(req.params.id as string, req.user.id);
    res.json({ success: true, message: "Subscription resumed", data: sub });
  },

  async cancel(req: AuthenticatedRequest, res: Response) {
    if (!req.user) throw new AppError("Authentication required", 401);
    const sub = await subscriptionService.cancel(req.params.id as string, req.user.id);
    res.json({ success: true, message: "Subscription cancelled", data: sub });
  },
};
