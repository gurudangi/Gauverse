export const INVENTORY_CATEGORIES = [
  "products",
  "feed",
  "medicine",
  "packaging",
  "cleaning",
  "office",
] as const;

export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number];

export type MovementType =
  | "purchase"
  | "receive"
  | "issue"
  | "sale"
  | "adjustment"
  | "return";

export interface InventoryItemDoc {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number;
  productId: string | null;
  location: string;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isLowStock?: boolean;
}

export interface InventoryMovementDoc {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  type: MovementType;
  quantityDelta: number;
  quantityAfter: number;
  unitCost: number | null;
  referenceType: string | null;
  referenceId: string | null;
  notes: string;
  recordedByUserId: string | null;
  recordedByName: string;
  createdAt: string;
}

export interface InventoryStats {
  items: number;
  lowStock: number;
  categories: number;
  movementsToday: number;
  totalUnits: number;
}

export interface StaffActor {
  userId: string | null;
  name: string;
}
