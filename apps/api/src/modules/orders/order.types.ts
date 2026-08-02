export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderDoc {
  id: string;
  userId?: string | null;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "delivered";
  paymentMode: "recorded" | "razorpay";
  paymentId?: string | null;
  createdAt: string;
}

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  items: { productId: string; quantity: number }[];
  userId?: string | null;
  paymentMode?: "recorded" | "razorpay";
  paymentId?: string | null;
}
