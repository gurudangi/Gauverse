import type { Request, Response } from "express";
import { AppError } from "../../shared/errors/AppError.js";
import { PERMISSIONS } from "../../shared/rbac/permissions.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { paymentService } from "./payment.service.js";
import {
  createPaymentIntentSchema,
  verifyPaymentSchema,
} from "./payment.validators.js";

function firstIssue(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Invalid request data";
}

export const paymentController = {
  async config(_req: Request, res: Response) {
    res.json({ success: true, data: paymentService.getConfig() });
  },

  async createIntent(req: AuthenticatedRequest, res: Response) {
    const parsed = createPaymentIntentSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(firstIssue(parsed.error), 400);

    if (parsed.data.purpose === "adoption" || parsed.data.purpose === "subscription") {
      if (!req.user) {
        throw new AppError("Sign in required for this payment", 401);
      }
    }

    const data = await paymentService.createIntent({
      purpose: parsed.data.purpose,
      payload: parsed.data.payload as unknown as Record<string, unknown>,
      userId: req.user?.id ?? null,
    });

    res.status(201).json({
      success: true,
      message: data.mock
        ? "Mock payment order created — complete checkout to finish"
        : "Payment order created",
      data,
    });
  },

  async verify(req: AuthenticatedRequest, res: Response) {
    const parsed = verifyPaymentSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(firstIssue(parsed.error), 400);

    const data = await paymentService.verifyCheckout(parsed.data);
    res.json({
      success: true,
      message: "Payment verified successfully",
      data,
    });
  },

  async webhook(req: Request, res: Response) {
    const raw =
      typeof req.body === "string"
        ? req.body
        : Buffer.isBuffer(req.body)
          ? req.body.toString("utf8")
          : JSON.stringify(req.body);

    const signature = req.header("x-razorpay-signature") ?? undefined;
    const data = await paymentService.handleWebhook(raw, signature);
    res.json({ success: true, data });
  },

  async list(req: AuthenticatedRequest, res: Response) {
    if (!req.user?.permissions.includes(PERMISSIONS.REPORTS_READ)) {
      throw new AppError("Forbidden: insufficient permissions", 403);
    }
    const data = await paymentService.listRecent();
    res.json({ success: true, data });
  },
};
