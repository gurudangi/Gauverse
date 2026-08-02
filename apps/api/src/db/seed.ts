import seedProducts from "../data/seed-products.json" with { type: "json" };
import { Product } from "../models/Product.js";

export async function seedProductsIfEmpty(): Promise<void> {
  const count = await Product.countDocuments();
  if (count > 0) {
    console.log(`MongoDB: ${count} products already seeded`);
    return;
  }

  await Product.insertMany(seedProducts);
  console.log(`MongoDB: seeded ${seedProducts.length} products`);
}
