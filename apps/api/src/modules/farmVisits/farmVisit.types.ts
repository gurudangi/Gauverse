export interface FarmVisitDoc {
  id: string;
  name: string;
  phone: string;
  date: string;
  guests: number;
  timeSlot: string;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export type CreateFarmVisitInput = Omit<
  FarmVisitDoc,
  "id" | "status" | "createdAt"
>;
