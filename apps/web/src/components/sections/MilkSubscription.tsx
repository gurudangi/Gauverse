import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Loader2, Milk } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { api } from "../../lib/api";
import { Button } from "../ui/Button";
import { SectionHeading } from "../ui/SectionHeading";

interface Plan {
  code: string;
  name: string;
  quantityLitres: number;
  frequency: string;
  amountMonthly: number;
  description: string;
}

export function MilkSubscription() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planCode, setPlanCode] = useState("daily_1l");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [receipt, setReceipt] = useState<{
    planName: string;
    receiptNumber: string;
    nextDeliveryAt: string;
  } | null>(null);

  useEffect(() => {
    api
      .getSubscriptionPlans()
      .then((res) => {
        setPlans(res.data ?? []);
        if (res.data?.[0]) setPlanCode(res.data[0].code);
      })
      .catch(() => showToast("Could not load subscription plans", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      customerName: prev.customerName || user.name,
      email: prev.email || user.email,
      phone: prev.phone || user.phone,
    }));
  }, [user]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Please sign in to start a subscription", "error");
      return;
    }
    setSubmitting(true);
    setReceipt(null);
    try {
      const payload = { planCode, ...form };
      const { isRazorpayEnabled, completeRazorpayPayment } = await import(
        "../../lib/razorpay"
      );
      if (await isRazorpayEnabled()) {
        const intent = await api.createPaymentIntent({
          purpose: "subscription",
          payload,
        });
        if (!intent.data) throw new Error("Could not start payment");
        const paid = await completeRazorpayPayment(intent.data);
        const f = paid.fulfillment ?? {};
        showToast("Subscription paid and started!");
        setReceipt({
          planName: String(f.planName ?? ""),
          receiptNumber: String(f.receiptNumber ?? ""),
          nextDeliveryAt: String(f.nextDeliveryAt ?? ""),
        });
      } else {
        const res = await api.createSubscription(payload);
        showToast(res.message ?? "Subscription started!");
        if (res.data) {
          setReceipt({
            planName: res.data.planName,
            receiptNumber: res.data.receiptNumber,
            nextDeliveryAt: res.data.nextDeliveryAt,
          });
        }
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Subscription failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="subscribe" className="section-padding">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Recurring Delivery"
          title="Milk Subscription Plans"
          subtitle="Pause, resume, or cancel anytime from your account. Fresh Gir A2 milk on your schedule."
        />

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-forest" />
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-4">
              {plans.map((plan) => (
                <button
                  key={plan.code}
                  type="button"
                  onClick={() => setPlanCode(plan.code)}
                  className={`flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition ${
                    planCode === plan.code
                      ? "border-saffron bg-cream shadow-md"
                      : "border-forest/10 bg-cream/70 hover:border-forest/20"
                  }`}
                >
                  <Milk
                    className={`mt-0.5 h-5 w-5 shrink-0 ${
                      planCode === plan.code ? "text-saffron" : "text-forest/40"
                    }`}
                  />
                  <span>
                    <span className="block font-display text-xl font-semibold text-forest">
                      {plan.name}
                    </span>
                    <span className="mt-1 block text-sm text-muted">{plan.description}</span>
                    <span className="mt-2 block text-sm font-semibold text-forest">
                      ₹{plan.amountMonthly}/mo · {plan.frequency} · {plan.quantityLitres}L
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="glass-card space-y-4 p-8">
              {!user && (
                <p className="text-sm text-muted">
                  <Link to="/login" className="font-semibold text-forest hover:underline">
                    Sign in
                  </Link>{" "}
                  to start a milk subscription.
                </p>
              )}
              <input
                required
                minLength={2}
                placeholder="Full name"
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
              />
              <input
                required
                minLength={10}
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
              />
              <textarea
                required
                minLength={5}
                rows={3}
                placeholder="Delivery address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
              />
              <p className="text-xs text-muted">
                First month is charged securely at checkout. Pause or cancel anytime from your
                account.
              </p>
              <Button type="submit" className="w-full" disabled={submitting || !user}>
                {submitting ? "Processing…" : "Pay & start subscription"}
              </Button>
              {receipt && (
                <div className="rounded-2xl border border-saffron/30 bg-saffron/10 p-4 text-sm text-forest">
                  <p className="font-semibold">{receipt.planName} started</p>
                  <p className="mt-2">Receipt: {receipt.receiptNumber}</p>
                  <p>Next delivery: {new Date(receipt.nextDeliveryAt).toLocaleString()}</p>
                  <Link
                    to="/account/subscriptions"
                    className="mt-2 inline-block font-semibold hover:underline"
                  >
                    Manage in My Account →
                  </Link>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
