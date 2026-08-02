import { z } from "zod";

export const createMilkSchema = z.object({
  cowId: z.string().min(1),
  litres: z.number().positive().max(100),
  session: z.enum(["morning", "evening"]),
  notes: z.string().max(500).optional().default(""),
  recordedAt: z.string().datetime().optional(),
});

export const createHealthSchema = z.object({
  cowId: z.string().min(1),
  condition: z.enum(["healthy", "under_observation", "sick", "recovering"]),
  temperatureC: z.number().min(30).max(45).nullable().optional(),
  symptoms: z.string().max(1000).optional().default(""),
  treatment: z.string().max(1000).optional().default(""),
  medicineGiven: z.string().max(500).optional().default(""),
  notes: z.string().max(500).optional().default(""),
  recordedAt: z.string().datetime().optional(),
});

export const createFeedSchema = z.object({
  cowId: z.string().min(1),
  feedType: z.string().min(2).max(100),
  quantityKg: z.number().positive().max(200),
  notes: z.string().max(500).optional().default(""),
  recordedAt: z.string().datetime().optional(),
});

export const createVaccinationSchema = z.object({
  cowId: z.string().min(1),
  vaccineName: z.string().min(2).max(100),
  dose: z.string().max(100).optional().default(""),
  nextDueAt: z.string().datetime().nullable().optional(),
  notes: z.string().max(500).optional().default(""),
  recordedAt: z.string().datetime().optional(),
});

export const createDailyReportSchema = z.object({
  reportDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "reportDate must be YYYY-MM-DD"),
  summary: z.string().min(10).max(2000),
  cowsChecked: z.number().int().min(0).max(10000),
  milkTotalLitres: z.number().min(0).max(100000),
  issues: z.string().max(2000).optional().default(""),
});

export const updateFarmCowSchema = z.object({
  status: z.enum(["healthy", "under_care", "retired"]).optional(),
  milkYieldLabel: z.string().min(1).max(50).optional(),
  availableForAdoption: z.boolean().optional(),
  description: z.string().min(5).max(2000).optional(),
});
