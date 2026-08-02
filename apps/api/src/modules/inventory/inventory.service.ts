import { v4 as uuid } from "uuid";
import { AppError } from "../../shared/errors/AppError.js";
import { productRepository } from "../products/product.repository.js";
import { inventoryRepository } from "./inventory.repository.js";
import type {
  InventoryItemDoc,
  InventoryMovementDoc,
  MovementType,
  StaffActor,
} from "./inventory.types.js";

function stamp(): InventoryItemDoc["createdAt"] {
  return new Date().toISOString();
}

async function syncProductStock(productId: string | null, quantity: number) {
  if (!productId) return;
  await productRepository.update(productId, { stock: quantity });
}

function buildMovement(
  item: InventoryItemDoc,
  type: MovementType,
  quantityDelta: number,
  quantityAfter: number,
  actor: StaffActor,
  extras?: {
    unitCost?: number | null;
    notes?: string;
    referenceType?: string | null;
    referenceId?: string | null;
  },
): InventoryMovementDoc {
  return {
    id: uuid(),
    itemId: item.id,
    itemName: item.name,
    sku: item.sku,
    type,
    quantityDelta,
    quantityAfter,
    unitCost: extras?.unitCost ?? null,
    referenceType: extras?.referenceType ?? null,
    referenceId: extras?.referenceId ?? null,
    notes: extras?.notes ?? "",
    recordedByUserId: actor.userId,
    recordedByName: actor.name,
    createdAt: stamp(),
  };
}

