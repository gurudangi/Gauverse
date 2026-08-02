import type { Response } from "express";
import { AppError } from "../../shared/errors/AppError.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { orderService } from "./order.service.js";
import { createOrderSchema } from "./order.validators.js";

export const orderController = {
  async create(req: AuthenticatedRequest, res: Response) {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Invalid order data", 400);
    }

    const order = await orderService.placeOrder({
      ...parsed.data,
      userId: req.user?.id ?? null,
    });
    res.status(201).json({
      success: true,
      message: "Order placed successfully! We will contact you shortly.",
      data: { orderId: order.id, total: order.total },
    });
  },

  async listMine(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }
    const orders = await orderService.listMyOrders(req.user.id);
    res.json({ success: true, data: orders });
  },
};
