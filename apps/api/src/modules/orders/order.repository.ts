import { Order } from "../../models/Order.js";
import { QUERY_MAX_MS } from "../../shared/constants.js";
import type { OrderDoc } from "./order.types.js";

function toOrder(doc: {
  id: string;
  userId?: string | null;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  items: OrderDoc["items"];
  total: number;
  status: OrderDoc["status"];
  paymentMode?: OrderDoc["paymentMode"];
  paymentId?: string | null;
  createdAt: Date | string;
}): OrderDoc {
  return {
    id: doc.id,
    userId: doc.userId ?? null,
    customerName: doc.customerName,
    phone: doc.phone,
    email: doc.email,
    address: doc.address,
    items: doc.items,
    total: doc.total,
    status: doc.status,
    paymentMode: doc.paymentMode ?? "recorded",
    paymentId: doc.paymentId ?? null,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : new Date(doc.createdAt).toISOString(),
  };
}

export const orderRepository = {
  async create(order: OrderDoc): Promise<OrderDoc> {
    await Order.create({
      ...order,
      createdAt: new Date(order.createdAt),
    });
    return order;
  },

  async findByUserId(userId: string): Promise<OrderDoc[]> {
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .maxTimeMS(QUERY_MAX_MS)
      .lean();
    return orders.map(toOrder);
  },
};
