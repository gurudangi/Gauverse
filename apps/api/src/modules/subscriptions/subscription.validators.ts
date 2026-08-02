import { z } from "zod";

export const createSubscriptionSchema = z.object({
  planCode: z.enum(["daily_1l", "daily_2l", "weekly_combo"]),
  customerName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(5),
});