export const inventoryService = {
  list(filters?: { category?: string; lowStockOnly?: boolean }) {
    return inventoryRepository.findAll(filters);
  },

  async get(id: string) {
    const item = await inventoryRepository.findById(id);
    if (!item) throw new AppError("Inventory item not found", 404);
    return item;
  },

  stats() {
    return inventoryRepository.stats();
  },

  listMovements(itemId?: string) {
    return inventoryRepository.listMovements(100, itemId);
  },

  async createItem(input: {
    sku: string;
    name: string;
    category: InventoryItemDoc["category"];
    unit: string;
    quantityOnHand?: number;
    reorderLevel?: number;
    productId?: string | null;
    location?: string;
    notes?: string;
  }): Promise<InventoryItemDoc> {
    const sku = input.sku.trim().toUpperCase();
    const existing = await inventoryRepository.findBySku(sku);
    if (existing) throw new AppError("SKU already exists", 409);

    if (input.productId) {
      const product = await productRepository.findById(input.productId);
      if (!product) throw new AppError("Linked product not found", 400);
      const linked = await inventoryRepository.findByProductId(input.productId);
      if (linked) throw new AppError("Product already linked to an inventory item", 409);
    }

    const now = stamp();
    const qty = input.quantityOnHand ?? 0;
    const item: InventoryItemDoc = {
      id: uuid(),
      sku,
      name: input.name.trim(),
      category: input.category,
      unit: input.unit,
      quantityOnHand: qty,
      reorderLevel: input.reorderLevel ?? 5,
      productId: input.productId ?? null,
      location: input.location ?? "Main store",
      notes: input.notes ?? "",
      isActive: true,
      createdAt: now,
      updatedAt: now,
      isLowStock: qty <= (input.reorderLevel ?? 5),
    };

    const created = await inventoryRepository.create(item);
    if (created.productId) {
      await syncProductStock(created.productId, created.quantityOnHand);
    }

    if (qty > 0) {
      await inventoryRepository.createMovement(
        buildMovement(created, "receive", qty, qty, { userId: null, name: "System" }, {
          notes: "Opening stock",
        }),
      );
    }

    return created;
  },

  async updateItem(
    id: string,
    input: Partial<{
      sku: string;
      name: string;
      category: InventoryItemDoc["category"];
      unit: string;
      reorderLevel: number;
      productId: string | null;
      location: string;
      notes: string;
      isActive: boolean;
    }>,
  ) {
    const existing = await inventoryRepository.findById(id);
    if (!existing) throw new AppError("Inventory item not found", 404);

    if (input.sku && input.sku.toUpperCase() !== existing.sku) {
      const clash = await inventoryRepository.findBySku(input.sku.toUpperCase());
      if (clash) throw new AppError("SKU already exists", 409);
    }

    if (input.productId && input.productId !== existing.productId) {
      const product = await productRepository.findById(input.productId);
      if (!product) throw new AppError("Linked product not found", 400);
      const linked = await inventoryRepository.findByProductId(input.productId);
      if (linked) throw new AppError("Product already linked to an inventory item", 409);
    }

    const updated = await inventoryRepository.update(id, {
      ...input,
      sku: input.sku ? input.sku.toUpperCase() : undefined,
    });
    if (!updated) throw new AppError("Inventory item not found", 404);
    return updated;
  },

  async moveStock(
    itemId: string,
    input: {
      type: Exclude<MovementType, "sale">;
      quantity: number;
      targetQuantity?: number;
      unitCost?: number | null;
      notes?: string;
      referenceType?: string | null;
      referenceId?: string | null;
    },
    actor: StaffActor,
  ) {
    const item = await inventoryRepository.findById(itemId);
    if (!item) throw new AppError("Inventory item not found", 404);
    if (!item.isActive) throw new AppError("Inventory item is inactive", 400);

    let delta = 0;
    if (input.type === "adjustment") {
      if (input.targetQuantity == null) {
        throw new AppError("targetQuantity is required for adjustments", 400);
      }
      delta = input.targetQuantity - item.quantityOnHand;
    } else if (input.type === "purchase" || input.type === "receive" || input.type === "return") {
      delta = input.quantity;
    } else if (input.type === "issue") {
      delta = -input.quantity;
    }

    if (delta === 0) {
      throw new AppError("No stock change", 400);
    }

    const updated = await inventoryRepository.applyDelta(itemId, delta);
    if (!updated) {
      throw new AppError("Insufficient stock — quantity cannot go negative", 400);
    }

    await syncProductStock(updated.productId, updated.quantityOnHand);

    const movement = await inventoryRepository.createMovement(
      buildMovement(updated, input.type, delta, updated.quantityOnHand, actor, {
        unitCost: input.unitCost,
        notes: input.notes,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
      }),
    );

    return { item: updated, movement };
  },

  /**
   * Called when a shop order decrements product stock.
   * Keeps inventory ledger in sync; no-op if no linked item.
   */
  async recordSaleForProduct(
    productId: string,
    quantity: number,
    orderId: string,
  ): Promise<void> {
    const item = await inventoryRepository.findByProductId(productId);
    if (!item) return;

    const updated = await inventoryRepository.applyDelta(item.id, -quantity);
    if (!updated) {
      // Product stock already decremented; align inventory to zero floor and log.
      const forced = await inventoryRepository.setQuantity(item.id, 0);
      if (forced) {
        await inventoryRepository.createMovement(
          buildMovement(
            forced,
            "sale",
            -item.quantityOnHand,
            0,
            { userId: null, name: "System" },
            {
              notes: "Sale aligned after product stock decrement",
              referenceType: "order",
              referenceId: orderId,
            },
          ),
        );
      }
      return;
    }

    await inventoryRepository.createMovement(
      buildMovement(updated, "sale", -quantity, updated.quantityOnHand, {
        userId: null,
        name: "System",
      }, {
        notes: "Online order sale",
        referenceType: "order",
        referenceId: orderId,
      }),
    );
  },

  async recordReturnForProduct(
    productId: string,
    quantity: number,
    orderId: string,
  ): Promise<void> {
    const item = await inventoryRepository.findByProductId(productId);
    if (!item) return;
    const updated = await inventoryRepository.applyDelta(item.id, quantity);
    if (!updated) return;
    await inventoryRepository.createMovement(
      buildMovement(updated, "return", quantity, updated.quantityOnHand, {
        userId: null,
        name: "System",
      }, {
        notes: "Order rollback / stock restore",
        referenceType: "order",
        referenceId: orderId,
      }),
    );
  },
};
