import { v4 as uuid } from "uuid";
import { AppError } from "../../shared/errors/AppError.js";
import { inventoryRepository } from "../inventory/inventory.repository.js";
import { inventoryService } from "../inventory/inventory.service.js";
import { productRepository } from "./product.repository.js";
import type { ProductDoc } from "./product.types.js";

export const productService = {
  async listProducts() {
    return productRepository.findAll();
  },

  async getProduct(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return product;
  },

  async createProduct(input: Omit<ProductDoc, "id"> & { id?: string }) {
    const id = input.id ?? `prod-${uuid().slice(0, 8)}`;
    const existing = await productRepository.findById(id);
    if (existing) throw new AppError("Product id already exists", 409);
    const product = await productRepository.create({
      ...input,
      id,
      badge: input.badge ?? null,
    });

    await inventoryService
      .createItem({
        sku: `PRD-${id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16).toUpperCase()}`,
        name: product.name,
        category: "products",
        unit: product.unit,
        quantityOnHand: product.stock,
        reorderLevel: Math.max(5, Math.floor(product.stock * 0.2)),
        productId: product.id,
        location: "Product store",
        notes: "Auto-created with product",
      })
      .catch(() => undefined);

    return product;
  },

  async updateProduct(id: string, input: Partial<ProductDoc>) {
    const updated = await productRepository.update(id, input);
    if (!updated) throw new AppError("Product not found", 404);

    if (input.stock != null) {
      const item = await inventoryRepository.findByProductId(id);
      if (item && item.quantityOnHand !== updated.stock) {
        await inventoryService
          .moveStock(
            item.id,
            {
              type: "adjustment",
              quantity: 1,
              targetQuantity: updated.stock,
              notes: "Synced from product stock update",
            },
            { userId: null, name: "System" },
          )
          .catch(() => undefined);
      }
    }

    return updated;
  },
};
