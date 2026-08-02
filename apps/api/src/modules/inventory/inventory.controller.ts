import type { Response } from "express";
import { AppError } from "../../shared/errors/AppError.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { inventoryService } from "./inventory.service.js";
import {
  createInventoryItemSchema,
  stockMovementSchema,
  updateInventoryItemSchema,
} from "./inventory.validators.js";

function actor(req: AuthenticatedRequest) {
  if (!req.user) throw new AppError("Authentication required", 401);
  return { userId: req.user.id, name: req.user.name };
}

function firstIssue(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Invalid request data";
}

export const inventoryController = {
  async stats(_req: AuthenticatedRequest, res: Response) {
    res.json({ success: true, data: await inventoryService.stats() });
  },

  async list(req: AuthenticatedRequest, res: Response) {
    const category =
      typeof req.query.category === "string" ? req.query.category : undefined;
    const lowStockOnly = req.query.lowStock === "1" || req.query.lowStock === "true";
    const data = await inventoryService.list({ category, lowStockOnly });
    res.json({ success: true, data });
  },

  async get(req: AuthenticatedRequest, res: Response) {
    const data = await inventoryService.get(req.params.id as string);
    res.json({ success: true, data });
  },

  async create(req: AuthenticatedRequest, res: Response) {
    const parsed = createInventoryItemSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(firstIssue(parsed.error), 400);
    const data = await inventoryService.createItem(parsed.data);
    res.status(201).json({ success: true, message: "Inventory item created", data });
  },

  async update(req: AuthenticatedRequest, res: Response) {
    const parsed = updateInventoryItemSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(firstIssue(parsed.error), 400);
    const data = await inventoryService.updateItem(req.params.id as string, parsed.data);
    res.json({ success: true, message: "Inventory item updated", data });
  },

  async move(req: AuthenticatedRequest, res: Response) {
    const parsed = stockMovementSchema.safeParse(req.body);
    if (!parsed.success) throw new AppError(firstIssue(parsed.error), 400);
    const result = await inventoryService.moveStock(
      req.params.id as string,
      parsed.data,
      actor(req),
    );
    res.status(201).json({
      success: true,
      message: "Stock movement recorded",
      data: result,
    });
  },

  async listMovements(req: AuthenticatedRequest, res: Response) {
    const itemId =
      typeof req.query.itemId === "string" ? req.query.itemId : undefined;
    const data = await inventoryService.listMovements(itemId);
    res.json({ success: true, data });
  },
};
