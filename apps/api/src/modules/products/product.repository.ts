import { Product } from "../../models/Product.js";
import { QUERY_MAX_MS } from "../../shared/constants.js";
import type { ProductDoc } from "./product.types.js";

function toProduct(doc: {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  unit: string;
  description: string;
  image: string;
  badge?: string | null;
  stock: number;
}): ProductDoc {
  return {
    id: doc.id,
    name: doc.name,
    price: doc.price,
    priceLabel: doc.priceLabel,
    unit: doc.unit,
    description: doc.description,
    image: doc.image,
    badge: doc.badge ?? null,
    stock: doc.stock,
  };
}

export const productRepository = {
  async findAll(): Promise<ProductDoc[]> {
    const products = await Product.find()
      .sort({ name: 1 })
      .maxTimeMS(QUERY_MAX_MS)
      .lean();
    return products.map(toProduct);
  },

  async findById(id: string): Promise<ProductDoc | null> {
    const product = await Product.findOne({ id }).maxTimeMS(QUERY_MAX_MS).lean();
    return product ? toProduct(product) : null;
  },

  async create(product: ProductDoc): Promise<ProductDoc> {
    await Product.create(product);
    return product;
  },

  async update(id: string, data: Partial<ProductDoc>): Promise<ProductDoc | null> {
    const product = await Product.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true, maxTimeMS: QUERY_MAX_MS },
    ).lean();
    return product ? toProduct(product as Parameters<typeof toProduct>[0]) : null;
  },

  async decrementStock(productId: string, quantity: number) {
    return Product.findOneAndUpdate(
      { id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true, maxTimeMS: QUERY_MAX_MS },
    );
  },

  async incrementStock(productId: string, quantity: number) {
    return Product.findOneAndUpdate(
      { id: productId },
      { $inc: { stock: quantity } },
      { maxTimeMS: QUERY_MAX_MS },
    );
  },
};
