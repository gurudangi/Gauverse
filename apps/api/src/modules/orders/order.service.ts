import { v4 as uuid } from "uuid";
import { AppError } from "../../shared/errors/AppError.js";
import { inventoryService } from "../inventory/inventory.service.js";
import { productRepository } from "../products/product.repository.js";
import { orderRepository } from "./order.repository.js";
import type { CreateOrderInput, OrderDoc, OrderItem } from "./order.types.js";

export const orderService = {
  async placeOrder(input: CreateOrderInput) {
    const orderItems: OrderItem[] = [];

    for (const item of input.items) {
      const product = await productRepository.findById(item.productId);
      if (!product) {
        throw new AppError(`Product not found: ${item.productId}`, 400);
      }
      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order: OrderDoc = {
      id: uuid(),
      userId: input.userId ?? null,
      customerName: input.customerName,
      phone: input.phone,
      email: input.email,
      address: input.address,
      items: orderItems,
      total,
      status: "pending",
      paymentMode: input.paymentMode ?? "recorded",
      paymentId: input.paymentId ?? null,
      createdAt: new Date().toISOString(),
    };

    const decremented: { productId: string; quantity: number }[] = [];

    try {
      for (const item of orderItems) {
        const updated = await productRepository.decrementStock(
          item.productId,
          item.quantity,
        );
        if (!updated) {
          const product = await productRepository.findById(item.productId);
          if (!product) {
            throw new AppError(`Product not found: ${item.productId}`, 400);
          }
          throw new AppError(`Insufficient stock for ${product.name}`, 400);
        }
        decremented.push({ productId: item.productId, quantity: item.quantity });
      }

      await orderRepository.create(order);

      for (const item of decremented) {
        await inventoryService
          .recordSaleForProduct(item.productId, item.quantity, order.id)
          .catch(() => undefined);
      }

      return order;
    } catch (err) {
      for (const item of decremented.reverse()) {
        await productRepository
          .incrementStock(item.productId, item.quantity)
          .catch(() => undefined);
        await inventoryService
          .recordReturnForProduct(item.productId, item.quantity, order.id)
          .catch(() => undefined);
      }
      throw err;
    }
  },

  async listMyOrders(userId: string) {
    return orderRepository.findByUserId(userId);
  },
};
