import { Order } from "../../models/Order.js";
import { Donation } from "../../models/Donation.js";
import { Product } from "../../models/Product.js";
import { User } from "../../models/User.js";
import { Adoption } from "../../models/Adoption.js";
import { Cow } from "../../models/Cow.js";
import { Subscription } from "../../models/Subscription.js";
import { QUERY_MAX_MS } from "../../shared/constants.js";

export const adminService = {
  async getStats() {
    const [
      products,
      orders,
      donations,
      users,
      cows,
      adoptions,
      subscriptions,
      revenueOrders,
      revenueDonations,
      revenueAdoptions,
      revenueSubscriptions,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Donation.countDocuments(),
      User.countDocuments(),
      Cow.countDocuments(),
      Adoption.countDocuments(),
      Subscription.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
      Donation.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      Adoption.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      Subscription.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$amountMonthly" } } },
      ]),
    ]);

    return {
      products,
      orders,
      donations,
      users,
      cows,
      adoptions,
      subscriptions,
      revenue: {
        orders: revenueOrders[0]?.total ?? 0,
        donations: revenueDonations[0]?.total ?? 0,
        adoptions: revenueAdoptions[0]?.total ?? 0,
        subscriptionsMonthly: revenueSubscriptions[0]?.total ?? 0,
      },
    };
  },

  async listOrders() {
    const rows = await Order.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .maxTimeMS(QUERY_MAX_MS)
      .lean();
    return rows.map((o) => ({
      id: o.id,
      customerName: o.customerName,
      email: o.email,
      total: o.total,
      status: o.status,
      createdAt:
        o.createdAt instanceof Date
          ? o.createdAt.toISOString()
          : new Date(o.createdAt as string).toISOString(),
      itemCount: o.items?.length ?? 0,
    }));
  },

  async listDonations() {
    const rows = await Donation.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .maxTimeMS(QUERY_MAX_MS)
      .lean();
    return rows.map((d) => ({
      id: d.id,
      donorName: d.donorName,
      email: d.email,
      type: d.type,
      amount: d.amount,
      status: d.status,
      receiptNumber: d.receiptNumber,
      createdAt:
        d.createdAt instanceof Date
          ? d.createdAt.toISOString()
          : new Date(d.createdAt as string).toISOString(),
    }));
  },

  async listUsers() {
    const rows = await User.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .maxTimeMS(QUERY_MAX_MS)
      .lean();
    return rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone ?? "",
      roles: u.roles,
      isActive: u.isActive,
    }));
  },
};
