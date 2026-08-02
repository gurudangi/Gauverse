import crypto from "node:crypto";
import { v4 as uuid } from "uuid";
import Razorpay from "razorpay";
import { razorpayConfig } from "../../config/razorpay.js";
import { AppError } from "../../shared/errors/AppError.js";
import { ADOPTION_PLANS } from "../adoptions/adoption.types.js";
import { adoptionService } from "../adoptions/adoption.service.js";
import { donationService } from "../donations/donation.service.js";
import { orderService } from "../orders/order.service.js";
import { productRepository } from "../products/product.repository.js";
import { SUBSCRIPTION_PLANS } from "../subscriptions/subscription.types.js";
import { subscriptionService } from "../subscriptions/subscription.service.js";
import { paymentRepository } from "./payment.repository.js";
import type {
  CreateIntentResult,
  PaymentPurpose,
  PaymentTransactionDoc,
} from "./payment.types.js";

function receiptStamp(): string {
  return `PAY-${Date.now().toString(36).toUpperCase()}-${uuid().slice(0, 6).toUpperCase()}`;
}

function getRazorpayClient(): Razorpay | null {
  if (razorpayConfig.mock) return null;
  return new Razorpay({
    key_id: razorpayConfig.keyId,
    key_secret: razorpayConfig.keySecret,
  });
}

function verifyCheckoutSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  if (razorpayConfig.mock) {
    // Accept mock signatures or correctly signed ones with mock secret
    if (signature.startsWith("mock_sig_")) return true;
  }
  const expected = crypto
    .createHmac("sha256", razorpayConfig.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}

