import { useEffect, useState, type FormEvent } from "react";
import { HeartHandshake, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { api } from "../../lib/api";
import { Button } from "../ui/Button";
import { SectionHeading } from "../ui/SectionHeading";

const DONATION_OPTIONS = [
  { value: "gauseva", label: "Gauseva (cow care)", hint: "Daily care & shelter" },
  { value: "feed", label: "Feed & fodder", hint: "Nutrition for Gir cows" },
  { value: "medical", label: "Medical care", hint: "Vet & medicines" },
  { value: "infrastructure", label: "Infrastructure", hint: "Sheds & water" },
  { value: "general", label: "General fund", hint: "Where needed most" },
  { value: "monthly", label: "Monthly support", hint: "Recurring seva" },
] as const;

const PRESETS = [51, 101, 501, 1100, 5100];

export function Donation() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<{
    receiptNumber: string;
    certificateId: string;
    amount: number;
  } | null>(null);
  const [form, setForm] = useState({
    donorName: "",
    email: "",
    phone: "",
    type: "gauseva",
    amount: "501",
    message: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      donorName: prev.donorName || user.name,
      email: prev.email || user.email,
      phone: prev.phone || user.phone,
    }));
  }, [user]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setReceipt(null);
    try {
      const payload = {
        donorName: form.donorName,
        email: form.email,
        phone: form.phone,
        type: form.type,
        amount: Number(form.amount),
        message: form.message || undefined,
      };

      const { isRazorpayEnabled, completeRazorpayPayment } = await import(
        "../../lib/razorpay"
      );
      if (await isRazorpayEnabled()) {
        const intent = await api.createPaymentIntent({
          purpose: "donation",
          payload,
        });
        if (!intent.data) throw new Error("Could not start payment");
        const paid = await completeRazorpayPayment(intent.data);
        const f = paid.fulfillment ?? {};
        showToast("Donation paid. Thank you for your seva!");
        setReceipt({
          receiptNumber: String(f.receiptNumber ?? ""),
          certificateId: String(f.certificateId ?? ""),
          amount: Number(f.amount ?? paid.amount),
        });
      } else {
        const res = await api.createDonation(payload);
        showToast(res.message ?? "Donation recorded. Thank you!");
        if (res.data) {
          setReceipt({
            receiptNumber: res.data.receiptNumber,
            certificateId: res.data.certificateId,
            amount: res.data.amount,
          });
        }
      }
      setForm((prev) => ({ ...prev, amount: "501", message: "" }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Donation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="donate" className="section-padding bg-cream-dark/40">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Support Seva"
          title="Donate to Shri Ahilyamata Gaushala"
          subtitle="Every contribution helps feed, heal, and shelter our Gir cows. You receive a unique receipt and certificate reference instantly."
        />

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            {DONATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, type: opt.value }))}
                className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${
                  form.type === opt.value
                    ? "border-saffron bg-cream shadow-md"
                    : "border-forest/10 bg-cream/60 hover:border-forest/20"
                }`}
              >
                <HeartHandshake
                  className={`mt-0.5 h-5 w-5 shrink-0 ${
                    form.type === opt.value ? "text-saffron" : "text-forest/40"
                  }`}
                />
                <span>
                  <span className="block font-semibold text-forest">{opt.label}</span>
                  <span className="text-sm text-muted">{opt.hint}</span>
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="glass-card space-y-5 p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-forest" htmlFor="donor-name">
                  Full name
                </label>
                <input
                  id="donor-name"
                  required
                  minLength={2}
                  value={form.donorName}
                  onChange={(e) => setForm((p) => ({ ...p, donorName: e.target.value }))}
                  className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest" htmlFor="donor-email">
                  Email
                </label>
                <input
                  id="donor-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest" htmlFor="donor-phone">
                  Phone
                </label>
                <input
                  id="donor-phone"
                  required
                  minLength={10}
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-forest">Amount (₹)</p>
              <div className="mb-3 flex flex-wrap gap-2">
                {PRESETS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, amount: String(amount) }))}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      form.amount === String(amount)
                        ? "bg-forest text-cream"
                        : "bg-forest/5 text-forest hover:bg-forest/10"
                    }`}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={11}
                required
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-forest" htmlFor="donor-msg">
                Message (optional)
              </label>
              <textarea
                id="donor-msg"
                rows={3}
                maxLength={500}
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                className="w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm outline-none focus:border-forest"
              />
            </div>

            <p className="text-xs text-muted">
              Online Razorpay checkout comes next. For now, donations are recorded with an
              official receipt and certificate reference.
            </p>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Recording…
                </>
              ) : (
                "Pay & donate"
              )}
            </Button>

            {receipt && (
              <div className="rounded-2xl border border-saffron/30 bg-saffron/10 p-4 text-sm text-forest">
                <p className="font-semibold">Donation recorded — ₹{receipt.amount}</p>
                <p className="mt-2">Receipt: {receipt.receiptNumber}</p>
                <p>Certificate: {receipt.certificateId}</p>
                {user && (
                  <p className="mt-2 text-muted">
                    Saved to your account under Donation history.
                  </p>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
