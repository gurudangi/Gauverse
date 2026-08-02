import { v4 as uuid } from "uuid";
import { AppError } from "../../shared/errors/AppError.js";
import { adoptionRepository } from "./adoption.repository.js";
import { cowRepository } from "./cow.repository.js";
import {
  ADOPTION_PLANS,
  type AdoptionDoc,
  type CowDoc,
  type CreateAdoptionInput,
} from "./adoption.types.js";

function stamp(prefix: string): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const suffix = uuid().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `${prefix}-${y}${m}${day}-${suffix}`;
}

export const cowService = {
  listCows() {
    return cowRepository.findAll();
  },

  async getCow(id: string) {
    const cow = await cowRepository.findById(id);
    if (!cow) throw new AppError("Cow not found", 404);
    return cow;
  },

  listPlans() {
    return Object.values(ADOPTION_PLANS);
  },

  async createCow(input: Omit<CowDoc, "id"> & { id?: string }) {
    const id = input.id ?? `cow-${uuid().slice(0, 8)}`;
    const existing = await cowRepository.findById(id);
    if (existing) throw new AppError("Cow id already exists", 409);
    return cowRepository.create({ ...input, id });
  },

  async updateCow(id: string, input: Partial<CowDoc>) {
    const updated = await cowRepository.update(id, input);
    if (!updated) throw new AppError("Cow not found", 404);
    return updated;
  },
};

export const adoptionService = {
  async adopt(input: CreateAdoptionInput): Promise<AdoptionDoc> {
    const cow = await cowRepository.findById(input.cowId);
    if (!cow) throw new AppError("Cow not found", 404);
    if (!cow.availableForAdoption) {
      throw new AppError("This cow is not available for adoption", 400);
    }

    const plan = ADOPTION_PLANS[input.plan];
    if (!plan) throw new AppError("Invalid adoption plan", 400);

    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setMonth(endsAt.getMonth() + plan.months);

    const adoption: AdoptionDoc = {
      id: uuid(),
      userId: input.userId ?? null,
      cowId: cow.id,
      cowName: cow.name,
      adopterName: input.adopterName,
      email: input.email.toLowerCase(),
      phone: input.phone,
      plan: plan.code,
      amount: plan.amount,
      months: plan.months,
      status: "active",
      paymentMode: input.paymentMode ?? "recorded",
      receiptNumber: stamp("ADP-RCP"),
      certificateId: stamp("ADP-CERT"),
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      createdAt: new Date().toISOString(),
    };

    return adoptionRepository.create(adoption);
  },

  listMine(userId: string) {
    return adoptionRepository.findByUserId(userId);
  },

  listAll() {
    return adoptionRepository.findAll();
  },
};
