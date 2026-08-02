import { api } from "./api";

export interface PaymentIntent {
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

export interface PaymentVerifyResult {
  paymentId: string;
  purpose: string;
  status: string;
  amount: number;
  entityType: string | null;
  entityId: string | null;
  fulfillment: Record<string, unknown> | null;
}

type RazorpayHandler = {
  open: () => void;
  on: (event: string, cb: (resp: unknown) => void) => void;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayHandler;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Could not load Razorpay checkout"));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Starts Razorpay checkout (or mock verify when RAZORPAY_MOCK is on).
 */
export async function completeRazorpayPayment(
  intent: PaymentIntent,
): Promise<PaymentVerifyResult> {
  if (intent.mock) {
    const res = await api.verifyPayment({
      paymentId: intent.paymentId,
      razorpay_order_id: intent.razorpayOrderId,
      razorpay_payment_id: `pay_mock_${Date.now()}`,
      razorpay_signature: `mock_sig_${intent.paymentId}`,
    });
    if (!res.data) throw new Error("Payment verification failed");
    return res.data;
  }

  await loadRazorpayScript();
  if (!window.Razorpay) throw new Error("Razorpay unavailable");

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: intent.keyId,
      amount: intent.amountPaise,
      currency: intent.currency,
      name: intent.companyName,
      description: "GauVerse payment",
      order_id: intent.razorpayOrderId,
      prefill: {
        name: intent.customerName,
        email: intent.email,
        contact: intent.phone,
      },
      theme: { color: "#2d4a3e" },
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        try {
          const res = await api.verifyPayment({
            paymentId: intent.paymentId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (!res.data) throw new Error("Payment verification failed");
          resolve(res.data);
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    });

    rzp.on("payment.failed", (resp: { error?: { description?: string } }) => {
      reject(new Error(resp?.error?.description ?? "Payment failed"));
    });

    rzp.open();
  });
}

let cachedEnabled: boolean | null = null;

export async function isRazorpayEnabled(): Promise<boolean> {
  if (cachedEnabled != null) return cachedEnabled;
  try {
    const res = await api.getPaymentConfig();
    cachedEnabled = Boolean(res.data?.enabled);
  } catch {
    cachedEnabled = false;
  }
  return cachedEnabled;
}
