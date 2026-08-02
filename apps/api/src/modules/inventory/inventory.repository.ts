import { InventoryItem } from "../../models/InventoryItem.js";
import { InventoryMovement } from "../../models/InventoryMovement.js";
import { QUERY_MAX_MS } from "../../shared/constants.js";
import type {
  InventoryItemDoc,
  InventoryMovementDoc,
  MovementType,
} from "./inventory.types.js";

function toIso(v: Date | string | null | undefined): string {
  if (!v) return new Date(0).toISOString();
  return v instanceof Date ? v.toISOString() : new Date(v).toISOString();
}

function toItem(doc: {
  id: string;
  sku: string;
  name: string;
  category: InventoryItemDoc["category"];
  unit: string;
  quantityOnHand: number;
  reorderLevel: number;
  productId?: string | null;
  location?: string;
  notes?: string;
  isActive?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}): InventoryItemDoc {
  const quantityOnHand = doc.quantityOnHand;
  const reorderLevel = doc.reorderLevel;
  return {
    id: doc.id,
    sku: doc.sku,
    name: doc.name,
    category: doc.category,
    unit: doc.unit,
    quantityOnHand,
    reorderLevel,
    productId: doc.productId ?? null,
    location: doc.location ?? "Main store",
    notes: doc.notes ?? "",
    isActive: doc.isActive ?? true,
    createdAt: toIso(doc.createdAt),
    updatedAt: toIso(doc.updatedAt),
    isLowStock: quantityOnHand <= reorderLevel,
  };
}

function toMovement(doc: {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  type: MovementType;
  quantityDelta: number;
  quantityAfter: number;
  unitCost?: number | null;
  referenceType?: string | null;
  referenceId?: string | null;
  notes?: string;
  recordedByUserId?: string | null;
  recordedByName?: string;
  createdAt: Date | string;
}): InventoryMovementDoc {
  return {
    id: doc.id,
    itemId: doc.itemId,
    itemName: doc.itemName,
    sku: doc.sku,
    type: doc.type,
    quantityDelta: doc.quantityDelta,
    quantityAfter: doc.quantityAfter,
    unitCost: doc.unitCost ?? null,
    referenceType: doc.referenceType ?? null,
    referenceId: doc.referenceId ?? null,
    notes: doc.notes ?? "",
    recordedByUserId: doc.recordedByUserId ?? null,
    recordedByName: doc.recordedByName ?? "System",
    createdAt: toIso(doc.createdAt),
  };
}

function startOfUtcDay(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export const inventoryRepository = {
  async findAll(filters?: {
    category?: string;
    lowStockOnly?: boolean;
  }): Promise<InventoryItemDoc[]> {
    const query: Record<string, unknown> = { isActive: true };
    if (filters?.category) query.category = filters.category;

    const rows = await InventoryItem.find(query)
      .sort({ category: 1, name: 1 })
      .maxTimeMS(QUERY_MAX_MS)
      .lean();

    let items = rows.map((r) => toItem(r as Parameters<typeof toItem>[0]));
    if (filters?.lowStockOnly) {
      items = items.filter((i) => i.isLowStock);
    }
    return items;
  },

  async findById(id: string): Promise<InventoryItemDoc | null> {
    const row = await InventoryItem.findOne({ id }).maxTimeMS(QUERY_MAX_MS).lean();
    return row ? toItem(row as Parameters<typeof toItem>[0]) : null;
  },

  async findBySku(sku: string): Promise<InventoryItemDoc | null> {
    const row = await InventoryItem.findOne({ sku }).maxTimeMS(QUERY_MAX_MS).lean();
    return row ? toItem(row as Parameters<typeof toItem>[0]) : null;
  },

  async findByProductId(productId: string): Promise<InventoryItemDoc | null> {
    const row = await InventoryItem.findOne({ productId })
      .maxTimeMS(QUERY_MAX_MS)
      .lean();
    return row ? toItem(row as Parameters<typeof toItem>[0]) : null;
  },

  async create(item: InventoryItemDoc): Promise<InventoryItemDoc> {
    await InventoryItem.create({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    });
    return item;
  },

  async update(
    id: string,
    data: Partial<InventoryItemDoc>,
  ): Promise<InventoryItemDoc | null> {
    const row = await InventoryItem.findOneAndUpdate(
      { id },
      { $set: { ...data, updatedAt: new Date() } },
      { new: true, maxTimeMS: QUERY_MAX_MS },
    ).lean();
    return row ? toItem(row as Parameters<typeof toItem>[0]) : null;
  },

  async setQuantity(id: string, quantityOnHand: number): Promise<InventoryItemDoc | null> {
    const row = await InventoryItem.findOneAndUpdate(
      { id },
      { $set: { quantityOnHand, updatedAt: new Date() } },
      { new: true, maxTimeMS: QUERY_MAX_MS },
    ).lean();
    return row ? toItem(row as Parameters<typeof toItem>[0]) : null;
  },

  /**
   * Atomic decrement — fails if stock would go negative.
   */
  async applyDelta(
    id: string,
    delta: number,
  ): Promise<InventoryItemDoc | null> {
    if (delta >= 0) {
      const row = await InventoryItem.findOneAndUpdate(
        { id },
        { $inc: { quantityOnHand: delta }, $set: { updatedAt: new Date() } },
        { new: true, maxTimeMS: QUERY_MAX_MS },
      ).lean();
      return row ? toItem(row as Parameters<typeof toItem>[0]) : null;
    }

    const abs = Math.abs(delta);
    const row = await InventoryItem.findOneAndUpdate(
      { id, quantityOnHand: { $gte: abs } },
      { $inc: { quantityOnHand: delta }, $set: { updatedAt: new Date() } },
      { new: true, maxTimeMS: QUERY_MAX_MS },
    ).lean();
    return row ? toItem(row as Parameters<typeof toItem>[0]) : null;
  },

  async createMovement(row: InventoryMovementDoc): Promise<InventoryMovementDoc> {
    await InventoryMovement.create({
      ...row,
      createdAt: new Date(row.createdAt),
    });
    return row;
  },

  async listMovements(limit = 100, itemId?: string): Promise<InventoryMovementDoc[]> {
    const query = itemId ? { itemId } : {};
    const rows = await InventoryMovement.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .maxTimeMS(QUERY_MAX_MS)
      .lean();
    return rows.map((r) => toMovement(r as Parameters<typeof toMovement>[0]));
  },

  async stats() {
    const since = startOfUtcDay();
    const [items, lowStock, movementsToday, unitsAgg, categories] = await Promise.all([
      InventoryItem.countDocuments({ isActive: true }),
      InventoryItem.countDocuments({
        isActive: true,
        $expr: { $lte: ["$quantityOnHand", "$reorderLevel"] },
      }),
      InventoryMovement.countDocuments({ createdAt: { $gte: since } }),
      InventoryItem.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: "$quantityOnHand" } } },
      ]).option({ maxTimeMS: QUERY_MAX_MS }),
      InventoryItem.distinct("category", { isActive: true }),
    ]);

    return {
      items,
      lowStock,
      movementsToday,
      totalUnits: unitsAgg[0]?.total ?? 0,
      categories: categories.length,
    };
  },
};
