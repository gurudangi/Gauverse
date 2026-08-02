export const DONATION_TYPES = [
  "gauseva",
  "feed",
  "medical",
  "infrastructure",
  "general",
  "monthly",
] as const;

export type DonationType = (typeof DONATION_TYPES)[number];

export interface DonationDoc {
  id: string;
  userId?: string | null;
  donorName: string;
  email: string;
  phone: string;
  type: DonationType;
  amount: number;
  message?: string;
  isRecurring: boolean;
  status: "completed" | "refunded";
  paymentMode: "recorded" | "razorpay";
  receiptNumber: string;
  certificateId: string;
  createdAt: string;
}

export interface CreateDonationInput {
  donorName: string;
  email: string;
  phone: string;
  type: DonationType;
  amount: number;
  message?: string;
  userId?: string | null;
  paymentMode?: "recorded" | "razorpay";
}
