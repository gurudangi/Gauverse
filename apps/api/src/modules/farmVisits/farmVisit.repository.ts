import { FarmVisit } from "../../models/FarmVisit.js";
import type { FarmVisitDoc } from "./farmVisit.types.js";

export const farmVisitRepository = {
  async create(visit: FarmVisitDoc): Promise<FarmVisitDoc> {
    await FarmVisit.create({
      ...visit,
      createdAt: new Date(visit.createdAt),
    });
    return visit;
  },
};
