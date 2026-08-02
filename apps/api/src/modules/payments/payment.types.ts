export type PaymentPurpose = "donation" | "order" | "adoption" | "subscription";

export type PaymentStatus = "created" | "processing" | "paid" | "failed" | "expired";

export interface PaymentTransactionDoc {
  id: string;
  purpose: PaymentPurpose;
  status: PaymentStatus;
  amount: number;
  amountPaise: number;
  currency: string;
  customerName: string;
  email: string;
  phone: string;
  userId: string | null;
  payload: Record<string, unknown>;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  receipt: string;
  entityType: string | null;
  entityId: string | null;
  fulfillment: Record<string, unknown> | null;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface CreateIntentResult {
  mode: "razorpay";
  paymentId: string;
  razorpayOrderId: string;
  amount: number;
  amountPaise: number;
  currency: string;
  keyId: string;
  companyName: string;
  customerName: string;
  email: string;
  phone: string;
  mock: boolean;
}
