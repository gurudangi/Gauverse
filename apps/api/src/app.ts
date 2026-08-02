import express from "express";
import cors from "cors";
import { getCorsOrigins } from "./config/cors.js";
import { isDbConnected } from "./db/connect.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { productsRouter } from "./modules/products/product.routes.js";
import { ordersRouter } from "./modules/orders/order.routes.js";
import { farmVisitsRouter } from "./modules/farmVisits/farmVisit.routes.js";
import { contactRouter } from "./modules/contact/contact.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { donationsRouter } from "./modules/donations/donation.routes.js";
import { cowsRouter, adoptionsRouter } from "./modules/adoptions/adoption.routes.js";
import { adminRouter } from "./modules/admin/admin.routes.js";
import { subscriptionsRouter } from "./modules/subscriptions/subscription.routes.js";
import { farmRouter } from "./modules/farm/farm.routes.js";
import { inventoryRouter } from "./modules/inventory/inventory.routes.js";
import { paymentsRouter } from "./modules/payments/payment.routes.js";
import { paymentController } from "./modules/payments/payment.controller.js";
import { asyncHandler } from "./shared/middleware/asyncHandler.js";

export const app = express();

app.use(
  cors({
    origin: getCorsOrigins(),
    credentials: true,
  }),
);

// Razorpay webhooks need the raw body for signature verification
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(paymentController.webhook),
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  const dbConnected = isDbConnected();
  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    message: dbConnected
      ? "GauVerse API is running"
      : "API is up but database is disconnected",
    data: {
      db: dbConnected ? "connected" : "disconnected",
    },
  });
});

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/donations", donationsRouter);
app.use("/api/cows", cowsRouter);
app.use("/api/adoptions", adoptionsRouter);
app.use("/api/subscriptions", subscriptionsRouter);
app.use("/api/farm", farmRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/farm-visits", farmVisitsRouter);
app.use("/api/contact", contactRouter);

app.use(notFoundHandler);
app.use(errorHandler);
