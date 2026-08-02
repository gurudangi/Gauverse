import { z } from "zod";

export const createFarmVisitSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  date: z.string().min(1),
  guests: z.number().int().min(1).max(15),
  timeSlot: z.string().min(1),
  notes: z.string().optional(),
});
