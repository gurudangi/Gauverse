import seedCows from "../data/seed-cows.json" with { type: "json" };
import { Cow } from "../models/Cow.js";

export async function seedCowsIfEmpty(): Promise<void> {
  const count = await Cow.countDocuments();
  if (count > 0) {
    console.log(`MongoDB: ${count} cows already seeded`);
    return;
  }
  await Cow.insertMany(seedCows);
  console.log(`MongoDB: seeded ${seedCows.length} cows`);
}
