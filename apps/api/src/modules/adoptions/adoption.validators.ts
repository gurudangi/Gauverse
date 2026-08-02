import { z } from "zod";

export const createAdoptionSchema = z.object({
  cowId: z.string().min(1),
  plan: z.enum(["monthly", "quarterly", "yearly"]),
  adopterName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
});

export const upsertCowSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(2),
  breed: z.string().min(2).default("Gir"),
  ageYears: z.number().int().min(0).max(30),
  milkYieldLabel: z.string().min(1),
  image: z.string().url(),
  traits: z.array(z.string()).default([]),
  description: z.string().min(10),
  availableForAdoption: z.boolean().default(true),
  status: z.enum(["healthy", "under_care", "retired"]).default("healthy"),
});
