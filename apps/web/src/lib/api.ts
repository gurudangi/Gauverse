export interface Product {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  unit: string;
  description: string;
  image: string;
  badge: string | null;
  stock: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: string[];
}

export interface AuthPayload {
  user: AuthUser;
  permissions: string[];
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

const BASE = "/api";
const DEFAULT_TIMEOUT_MS = 20_000;
const ACCESS_KEY = "gauverse_access_token";
const REFRESH_KEY = "gauverse_refresh_token";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function request<T>(
  path: string,
  options?: RequestInit & { auth?: boolean },
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (options?.auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers,
    });

    let json: ApiResponse<T>;
    try {
      json = (await res.json()) as ApiResponse<T>;
    } catch {
      throw new Error(
        res.ok ? "Invalid response from server" : `Request failed (${res.status})`,
      );
    }

    if (!res.ok) {
      throw new Error(json.message ?? "Something went wrong");
    }
    return json;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    if (err instanceof TypeError) {
      throw new Error("Cannot reach the API. Is the server running?");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  getProducts: () => request<Product[]>("/products"),

  placeOrder: (body: {
    customerName: string;
    phone: string;
    email: string;
    address: string;
    items: { productId: string; quantity: number }[];
  }) =>
    request<{ orderId: string; total: number }>("/orders", {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),

  bookFarmVisit: (body: {
    name: string;
    phone: string;
    date: string;
    guests: number;
    timeSlot: string;
    notes?: string;
  }) =>
    request<{ visitId: string; date: string; timeSlot: string }>("/farm-visits", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  sendContact: (body: {
    name: string;
    phone: string;
    email: string;
    subject: string;
    message: string;
  }) =>
    request<{ messageId: string }>("/contact", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  register: (body: { name: string; email: string; phone?: string; password: string }) =>
    request<AuthPayload>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<AuthPayload>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  refresh: (refreshToken: string) =>
    request<AuthPayload>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  logout: () =>
    request<undefined>("/auth/logout", {
      method: "POST",
      auth: true,
    }),

  me: () =>
    request<{ user: AuthUser; permissions: string[] }>("/auth/me", {
      auth: true,
    }),

  updateProfile: (body: { name?: string; phone?: string }) =>
    request<{ user: AuthUser }>("/auth/profile", {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(body),
    }),

  getMyOrders: () =>
    request<
      {
        id: string;
        customerName: string;
        phone: string;
        email: string;
        address: string;
        items: { productId: string; name: string; price: number; quantity: number }[];
        total: number;
        status: string;
        createdAt: string;
      }[]
    >("/orders/mine", { auth: true }),

  createDonation: (body: {
    donorName: string;
    email: string;
    phone: string;
    type: string;
    amount: number;
    message?: string;
  }) =>
    request<{
      donationId: string;
      receiptNumber: string;
      certificateId: string;
      amount: number;
      type: string;
      isRecurring: boolean;
    }>("/donations", {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),

  getMyDonations: () =>
    request<
      {
        id: string;
        type: string;
        amount: number;
        status: string;
        receiptNumber: string;
        certificateId: string;
        isRecurring: boolean;
        createdAt: string;
      }[]
    >("/donations/mine", { auth: true }),

  getCows: () =>
    request<
      {
        id: string;
        name: string;
        breed: string;
        ageYears: number;
        milkYieldLabel: string;
        image: string;
        traits: string[];
        description: string;
        availableForAdoption: boolean;
        status: string;
      }[]
    >("/cows"),

  getAdoptionPlans: () =>
    request<{ code: string; label: string; months: number; amount: number }[]>("/cows/plans"),

  createAdoption: (body: {
    cowId: string;
    plan: string;
    adopterName: string;
    email: string;
    phone: string;
  }) =>
    request<{
      adoptionId: string;
      cowName: string;
      plan: string;
      amount: number;
      receiptNumber: string;
      certificateId: string;
      endsAt: string;
    }>("/adoptions", {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),

  getMyAdoptions: () =>
    request<
      {
        id: string;
        cowId: string;
        cowName: string;
        plan: string;
        amount: number;
        status: string;
        receiptNumber: string;
        certificateId: string;
        startsAt: string;
        endsAt: string;
        createdAt: string;
      }[]
    >("/adoptions/mine", { auth: true }),

  getAdminStats: () =>
    request<{
      products: number;
      orders: number;
      donations: number;
      users: number;
      cows: number;
      adoptions: number;
      subscriptions: number;
      revenue: {
        orders: number;
        donations: number;
        adoptions: number;
        subscriptionsMonthly: number;
      };
    }>("/admin/stats", { auth: true }),

  getAdminOrders: () =>
    request<
      {
        id: string;
        customerName: string;
        email: string;
        total: number;
        status: string;
        createdAt: string;
        itemCount: number;
      }[]
    >("/admin/orders", { auth: true }),

  getAdminDonations: () =>
    request<
      {
        id: string;
        donorName: string;
        email: string;
        type: string;
        amount: number;
        status: string;
        receiptNumber: string;
        createdAt: string;
      }[]
    >("/admin/donations", { auth: true }),

  getAdminUsers: () =>
    request<
      {
        id: string;
        name: string;
        email: string;
        phone: string;
        roles: string[];
        isActive: boolean;
      }[]
    >("/admin/users", { auth: true }),

  getAdminAdoptions: () =>
    request<
      {
        id: string;
        cowName: string;
        adopterName: string;
        email: string;
        plan: string;
        amount: number;
        status: string;
        certificateId: string;
        createdAt: string;
      }[]
    >("/adoptions", { auth: true }),

  getSubscriptionPlans: () =>
    request<
      {
        code: string;
        name: string;
        quantityLitres: number;
        frequency: string;
        amountMonthly: number;
        description: string;
      }[]
    >("/subscriptions/plans"),

  createSubscription: (body: {
    planCode: string;
    customerName: string;
    email: string;
    phone: string;
    address: string;
  }) =>
    request<{
      subscriptionId: string;
      planName: string;
      amountMonthly: number;
      receiptNumber: string;
      nextDeliveryAt: string;
      status: string;
    }>("/subscriptions", {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),

  getMySubscriptions: () =>
    request<
      {
        id: string;
        planCode: string;
        planName: string;
        amountMonthly: number;
        quantityLitres: number;
        frequency: string;
        status: string;
        address: string;
        receiptNumber: string;
        nextDeliveryAt: string;
        createdAt: string;
      }[]
    >("/subscriptions/mine", { auth: true }),

  pauseSubscription: (id: string) =>
    request<{ id: string; status: string }>(`/subscriptions/${id}/pause`, {
      method: "POST",
      auth: true,
    }),

  resumeSubscription: (id: string) =>
    request<{ id: string; status: string }>(`/subscriptions/${id}/resume`, {
      method: "POST",
      auth: true,
    }),

  cancelSubscription: (id: string) =>
    request<{ id: string; status: string }>(`/subscriptions/${id}/cancel`, {
      method: "POST",
      auth: true,
    }),

  getAdminSubscriptions: () =>
    request<
      {
        id: string;
        planName: string;
        customerName: string;
        email: string;
        amountMonthly: number;
        status: string;
        nextDeliveryAt: string;
        createdAt: string;
      }[]
    >("/subscriptions", { auth: true }),

  createProduct: (body: {
    id?: string;
    name: string;
    price: number;
    priceLabel: string;
    unit: string;
    description: string;
    image: string;
    badge?: string | null;
    stock: number;
  }) =>
    request<Product>("/products", {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),

  updateProduct: (
    id: string,
    body: Partial<{
      name: string;
      price: number;
      priceLabel: string;
      unit: string;
      description: string;
      image: string;
      badge: string | null;
      stock: number;
    }>,
  ) =>
    request<Product>(`/products/${id}`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(body),
    }),

  getFarmStats: () =>
    request<{
      cows: number;
      milkTodayLitres: number;
      milkRecordsToday: number;
      healthUpdatesToday: number;
      feedRecordsToday: number;
      vaccinationsToday: number;
      reportsToday: number;
    }>("/farm/stats", { auth: true }),

  getFarmCows: () =>
    request<
      {
        id: string;
        name: string;
        breed: string;
        ageYears: number;
        milkYieldLabel: string;
        image: string;
        traits: string[];
        description: string;
        availableForAdoption: boolean;
        status: string;
      }[]
    >("/farm/cows", { auth: true }),

  updateFarmCow: (
    id: string,
    body: Partial<{
      status: string;
      milkYieldLabel: string;
      availableForAdoption: boolean;
      description: string;
    }>,
  ) =>
    request<{
      id: string;
      name: string;
      breed: string;
      status: string;
      milkYieldLabel: string;
      availableForAdoption: boolean;
      description: string;
    }>(`/farm/cows/${id}`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(body),
    }),

  getFarmMilk: () =>
    request<
      {
        id: string;
        cowId: string;
        cowName: string;
        litres: number;
        session: string;
        recordedByName: string;
        notes: string;
        recordedAt: string;
      }[]
    >("/farm/milk", { auth: true }),

  createFarmMilk: (body: {
    cowId: string;
    litres: number;
    session: string;
    notes?: string;
  }) =>
    request("/farm/milk", {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),

  getFarmHealth: () =>
    request<
      {
        id: string;
        cowName: string;
        condition: string;
        temperatureC: number | null;
        symptoms: string;
        treatment: string;
        medicineGiven: string;
        recordedByName: string;
        recordedAt: string;
      }[]
    >("/farm/health", { auth: true }),

  createFarmHealth: (body: {
    cowId: string;
    condition: string;
    temperatureC?: number | null;
    symptoms?: string;
    treatment?: string;
    medicineGiven?: string;
    notes?: string;
  }) =>
    request("/farm/health", {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),

  getFarmFeed: () =>
    request<
      {
        id: string;
        cowName: string;
        feedType: string;
        quantityKg: number;
        recordedByName: string;
        notes: string;
        recordedAt: string;
      }[]
    >("/farm/feed", { auth: true }),

  createFarmFeed: (body: {
    cowId: string;
    feedType: string;
    quantityKg: number;
    notes?: string;
  }) =>
    request("/farm/feed", {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),

  getFarmVaccinations: () =>
    request<
      {
        id: string;
        cowName: string;
        vaccineName: string;
        dose: string;
        nextDueAt: string | null;
        recordedByName: string;
        notes: string;
        recordedAt: string;
      }[]
    >("/farm/vaccinations", { auth: true }),

  createFarmVaccination: (body: {
    cowId: string;
    vaccineName: string;
    dose?: string;
    nextDueAt?: string | null;
    notes?: string;
  }) =>
    request("/farm/vaccinations", {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),

  getFarmReports: () =>
    request<
      {
        id: string;
        reportDate: string;
        summary: string;
        cowsChecked: number;
        milkTotalLitres: number;
        issues: string;
        recordedByName: string;
        createdAt: string;
      }[]
    >("/farm/reports", { auth: true }),

  createFarmReport: (body: {
    reportDate: string;
    summary: string;
    cowsChecked: number;
    milkTotalLitres: number;
    issues?: string;
  }) =>
    request("/farm/reports", {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),

  getInventoryStats: () =>
    request<{
      items: number;
      lowStock: number;
      categories: number;
      movementsToday: number;
      totalUnits: number;
    }>("/inventory/stats", { auth: true }),

  getInventoryItems: (params?: { category?: string; lowStock?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set("category", params.category);
    if (params?.lowStock) q.set("lowStock", "1");
    const qs = q.toString();
    return request<
      {
        id: string;
        sku: string;
        name: string;
        category: string;
        unit: string;
        quantityOnHand: number;
        reorderLevel: number;
        productId: string | null;
        location: string;
        notes: string;
        isLowStock?: boolean;
      }[]
    >(`/inventory${qs ? `?${qs}` : ""}`, { auth: true });
  },

  createInventoryItem: (body: {
    sku: string;
    name: string;
    category: string;
    unit: string;
    quantityOnHand?: number;
    reorderLevel?: number;
    productId?: string | null;
    location?: string;
    notes?: string;
  }) =>
    request("/inventory", {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),

  createInventoryMovement: (
    id: string,
    body: {
      type: string;
      quantity: number;
      targetQuantity?: number;
      unitCost?: number | null;
      notes?: string;
    },
  ) =>
    request(`/inventory/${id}/movements`, {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),

  getInventoryMovements: (itemId?: string) => {
    const qs = itemId ? `?itemId=${encodeURIComponent(itemId)}` : "";
    return request<
      {
        id: string;
        itemId: string;
        itemName: string;
        sku: string;
        type: string;
        quantityDelta: number;
        quantityAfter: number;
        notes: string;
        recordedByName: string;
        referenceType: string | null;
        referenceId: string | null;
        createdAt: string;
      }[]
    >(`/inventory/movements${qs}`, { auth: true });
  },

  getPaymentConfig: () =>
    request<{
      enabled: boolean;
      mock: boolean;
      keyId: string | null;
      currency: string;
      companyName: string;
    }>("/payments/config"),

  createPaymentIntent: (body: {
    purpose: "donation" | "order" | "adoption" | "subscription";
    payload: Record<string, unknown>;
  }) =>
    request<{
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
    }>("/payments/intents", {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),

  verifyPayment: (body: {
    paymentId: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) =>
    request<{
      paymentId: string;
      purpose: string;
      status: string;
      amount: number;
      entityType: string | null;
      entityId: string | null;
      fulfillment: Record<string, unknown> | null;
    }>("/payments/verify", {
      method: "POST",
      auth: true,
      body: JSON.stringify(body),
    }),

  getAdminPayments: () =>
    request<
      {
        id: string;
        purpose: string;
        status: string;
        amount: number;
        customerName: string;
        email: string;
        razorpayPaymentId: string | null;
        entityType: string | null;
        entityId: string | null;
        createdAt: string;
        paidAt: string | null;
      }[]
    >("/payments", { auth: true }),
};
