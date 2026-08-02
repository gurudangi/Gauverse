import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(5),
});
