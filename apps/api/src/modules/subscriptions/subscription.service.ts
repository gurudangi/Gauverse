import { v4 as uuid } from "uuid";
import { AppError } from "../../shared/errors/AppError.js";
import { subscriptionRepository } from "./subscription.repository.js";
import {
  SUBSCRIPTION_PLANS,
  type CreateSubscriptionInput,
  type SubscriptionDoc,
} from "./subscription.types.js";

function stamp(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `SUB-${y}${m}${day}-${uuid().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function nextDelivery(frequency: "daily" | "weekly", from = new Date()): Date {
  const next = new Date(from);
  next.setDate(next.getDate() + (frequency === "daily" ? 1 : 7));
  return next;
}

export const subscriptionService = {
  listPlans() {
    return Object.values(SUBSCRIPTION_PLANS);
  },

  async subscribe(input: CreateSubscriptionInput): Promise<SubscriptionDoc> {
    const plan = SUBSCRIPTION_PLANS[input.planCode];
    if (!plan) throw new AppError("Invalid subscription plan", 400);

    const startsAt = new Date();
    const sub: SubscriptionDoc = {
      id: uuid(),
      userId: input.userId ?? null,
      planCode: plan.code,
      planName: plan.name,
      customerName: input.customerName,
      email: input.email.toLowerCase(),
      phone: input.phone,
      address: input.address,
      quantityLitres: plan.quantityLitres,
      frequency: plan.frequency,
      amountMonthly: plan.amountMonthly,
      status: "active",
      paymentMode: input.paymentMode ?? "recorded",
      receiptNumber: stamp(),
      startsAt: startsAt.toISOString(),
      nextDeliveryAt: nextDelivery(plan.frequency, startsAt).toISOString(),
      pausedAt: null,
      cancelledAt: null,
      createdAt: new Date().toISOString(),
    };

    return subscriptionRepository.create(sub);
  },

  listMine(userId: string) {
    return subscriptionRepository.findByUserId(userId);
  },

  listAll() {
    return subscriptionRepository.findAll();
  },

  async pause(id: string, userId: string) {
    const sub = await subscriptionRepository.findById(id);
    if (!sub || sub.userId !== userId) throw new AppError("Subscription not found", 404);
    if (sub.status !== "active") {
      throw new AppError("Only active subscriptions can be paused", 400);
    }
    const updated = await subscriptionRepository.updateStatus(id, {
      status: "paused",
      pausedAt: new Date(),
    });
    return updated!;
  },

  async resume(id: string, userId: string) {
    const sub = await subscriptionRepository.findById(id);
    if (!sub || sub.userId !== userId) throw new AppError("Subscription not found", 404);
    if (sub.status !== "paused") {
      throw new AppError("Only paused subscriptions can be resumed", 400);
    }
    const updated = await subscriptionRepository.updateStatus(id, {
      status: "active",
      pausedAt: null,
      nextDeliveryAt: nextDelivery(sub.frequency),
    });
    return updated!;
  },

  async cancel(id: string, userId: string) {
    const sub = await subscriptionRepository.findById(id);
    if (!sub || sub.userId !== userId) throw new AppError("Subscription not found", 404);
    if (sub.status === "cancelled") {
      throw new AppError("Subscription already cancelled", 400);
    }
    const updated = await subscriptionRepository.updateStatus(id, {
      status: "cancelled",
      cancelledAt: new Date(),
    });
    return updated!;
  },
};
