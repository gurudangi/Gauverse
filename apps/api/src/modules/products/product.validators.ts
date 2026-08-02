import { z } from "zod";

export const upsertProductSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(2),
  price: z.number().positive(),
  priceLabel: z.string().min(1),
  unit: z.string().min(1),
  description: z.string().min(5),
  image: z.string().url(),
  badge: z.string().nullable().optional(),
  stock: z.number().int().min(0),
});
