import "dotenv/config";
import { app } from "./app.js";
import { connectDb } from "./db/connect.js";
import { seedProductsIfEmpty } from "./db/seed.js";
import { seedRolesAndAdmin } from "./db/seedAuth.js";
import { seedCowsIfEmpty } from "./db/seedCows.js";
import { seedInventoryIfEmpty } from "./db/seedInventory.js";

const PORT = Number(process.env.PORT) || 3000;

async function main() {
  await connectDb();
  await seedProductsIfEmpty();
  await seedCowsIfEmpty();
  await seedRolesAndAdmin();
  await seedInventoryIfEmpty();

  app.listen(PORT, () => {
    console.log(`GauVerse API running at http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
