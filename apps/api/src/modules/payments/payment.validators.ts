import { z } from "zod";
import { createDonationSchema } from "../donations/donation.validators.js";
import { createOrderSchema } from "../orders/order.validators.js";
import { createAdoptionSchema } from "../adoptions/adoption.validators.js";
import { createSubscriptionSchema } from "../subscriptions/subscription.validators.js";

export const createPaymentIntentSchema = z.discriminatedUnion("purpose", [
  z.object({
    purpose: z.literal("donation"),
    payload: createDonationSchema,
  }),
  z.object({
    purpose: z.literal("order"),
    payload: createOrderSchema,
  }),
  z.object({
    purpose: z.literal("adoption"),
    payload: createAdoptionSchema,
  }),
  z.object({
    purpose: z.literal("subscription"),
    payload: createSubscriptionSchema,
  }),
]);

export const verifyPaymentSchema = z.object({
  paymentId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});
