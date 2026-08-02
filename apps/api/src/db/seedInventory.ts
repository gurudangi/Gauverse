import { v4 as uuid } from "uuid";
import seedOps from "../data/seed-inventory.json" with { type: "json" };
import { InventoryItem } from "../models/InventoryItem.js";
import { Product } from "../models/Product.js";
import type { InventoryCategory } from "../modules/inventory/inventory.types.js";

export async function seedInventoryIfEmpty(): Promise<void> {
  const count = await InventoryItem.countDocuments();
  if (count > 0) {
    console.log("MongoDB: inventory already seeded");
    return;
  }

  const products = await Product.find().lean();
  const now = new Date();
  const productItems = products.map((p) => ({
    id: uuid(),
    sku: `PRD-${String(p.id).replace(/[^a-zA-Z0-9]/g, "").slice(0, 16).toUpperCase()}`,
    name: p.name,
    category: "products" as InventoryCategory,
    unit: p.unit,
    quantityOnHand: p.stock,
    reorderLevel: Math.max(5, Math.floor(p.stock * 0.2)),
    productId: p.id,
    location: "Product store",
    notes: "Synced from shop catalogue",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }));

  const opsItems = seedOps.map((row) => ({
    id: uuid(),
    sku: row.sku,
    name: row.name,
    category: row.category as InventoryCategory,
    unit: row.unit,
    quantityOnHand: row.quantityOnHand,
    reorderLevel: row.reorderLevel,
    productId: null,
    location: row.location,
    notes: row.notes ?? "",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }));

  const all = [...productItems, ...opsItems];
  if (all.length === 0) {
    console.log("MongoDB: no inventory items to seed");
    return;
  }

  await InventoryItem.insertMany(all);
  console.log(`MongoDB: seeded ${all.length} inventory items`);
}
