# GauVerse — Client Testing Guide

How to run and manually test **Shri Ahilyamata Gaushala Digital Management Platform** (public site + portals).

---

## 1. Prerequisites

- **Node.js** 20+ and npm  
- MongoDB Atlas URI (or leave unset — API can use in-memory Mongo for local demos)  
- Two terminals (API + Web)

---

## 2. Start the application

From the `GauVerse` folder:

```bash
# One-time setup
npm install
Copy-Item apps\api\.env.example apps\api\.env   # Windows
# cp apps/api/.env.example apps/api/.env        # Mac/Linux
# Edit apps/api/.env with your MongoDB URI if you have one
```

**Terminal 1 — API**

```bash
npm run dev:api
```

Wait until you see: `GauVerse API running at http://localhost:3000`

**Terminal 2 — Website**

```bash
npm run dev:web
```

Open the URL Vite prints (usually **http://localhost:5180**).  
If that port is busy, Vite may use `5181`, `5182`, etc. Prefer **`localhost`** (not `127.0.0.1`) on Windows.

---

## 3. Demo login accounts

| Role | Email | Password | Opens |
|------|--------|----------|--------|
| Super Admin | `admin@gauverse.local` | `ChangeMe@12345` | `/admin` (+ Farm, Inventory) |
| Farm Staff | `farm@gauverse.local` | `ChangeMe@12345` | `/farm` |
| Inventory Manager | `inventory@gauverse.local` | `ChangeMe@12345` | `/inventory` |
| Customer | Register via **Sign in → Create an account** | your password | `/account` |

After login you are redirected to the right portal automatically.

---

## 4. Manual test checklist (browser)

### A. Public website (`/`)

Use the header links (they scroll on one page):

| Step | What to do | Expected |
|------|------------|----------|
| 1 | Open home | Hero, brand, nav load |
| 2 | Click **Products** | Product cards load from API |
| 3 | Add item to cart → open bag icon | Cart drawer opens |
| 4 | Checkout (guest or signed-in) | Order success toast; stock decreases |
| 5 | **Donate** — fill form → Pay & donate | Receipt + certificate IDs shown |
| 6 | **Our Cows** — Adopt (must be signed in) | Certificate reference shown |
| 7 | **Subscribe** — start a milk plan (signed in) | Subscription receipt; manage in Account |
| 8 | **Farm Visit** — book a slot | Success confirmation |
| 9 | **Contact** — send message | Success confirmation |
| 10 | **Gallery / About / Contact** | Sections visible |

Payments run in **mock mode** by default (`RAZORPAY_MOCK=true`) — checkout completes without a real Razorpay account.

### B. Customer portal (`/account`)

1. Register a new user → land on **My Account**  
2. Check **Orders**, **Donations**, **Adoptions**, **Subscriptions**  
3. **Subscriptions**: Pause → Resume → Cancel  
4. **Profile**: update name/phone  

### C. Admin portal (`/admin`)

Login as `admin@gauverse.local`.

| Page | What to verify |
|------|----------------|
| Dashboard | Counts for orders, donations, subscriptions, revenue |
| Orders | Recent orders listed |
| Products | Create product / adjust stock |
| Donations / Adoptions / Subscriptions | Lists show new records |
| Payments | Payment transactions after mock checkout |
| Users | Seeded + registered users appear |
| Header **Farm** / **Inventory** | Admin can open those portals |

### D. Farm portal (`/farm`)

Login as `farm@gauverse.local`.

| Page | What to verify |
|------|----------------|
| Dashboard | Today’s milk / health / feed counts |
| Cows | Change status (healthy / under care / retired) |
| Milk | Log morning/evening litres |
| Health | Save condition + medicine notes |
| Feed | Log feed type + kg |
| Vaccinations | Record vaccine + optional next due |
| Daily reports | Submit one report per staff per day |

Customer accounts must **not** access `/farm` (redirect / forbidden).

### E. Inventory portal (`/inventory`)

Login as `inventory@gauverse.local`.

| Page | What to verify |
|------|----------------|
| Dashboard | Item count, low stock, movements today |
| Items | Receive (+10), purchase (+25), issue (−5) |
| Low stock | Items at/below reorder level |
| Movements | Every change is logged |

Issuing more than on-hand stock must fail with an error.

---

## 5. Automated smoke test (API)

With the API running:

```bash
cd GauVerse
npm run smoke
```

This hits health, auth, products, orders, donations, adoptions, subscriptions, payments (mock), farm, inventory, admin, and RBAC checks.

Expected healthy result looks like:

```text
SUMMARY: 67+ passed, 0 failed, …
```

Optional: start the web app first so the homepage check also passes.

---

## 6. Roles at a glance

| Role | Can do |
|------|--------|
| **Customer** | Shop, donate, adopt, subscribe, manage own account |
| **Farm staff** | Milk, health, feed, vaccinations, daily reports, cow status |
| **Inventory manager** | Stock items, movements, low-stock view, product stock |
| **Admin / Super admin** | Everything above + admin dashboard and user/payment lists |
| **Volunteer / Sales** | Roles exist in RBAC; dedicated portals not built yet |

---

## 7. Common issues

| Problem | Fix |
|---------|-----|
| Blank products / API errors | Ensure `npm run dev:api` is running on port **3000** |
| `127.0.0.1` page won’t load | Use `http://localhost:5180` instead |
| Port 5180 in use | Use the next port Vite prints (5181+) |
| Farm report “already submitted” | One report per staff per calendar day — change date or use next day |
| Payment fails in browser | Confirm `RAZORPAY_MOCK=true` in `apps/api/.env`, then restart API |

---

## 8. Going live with real Razorpay (optional)

In `apps/api/.env`:

```env
RAZORPAY_MOCK=false
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx
```

Restart the API. Donate / checkout will open the real Razorpay window.

---

## Quick start (TL;DR)

1. `npm install` inside `GauVerse`  
2. Copy `.env.example` → `.env` under `apps/api`  
3. `npm run dev:api`  
4. `npm run dev:web`  
5. Open **http://localhost:5180**  
6. Test public site → register customer → try Admin / Farm / Inventory with demo logins above  
7. Optionally run `npm run smoke` for API verification  

For product/requirements context see `docs/BUSINESS_REQUIREMENTS.md`.
