import { z } from "zod";
import { DONATION_TYPES } from "./donation.types.js";

export const createDonationSchema = z.object({
  donorName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  type: z.enum(DONATION_TYPES),
  amount: z.number().positive().min(11, "Minimum donation is ₹11"),
  message: z.string().max(500).optional(),
});
