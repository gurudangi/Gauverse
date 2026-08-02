import { Cow } from "../../models/Cow.js";
import { QUERY_MAX_MS } from "../../shared/constants.js";
import type { CowDoc } from "./adoption.types.js";

function toCow(doc: CowDoc): CowDoc {
  return {
    id: doc.id,
    name: doc.name,
    breed: doc.breed,
    ageYears: doc.ageYears,
    milkYieldLabel: doc.milkYieldLabel,
    image: doc.image,
    traits: doc.traits ?? [],
    description: doc.description,
    availableForAdoption: doc.availableForAdoption,
    status: doc.status,
  };
}

export const cowRepository = {
  async findAll(): Promise<CowDoc[]> {
    const rows = await Cow.find().sort({ name: 1 }).maxTimeMS(QUERY_MAX_MS).lean();
    return rows.map((r) => toCow(r as CowDoc));
  },

  async findById(id: string): Promise<CowDoc | null> {
    const row = await Cow.findOne({ id }).maxTimeMS(QUERY_MAX_MS).lean();
    return row ? toCow(row as CowDoc) : null;
  },

  async create(cow: CowDoc): Promise<CowDoc> {
    await Cow.create(cow);
    return cow;
  },

  async update(id: string, data: Partial<CowDoc>): Promise<CowDoc | null> {
    const row = await Cow.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true, maxTimeMS: QUERY_MAX_MS },
    ).lean();
    return row ? toCow(row as CowDoc) : null;
  },
};
