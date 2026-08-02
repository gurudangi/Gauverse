/**
 * Full GauVerse API smoke suite.
 * Usage: node scripts/smoke-all.mjs
 * Optional: API_BASE=http://127.0.0.1:3000 node scripts/smoke-all.mjs
 */

const API = process.env.API_BASE?.replace(/\/$/, "") || "http://127.0.0.1:3000";
const WEB = process.env.WEB_BASE?.replace(/\/$/, "") || "http://127.0.0.1:5182";

const results = [];
let passed = 0;
let failed = 0;
let skipped = 0;

async function req(path, opts = {}) {
  const url = path.startsWith("http") ? path : `${API}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  const res = await fetch(url, {
    ...opts,
    headers,
    signal: AbortSignal.timeout(opts.timeoutMs ?? 45_000),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 400) };
  }
  return { status: res.status, ok: res.ok, json, text };
}

function record(name, ok, detail = "") {
  if (ok) {
    passed += 1;
    results.push({ name, status: "PASS", detail });
    console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    failed += 1;
    results.push({ name, status: "FAIL", detail });
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function skip(name, detail) {
  skipped += 1;
  results.push({ name, status: "SKIP", detail });
  console.log(`  ○ ${name} — SKIP: ${detail}`);
}

async function expectOk(name, path, opts = {}, assert) {
  try {
    const res = await req(path, opts);
    if (!res.ok) {
      record(
        name,
        false,
        `HTTP ${res.status}: ${res.json?.message || JSON.stringify(res.json).slice(0, 120)}`,
      );
      return null;
    }
    if (assert) {
      const msg = assert(res);
      if (msg) {
        record(name, false, msg);
        return null;
      }
    }
    record(name, true, opts.passDetail?.(res) || `HTTP ${res.status}`);
    return res;
  } catch (err) {
    record(name, false, err instanceof Error ? err.message : String(err));
    return null;
  }
}

async function expectStatus(name, path, status, opts = {}) {
  try {
    const res = await req(path, opts);
    if (res.status !== status) {
      record(
        name,
        false,
        `expected ${status} got ${res.status}: ${res.json?.message || ""}`,
      );
      return res;
    }
    record(name, true, `HTTP ${status}`);
    return res;
  } catch (err) {
    record(name, false, err instanceof Error ? err.message : String(err));
    return null;
  }
}

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

async function main() {
  console.log(`\nGauVerse smoke suite`);
  console.log(`API: ${API}`);
  console.log(`WEB: ${WEB}\n`);

  // ─── Health ─────────────────────────────────────────────
  console.log("1. Health");
  await expectOk("API health", "/api/health", {}, (r) =>
    r.json?.data?.db !== "connected" ? `db=${r.json?.data?.db}` : null,
  );
  const webPorts = [5180, 5181, 5182, 5183, 5173];
  let webOk = false;
  for (const port of webPorts) {
    for (const host of ["localhost", "127.0.0.1"]) {
      try {
        const web = await fetch(`http://${host}:${port}/`, {
          signal: AbortSignal.timeout(4_000),
        });
        if (web.ok) {
          record("Web homepage", true, `http://${host}:${port}/ → HTTP ${web.status}`);
          webOk = true;
          break;
        }
      } catch {
        // try next
      }
    }
    if (webOk) break;
  }
  if (!webOk) {
    skip("Web homepage", `no Vite server on ports ${webPorts.join(", ")} — run npm run dev:web`);
  }

  // ─── Public catalog ─────────────────────────────────────
  console.log("\n2. Public catalog");
  const products = await expectOk("GET /api/products", "/api/products", {}, (r) =>
    !r.json?.data?.length ? "no products" : null,
  );
  const productId = products?.json?.data?.[0]?.id;
  if (productId) {
    await expectOk(`GET /api/products/${productId}`, `/api/products/${productId}`);
  }
  await expectStatus("GET unknown product → 404", "/api/products/does-not-exist", 404);

  const cows = await expectOk("GET /api/cows", "/api/cows", {}, (r) =>
    !r.json?.data?.length ? "no cows" : null,
  );
  const cowId = cows?.json?.data?.[0]?.id;
  await expectOk("GET /api/cows/plans", "/api/cows/plans");
  await expectOk("GET /api/subscriptions/plans", "/api/subscriptions/plans");
  await expectOk("GET /api/payments/config", "/api/payments/config");

  // ─── Auth ───────────────────────────────────────────────
  console.log("\n3. Auth");
  const stamp = Date.now();
  const customerEmail = `smoke-cust-${stamp}@example.com`;
  const reg = await expectOk(
    "POST /api/auth/register",
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify({
        name: "Smoke Customer",
        email: customerEmail,
        phone: "9876543210",
        password: "Secret123",
      }),
    },
    (r) => (!r.json?.data?.accessToken ? "missing accessToken" : null),
  );
  const customerToken = reg?.json?.data?.accessToken;

  await expectOk(
    "POST /api/auth/login (customer)",
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email: customerEmail, password: "Secret123" }),
    },
  );

  if (customerToken) {
    await expectOk("GET /api/auth/me", "/api/auth/me", {
      headers: auth(customerToken),
    });
    await expectOk(
      "PATCH /api/auth/profile",
      "/api/auth/profile",
      {
        method: "PATCH",
        headers: auth(customerToken),
        body: JSON.stringify({ phone: "9876500001" }),
      },
    );
  }

  const adminLogin = await expectOk(
    "POST /api/auth/login (admin)",
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email: "admin@gauverse.local",
        password: "ChangeMe@12345",
      }),
    },
  );
  const adminToken = adminLogin?.json?.data?.accessToken;

  const farmLogin = await expectOk(
    "POST /api/auth/login (farm)",
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email: "farm@gauverse.local",
        password: "ChangeMe@12345",
      }),
    },
  );
  const farmToken = farmLogin?.json?.data?.accessToken;

  const invLogin = await expectOk(
    "POST /api/auth/login (inventory)",
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email: "inventory@gauverse.local",
        password: "ChangeMe@12345",
      }),
    },
  );
  const invToken = invLogin?.json?.data?.accessToken;

  await expectStatus(
    "Bad login → 401",
    "/api/auth/login",
    401,
    {
      method: "POST",
      body: JSON.stringify({ email: customerEmail, password: "wrong-password" }),
    },
  );

  // ─── Contact & farm visits ──────────────────────────────
  console.log("\n4. Contact & farm visits");
  await expectOk(
    "POST /api/contact",
    "/api/contact",
    {
      method: "POST",
      body: JSON.stringify({
        name: "Smoke Visitor",
        phone: "9876543210",
        email: "smoke@example.com",
        subject: "Smoke test",
        message: "Hello from smoke suite",
      }),
    },
  );
  await expectStatus(
    "POST /api/contact invalid → 400",
    "/api/contact",
    400,
    {
      method: "POST",
      body: JSON.stringify({ name: "X", phone: "1", email: "bad", subject: "", message: "hi" }),
    },
  );
  await expectOk(
    "POST /api/farm-visits",
    "/api/farm-visits",
    {
      method: "POST",
      body: JSON.stringify({
        name: "Smoke Tour",
        phone: "9876543210",
        date: "2026-09-15",
        guests: 2,
        timeSlot: "10:00 AM",
        notes: "smoke",
      }),
    },
  );

  // ─── Orders (recorded) ──────────────────────────────────
  console.log("\n5. Orders");
  if (productId && customerToken) {
    const order = await expectOk(
      "POST /api/orders",
      "/api/orders",
      {
        method: "POST",
        headers: auth(customerToken),
        body: JSON.stringify({
          customerName: "Smoke Customer",
          phone: "9876543210",
          email: customerEmail,
          address: "12 Smoke Lane, Indore",
          items: [{ productId, quantity: 1 }],
        }),
      },
      (r) => (!r.json?.data?.orderId ? "missing orderId" : null),
    );
    record(
      "Order has total",
      Boolean(order?.json?.data?.total >= 0),
      `total=${order?.json?.data?.total}`,
    );
    await expectOk("GET /api/orders/mine", "/api/orders/mine", {
      headers: auth(customerToken),
    });
  } else {
    skip("POST /api/orders", "missing product or customer token");
  }
  await expectStatus(
    "POST /api/orders invalid → 400",
    "/api/orders",
    400,
    {
      method: "POST",
      body: JSON.stringify({
        customerName: "X",
        phone: "1",
        email: "bad",
        address: "x",
        items: [],
      }),
    },
  );

  // ─── Donations ──────────────────────────────────────────
  console.log("\n6. Donations");
  if (customerToken) {
    await expectOk(
      "POST /api/donations (recorded)",
      "/api/donations",
      {
        method: "POST",
        headers: auth(customerToken),
        body: JSON.stringify({
          donorName: "Smoke Donor",
          email: customerEmail,
          phone: "9876543210",
          type: "gauseva",
          amount: 101,
          message: "smoke donation",
        }),
      },
      (r) => (!r.json?.data?.receiptNumber ? "missing receipt" : null),
    );
    await expectOk("GET /api/donations/mine", "/api/donations/mine", {
      headers: auth(customerToken),
    });
  }

  // ─── Adoptions ──────────────────────────────────────────
  console.log("\n7. Adoptions");
  if (cowId && customerToken) {
    await expectOk(
      "POST /api/adoptions",
      "/api/adoptions",
      {
        method: "POST",
        headers: auth(customerToken),
        body: JSON.stringify({
          cowId,
          plan: "monthly",
          adopterName: "Smoke Adopter",
          email: customerEmail,
          phone: "9876543210",
        }),
      },
      (r) => (!r.json?.data?.certificateId ? "missing certificate" : null),
    );
    await expectOk("GET /api/adoptions/mine", "/api/adoptions/mine", {
      headers: auth(customerToken),
    });
  } else {
    skip("POST /api/adoptions", "missing cow or customer token");
  }

  // ─── Subscriptions ──────────────────────────────────────
  console.log("\n8. Subscriptions");
  let subscriptionId = null;
  if (customerToken) {
    const sub = await expectOk(
      "POST /api/subscriptions",
      "/api/subscriptions",
      {
        method: "POST",
        headers: auth(customerToken),
        body: JSON.stringify({
          planCode: "daily_1l",
          customerName: "Smoke Customer",
          email: customerEmail,
          phone: "9876543210",
          address: "12 Milk Lane Indore",
        }),
      },
    );
    subscriptionId = sub?.json?.data?.subscriptionId;
    if (subscriptionId) {
      await expectOk(
        "POST pause subscription",
        `/api/subscriptions/${subscriptionId}/pause`,
        { method: "POST", headers: auth(customerToken) },
        (r) => (r.json?.data?.status !== "paused" ? `status=${r.json?.data?.status}` : null),
      );
      await expectOk(
        "POST resume subscription",
        `/api/subscriptions/${subscriptionId}/resume`,
        { method: "POST", headers: auth(customerToken) },
        (r) => (r.json?.data?.status !== "active" ? `status=${r.json?.data?.status}` : null),
      );
      await expectOk(
        "POST cancel subscription",
        `/api/subscriptions/${subscriptionId}/cancel`,
        { method: "POST", headers: auth(customerToken) },
        (r) =>
          r.json?.data?.status !== "cancelled" ? `status=${r.json?.data?.status}` : null,
      );
    }
    await expectOk("GET /api/subscriptions/mine", "/api/subscriptions/mine", {
      headers: auth(customerToken),
    });
    await expectStatus(
      "Customer cannot list all subscriptions → 403",
      "/api/subscriptions",
      403,
      { headers: auth(customerToken) },
    );
  }

  // ─── Payments (mock) ────────────────────────────────────
  console.log("\n9. Payments");
  const payCfg = await req("/api/payments/config");
  if (payCfg.json?.data?.enabled) {
    const intent = await expectOk(
      "POST /api/payments/intents (donation)",
      "/api/payments/intents",
      {
        method: "POST",
        body: JSON.stringify({
          purpose: "donation",
          payload: {
            donorName: "Pay Smoke",
            email: `pay-${stamp}@example.com`,
            phone: "9876543210",
            type: "feed",
            amount: 251,
          },
        }),
      },
    );
    const d = intent?.json?.data;
    if (d) {
      const sig = d.mock ? `mock_sig_${d.paymentId}` : "invalid-for-live";
      if (d.mock) {
        await expectOk(
          "POST /api/payments/verify (mock)",
          "/api/payments/verify",
          {
            method: "POST",
            body: JSON.stringify({
              paymentId: d.paymentId,
              razorpay_order_id: d.razorpayOrderId,
              razorpay_payment_id: `pay_mock_${stamp}`,
              razorpay_signature: sig,
            }),
          },
          (r) => (r.json?.data?.status !== "paid" ? `status=${r.json?.data?.status}` : null),
        );
      } else {
        skip("POST /api/payments/verify", "live Razorpay — skipping auto verify");
      }
    }

    if (productId) {
      const oIntent = await expectOk(
        "POST /api/payments/intents (order)",
        "/api/payments/intents",
        {
          method: "POST",
          body: JSON.stringify({
            purpose: "order",
            payload: {
              customerName: "Pay Buyer",
              email: `buyer-${stamp}@example.com`,
              phone: "9876543210",
              address: "99 Checkout Road Indore",
              items: [{ productId, quantity: 1 }],
            },
          }),
        },
      );
      const od = oIntent?.json?.data;
      if (od?.mock) {
        await expectOk(
          "Verify paid order intent",
          "/api/payments/verify",
          {
            method: "POST",
            body: JSON.stringify({
              paymentId: od.paymentId,
              razorpay_order_id: od.razorpayOrderId,
              razorpay_payment_id: `pay_mock_order_${stamp}`,
              razorpay_signature: `mock_sig_${od.paymentId}`,
            }),
          },
        );
      }
    }
  } else {
    skip("Payments", "Razorpay disabled in config");
  }

  // ─── Farm portal ────────────────────────────────────────
  console.log("\n10. Farm portal");
  if (farmToken && cowId) {
    await expectOk("GET /api/farm/stats", "/api/farm/stats", {
      headers: auth(farmToken),
    });
    await expectOk("GET /api/farm/cows", "/api/farm/cows", {
      headers: auth(farmToken),
    });
    await expectOk(
      "POST /api/farm/milk",
      "/api/farm/milk",
      {
        method: "POST",
        headers: auth(farmToken),
        body: JSON.stringify({
          cowId,
          litres: 7.5,
          session: "morning",
          notes: "smoke milk",
        }),
      },
    );
    await expectOk("GET /api/farm/milk", "/api/farm/milk", {
      headers: auth(farmToken),
    });
    await expectOk(
      "POST /api/farm/health",
      "/api/farm/health",
      {
        method: "POST",
        headers: auth(farmToken),
        body: JSON.stringify({
          cowId,
          condition: "healthy",
          temperatureC: 38.1,
        }),
      },
    );
    await expectOk(
      "POST /api/farm/feed",
      "/api/farm/feed",
      {
        method: "POST",
        headers: auth(farmToken),
        body: JSON.stringify({
          cowId,
          feedType: "Green fodder",
          quantityKg: 3,
        }),
      },
    );
    await expectOk(
      "POST /api/farm/vaccinations",
      "/api/farm/vaccinations",
      {
        method: "POST",
        headers: auth(farmToken),
        body: JSON.stringify({
          cowId,
          vaccineName: "Smoke Vax",
          dose: "1ml",
        }),
      },
    );
    await expectOk(
      "POST /api/farm/reports",
      "/api/farm/reports",
      {
        method: "POST",
        headers: auth(farmToken),
        body: JSON.stringify({
          reportDate: new Date().toISOString().slice(0, 10),
          summary: "Smoke daily report — all checks completed.",
          cowsChecked: 4,
          milkTotalLitres: 7.5,
          issues: "",
        }),
      },
    );
    await expectOk(
      "PATCH /api/farm/cows/:id",
      `/api/farm/cows/${cowId}`,
      {
        method: "PATCH",
        headers: auth(farmToken),
        body: JSON.stringify({ status: "healthy" }),
      },
    );
    if (customerToken) {
      await expectStatus(
        "Customer blocked from farm → 403",
        "/api/farm/stats",
        403,
        { headers: auth(customerToken) },
      );
    }
  } else {
    skip("Farm portal", "missing farm token or cow");
  }

  // ─── Inventory portal ───────────────────────────────────
  console.log("\n11. Inventory portal");
  if (invToken) {
    await expectOk("GET /api/inventory/stats", "/api/inventory/stats", {
      headers: auth(invToken),
    });
    const items = await expectOk("GET /api/inventory", "/api/inventory", {
      headers: auth(invToken),
    });
    const item = items?.json?.data?.[0];
    if (item) {
      await expectOk(
        "POST inventory receive",
        `/api/inventory/${item.id}/movements`,
        {
          method: "POST",
          headers: auth(invToken),
          body: JSON.stringify({ type: "receive", quantity: 2, notes: "smoke" }),
        },
      );
      await expectOk(
        "POST inventory issue",
        `/api/inventory/${item.id}/movements`,
        {
          method: "POST",
          headers: auth(invToken),
          body: JSON.stringify({ type: "issue", quantity: 1 }),
        },
      );
      await expectStatus(
        "Negative stock blocked → 400",
        `/api/inventory/${item.id}/movements`,
        400,
        {
          method: "POST",
          headers: auth(invToken),
          body: JSON.stringify({ type: "issue", quantity: 999999 }),
        },
      );
    }
    await expectOk("GET /api/inventory/movements", "/api/inventory/movements", {
      headers: auth(invToken),
    });
    await expectOk("GET /api/inventory?lowStock=1", "/api/inventory?lowStock=1", {
      headers: auth(invToken),
    });
    if (customerToken) {
      await expectStatus(
        "Customer blocked from inventory → 403",
        "/api/inventory/stats",
        403,
        { headers: auth(customerToken) },
      );
    }
  } else {
    skip("Inventory portal", "missing inventory token");
  }

  // ─── Admin ──────────────────────────────────────────────
  console.log("\n12. Admin");
  if (adminToken) {
    await expectOk("GET /api/admin/stats", "/api/admin/stats", {
      headers: auth(adminToken),
    });
    await expectOk("GET /api/admin/orders", "/api/admin/orders", {
      headers: auth(adminToken),
    });
    await expectOk("GET /api/admin/donations", "/api/admin/donations", {
      headers: auth(adminToken),
    });
    await expectOk("GET /api/admin/users", "/api/admin/users", {
      headers: auth(adminToken),
    });
    await expectOk("GET /api/adoptions (admin)", "/api/adoptions", {
      headers: auth(adminToken),
    });
    await expectOk("GET /api/subscriptions (admin)", "/api/subscriptions", {
      headers: auth(adminToken),
    });
    await expectOk("GET /api/payments (admin)", "/api/payments", {
      headers: auth(adminToken),
    });
    await expectOk(
      "POST /api/products (admin create)",
      "/api/products",
      {
        method: "POST",
        headers: auth(adminToken),
        body: JSON.stringify({
          name: `Smoke Product ${stamp}`,
          price: 99,
          priceLabel: "₹99",
          unit: "pack",
          description: "Created by smoke suite for verification",
          image:
            "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop",
          stock: 10,
          badge: "Smoke",
        }),
      },
    );
  } else {
    skip("Admin", "missing admin token");
  }

  // ─── RBAC negatives ─────────────────────────────────────
  console.log("\n13. RBAC negatives");
  if (farmToken) {
    await expectStatus(
      "Farm staff blocked from admin stats → 403",
      "/api/admin/stats",
      403,
      { headers: auth(farmToken) },
    );
  }
  if (invToken) {
    await expectStatus(
      "Inventory blocked from farm → 403",
      "/api/farm/stats",
      403,
      { headers: auth(invToken) },
    );
  }
  await expectStatus("Unauthenticated farm → 401", "/api/farm/stats", 401);
  await expectStatus("Unknown API route → 404", "/api/nope-smoke", 404);

  // ─── Summary ────────────────────────────────────────────
  console.log("\n" + "─".repeat(56));
  console.log(`SUMMARY: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  console.log("─".repeat(56));
  if (failed > 0) {
    console.log("\nFailed checks:");
    for (const r of results.filter((x) => x.status === "FAIL")) {
      console.log(`  - ${r.name}: ${r.detail}`);
    }
  }
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Smoke suite crashed:", err);
  process.exit(1);
});
