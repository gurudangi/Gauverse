export const ADOPTION_PLANS = {
  monthly: { code: "monthly" as const, label: "Monthly", months: 1, amount: 1100 },
  quarterly: { code: "quarterly" as const, label: "Quarterly", months: 3, amount: 3000 },
  yearly: { code: "yearly" as const, label: "Yearly", months: 12, amount: 11000 },
};

export type AdoptionPlanCode = keyof typeof ADOPTION_PLANS;

export interface CowDoc {
  id: string;
  name: string;
  breed: string;
  ageYears: number;
  milkYieldLabel: string;
  image: string;
  traits: string[];
  description: string;
  availableForAdoption: boolean;
  status: "healthy" | "under_care" | "retired";
}

export interface AdoptionDoc {
  id: string;
  userId?: string | null;
  cowId: string;
  cowName: string;
  adopterName: string;
  email: string;
  phone: string;
  plan: AdoptionPlanCode;
  amount: number;
  months: number;
  status: "active" | "expired" | "cancelled";
  paymentMode: "recorded" | "razorpay";
  receiptNumber: string;
  certificateId: string;
  startsAt: string;
  endsAt: string;
  createdAt: string;
}

export interface CreateAdoptionInput {
  cowId: string;
  plan: AdoptionPlanCode;
  adopterName: string;
  email: string;
  phone: string;
  userId?: string | null;
  paymentMode?: "recorded" | "razorpay";
}
