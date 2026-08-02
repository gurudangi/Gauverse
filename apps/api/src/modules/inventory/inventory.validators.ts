import { z } from "zod";
import { INVENTORY_CATEGORIES } from "./inventory.types.js";

export const createInventoryItemSchema = z.object({
  sku: z.string().min(2).max(40),
  name: z.string().min(2).max(120),
  category: z.enum(INVENTORY_CATEGORIES),
  unit: z.string().min(1).max(40),
  quantityOnHand: z.number().min(0).default(0),
  reorderLevel: z.number().min(0).default(5),
  productId: z.string().min(1).nullable().optional(),
  location: z.string().max(120).optional().default("Main store"),
  notes: z.string().max(1000).optional().default(""),
});

export const updateInventoryItemSchema = createInventoryItemSchema
  .omit({ quantityOnHand: true, sku: true })
  .partial()
  .extend({
    isActive: z.boolean().optional(),
    sku: z.string().min(2).max(40).optional(),
  });

export const stockMovementSchema = z.object({
  type: z.enum(["purchase", "receive", "issue", "adjustment", "return"]),
  quantity: z.number().positive().max(1_000_000),
  /** For adjustment: absolute target quantity. Ignored for other types. */
  targetQuantity: z.number().min(0).optional(),
  unitCost: z.number().min(0).nullable().optional(),
  notes: z.string().max(1000).optional().default(""),
  referenceType: z.string().max(40).nullable().optional(),
  referenceId: z.string().max(80).nullable().optional(),
});
