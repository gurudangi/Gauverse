import { v4 as uuid } from "uuid";
import { farmVisitRepository } from "./farmVisit.repository.js";
import type { CreateFarmVisitInput, FarmVisitDoc } from "./farmVisit.types.js";

export const farmVisitService = {
  async bookVisit(input: CreateFarmVisitInput): Promise<FarmVisitDoc> {
    const visit: FarmVisitDoc = {
      id: uuid(),
      ...input,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    return farmVisitRepository.create(visit);
  },
};
