export const SUBSCRIPTION_PLANS = {
  daily_1l: {
    code: "daily_1l" as const,
    name: "Daily A2 Milk — 1L",
    quantityLitres: 1,
    frequency: "daily" as const,
    amountMonthly: 2400,
    description: "Fresh Gir A2 milk delivered every morning.",
  },
  daily_2l: {
    code: "daily_2l" as const,
    name: "Daily A2 Milk — 2L",
    quantityLitres: 2,
    frequency: "daily" as const,
    amountMonthly: 4500,
    description: "Family pack — 2 litres delivered daily.",
  },
  weekly_combo: {
    code: "weekly_combo" as const,
    name: "Weekly Dairy Combo",
    quantityLitres: 3,
    frequency: "weekly" as const,
    amountMonthly: 1800,
    description: "Milk, curd & paneer combo once a week.",
  },
};

export type SubscriptionPlanCode = keyof typeof SUBSCRIPTION_PLANS;

export interface SubscriptionDoc {
  id: string;
  userId?: string | null;
  planCode: SubscriptionPlanCode;
  planName: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  quantityLitres: number;
  frequency: "daily" | "weekly";
  amountMonthly: number;
  status: "active" | "paused" | "cancelled";
  paymentMode: "recorded" | "razorpay";
  receiptNumber: string;
  startsAt: string;
  nextDeliveryAt: string;
  pausedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
}

export interface CreateSubscriptionInput {
  planCode: SubscriptionPlanCode;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  userId?: string | null;
  paymentMode?: "recorded" | "razorpay";
}