async function resolveAmount(
  purpose: PaymentPurpose,
  payload: Record<string, unknown>,
): Promise<{
  amount: number;
  customerName: string;
  email: string;
  phone: string;
}> {
  if (purpose === "donation") {
    return {
      amount: Number(payload.amount),
      customerName: String(payload.donorName),
      email: String(payload.email),
      phone: String(payload.phone),
    };
  }

  if (purpose === "adoption") {
    const planCode = payload.plan as keyof typeof ADOPTION_PLANS;
    const plan = ADOPTION_PLANS[planCode];
    if (!plan) throw new AppError("Invalid adoption plan", 400);
    return {
      amount: plan.amount,
      customerName: String(payload.adopterName),
      email: String(payload.email),
      phone: String(payload.phone),
    };
  }

  if (purpose === "subscription") {
    const planCode = payload.planCode as keyof typeof SUBSCRIPTION_PLANS;
    const plan = SUBSCRIPTION_PLANS[planCode];
    if (!plan) throw new AppError("Invalid subscription plan", 400);
    return {
      amount: plan.amountMonthly,
      customerName: String(payload.customerName),
      email: String(payload.email),
      phone: String(payload.phone),
    };
  }

  // order
  const items = payload.items as { productId: string; quantity: number }[];
  let total = 0;
  for (const item of items) {
    const product = await productRepository.findById(item.productId);
    if (!product) throw new AppError(`Product not found: ${item.productId}`, 400);
    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.name}`, 400);
    }
    total += product.price * item.quantity;
  }
  if (total < 1) throw new AppError("Order total must be at least ₹1", 400);

  return {
    amount: total,
    customerName: String(payload.customerName),
    email: String(payload.email),
    phone: String(payload.phone),
  };
}

async function fulfill(
  tx: PaymentTransactionDoc,
): Promise<{ entityType: string; entityId: string; fulfillment: Record<string, unknown> }> {
  const payload = tx.payload;
  const userId = tx.userId;

  if (tx.purpose === "donation") {
    const donation = await donationService.createDonation({
      donorName: String(payload.donorName),
      email: String(payload.email),
      phone: String(payload.phone),
      type: payload.type as never,
      amount: Number(payload.amount),
      message: payload.message ? String(payload.message) : undefined,
      userId,
      paymentMode: "razorpay",
    });
    return {
      entityType: "donation",
      entityId: donation.id,
      fulfillment: {
        receiptNumber: donation.receiptNumber,
        certificateId: donation.certificateId,
        amount: donation.amount,
      },
    };
  }

  if (tx.purpose === "adoption") {
    const adoption = await adoptionService.adopt({
      cowId: String(payload.cowId),
      plan: payload.plan as never,
      adopterName: String(payload.adopterName),
      email: String(payload.email),
      phone: String(payload.phone),
      userId,
      paymentMode: "razorpay",
    });
    return {
      entityType: "adoption",
      entityId: adoption.id,
      fulfillment: {
        receiptNumber: adoption.receiptNumber,
        certificateId: adoption.certificateId,
        cowName: adoption.cowName,
        amount: adoption.amount,
      },
    };
  }

  if (tx.purpose === "subscription") {
    const sub = await subscriptionService.subscribe({
      planCode: payload.planCode as never,
      customerName: String(payload.customerName),
      email: String(payload.email),
      phone: String(payload.phone),
      address: String(payload.address),
      userId,
      paymentMode: "razorpay",
    });
    return {
      entityType: "subscription",
      entityId: sub.id,
      fulfillment: {
        subscriptionId: sub.id,
        receiptNumber: sub.receiptNumber,
        planName: sub.planName,
        amountMonthly: sub.amountMonthly,
        nextDeliveryAt: sub.nextDeliveryAt,
        status: sub.status,
      },
    };
  }

  const order = await orderService.placeOrder({
    customerName: String(payload.customerName),
    email: String(payload.email),
    phone: String(payload.phone),
    address: String(payload.address),
    items: payload.items as { productId: string; quantity: number }[],
    userId,
    paymentMode: "razorpay",
    paymentId: tx.id,
  });

  return {
    entityType: "order",
    entityId: order.id,
    fulfillment: {
      orderId: order.id,
      total: order.total,
    },
  };
}

export const paymentService = {
  getConfig() {
    return {
      enabled: razorpayConfig.enabled,
      mock: razorpayConfig.mock,
      keyId: razorpayConfig.enabled ? razorpayConfig.keyId : null,
      currency: razorpayConfig.currency,
      companyName: razorpayConfig.companyName,
    };
  },

  listRecent() {
    return paymentRepository.listRecent();
  },

  async createIntent(input: {
    purpose: PaymentPurpose;
    payload: Record<string, unknown>;
    userId?: string | null;
  }): Promise<CreateIntentResult> {
    if (!razorpayConfig.enabled) {
      throw new AppError(
        "Online payments are not configured. Use recorded checkout or set Razorpay keys.",
        503,
      );
    }

    const resolved = await resolveAmount(input.purpose, input.payload);
    const amountPaise = Math.round(resolved.amount * 100);
    if (amountPaise < 100) {
      throw new AppError("Minimum payable amount is ₹1", 400);
    }

    const id = uuid();
    const receipt = receiptStamp();
    let razorpayOrderId: string;

    if (razorpayConfig.mock) {
      razorpayOrderId = `order_mock_${id.replace(/-/g, "").slice(0, 14)}`;
    } else {
      const client = getRazorpayClient()!;
      const rpOrder = await client.orders.create({
        amount: amountPaise,
        currency: razorpayConfig.currency,
        receipt,
        notes: {
          purpose: input.purpose,
          paymentId: id,
        },
      });
      razorpayOrderId = String(rpOrder.id);
    }

    const now = new Date().toISOString();
    const tx: PaymentTransactionDoc = {
      id,
      purpose: input.purpose,
      status: "created",
      amount: resolved.amount,
      amountPaise,
      currency: razorpayConfig.currency,
      customerName: resolved.customerName,
      email: resolved.email.toLowerCase(),
      phone: resolved.phone,
      userId: input.userId ?? null,
      payload: input.payload,
      razorpayOrderId,
      razorpayPaymentId: null,
      razorpaySignature: null,
      receipt,
      entityType: null,
      entityId: null,
      fulfillment: null,
      failureReason: null,
      paidAt: null,
      createdAt: now,
    };

    await paymentRepository.create(tx);

    return {
      mode: "razorpay",
      paymentId: id,
      razorpayOrderId,
      amount: resolved.amount,
      amountPaise,
      currency: razorpayConfig.currency,
      keyId: razorpayConfig.keyId,
      companyName: razorpayConfig.companyName,
      customerName: resolved.customerName,
      email: resolved.email,
      phone: resolved.phone,
      mock: razorpayConfig.mock,
    };
  },

  async verifyCheckout(input: {
    paymentId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    const tx = await paymentRepository.findById(input.paymentId);
    if (!tx) throw new AppError("Payment not found", 404);

    if (tx.status === "paid") {
      return {
        paymentId: tx.id,
        purpose: tx.purpose,
        status: tx.status,
        amount: tx.amount,
        entityType: tx.entityType,
        entityId: tx.entityId,
        fulfillment: tx.fulfillment,
      };
    }

    if (tx.status !== "created" && tx.status !== "processing") {
      throw new AppError(`Payment is ${tx.status}`, 400);
    }

    if (tx.razorpayOrderId !== input.razorpay_order_id) {
      throw new AppError("Order id mismatch", 400);
    }

    const ok = verifyCheckoutSignature(
      input.razorpay_order_id,
      input.razorpay_payment_id,
      input.razorpay_signature,
    );
    if (!ok) {
      await paymentRepository.markFailed(tx.id, "Invalid payment signature");
      throw new AppError("Payment signature verification failed", 400);
    }

    const claimed = await paymentRepository.claimForFulfillment(tx.id);
    if (!claimed) {
      const again = await paymentRepository.findById(tx.id);
      if (again?.status === "paid") {
        return {
          paymentId: again.id,
          purpose: again.purpose,
          status: again.status,
          amount: again.amount,
          entityType: again.entityType,
          entityId: again.entityId,
          fulfillment: again.fulfillment,
        };
      }
      if (again?.status === "processing") {
        throw new AppError("Payment is being processed, please retry shortly", 409);
      }
      throw new AppError(`Payment is ${again?.status ?? "unknown"}`, 400);
    }

    const result = await fulfill(claimed);
    const paid = await paymentRepository.markPaid(claimed.id, {
      razorpayPaymentId: input.razorpay_payment_id,
      razorpaySignature: input.razorpay_signature,
      ...result,
    });

    if (!paid) {
      throw new AppError("Could not finalize payment", 500);
    }

    return {
      paymentId: paid.id,
      purpose: paid.purpose,
      status: paid.status,
      amount: paid.amount,
      entityType: paid.entityType,
      entityId: paid.entityId,
      fulfillment: paid.fulfillment,
    };
  },

  async handleWebhook(rawBody: string, signature: string | undefined) {
    if (!razorpayConfig.webhookSecret) {
      throw new AppError("Webhook secret not configured", 503);
    }
    if (!signature) throw new AppError("Missing webhook signature", 400);

    const expected = crypto
      .createHmac("sha256", razorpayConfig.webhookSecret)
      .update(rawBody)
      .digest("hex");
    if (expected !== signature) {
      throw new AppError("Invalid webhook signature", 400);
    }

    const event = JSON.parse(rawBody) as {
      event?: string;
      payload?: {
        payment?: {
          entity?: {
            id?: string;
            order_id?: string;
            status?: string;
          };
        };
      };
    };

    if (event.event !== "payment.captured") {
      return { ignored: true, event: event.event };
    }

    const paymentEntity = event.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;
    if (!orderId || !paymentId) {
      return { ignored: true, reason: "missing ids" };
    }

    const tx = await paymentRepository.findByRazorpayOrderId(orderId);
    if (!tx) return { ignored: true, reason: "unknown order" };
    if (tx.status === "paid") return { ok: true, alreadyPaid: true };

    const claimed = await paymentRepository.claimForFulfillment(tx.id);
    if (!claimed) {
      return { ok: true, alreadyClaimed: true };
    }

    const result = await fulfill(claimed);
    await paymentRepository.markPaid(claimed.id, {
      razorpayPaymentId: paymentId,
      razorpaySignature: "webhook",
      ...result,
    });

    return { ok: true, paymentId: tx.id };
  },
};
