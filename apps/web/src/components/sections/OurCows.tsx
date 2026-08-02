import { useEffect, useState, type FormEvent } from "react";
import { Droplets, Heart, Loader2, MapPin, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { api } from "../../lib/api";
import { Button } from "../ui/Button";
import { SectionHeading } from "../ui/SectionHeading";

interface Cow {
  id: string;
  name: string;
  breed: string;
  ageYears: number;
  milkYieldLabel: string;
  image: string;
  traits: string[];
  description: string;
  availableForAdoption: boolean;
}

interface Plan {
  code: string;
  label: string;
  months: number;
  amount: number;
}

export function OurCows() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [cows, setCows] = useState<Cow[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Cow | null>(null);
  const [plan, setPlan] = useState("monthly");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ adopterName: "", email: "", phone: "" });
  const [result, setResult] = useState<{
    certificateId: string;
    receiptNumber: string;
    cowName: string;
  } | null>(null);

  useEffect(() => {
    Promise.all([api.getCows(), api.getAdoptionPlans()])
      .then(([cowsRes, plansRes]) => {
        setCows(cowsRes.data ?? []);
        setPlans(plansRes.data ?? []);
        if (plansRes.data?.[0]) setPlan(plansRes.data[0].code);
      })
      .catch(() => showToast("Could not load cows", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    if (!user) return;
    setForm({
      adopterName: user.name,
      email: user.email,
      phone: user.phone,
    });
  }, [user]);

  const openAdopt = (cow: Cow) => {
    setSelected(cow);
    setResult(null);
  };

  const onAdopt = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!user) {
      showToast("Please sign in to adopt a cow", "error");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        cowId: selected.id,
        plan,
        ...form,
      };
      const { isRazorpayEnabled, completeRazorpayPayment } = await import(
        "../../lib/razorpay"
      );
      if (await isRazorpayEnabled()) {
        const intent = await api.createPaymentIntent({
          purpose: "adoption",
          payload,
        });
        if (!intent.data) throw new Error("Could not start payment");
        const paid = await completeRazorpayPayment(intent.data);
        const f = paid.fulfillment ?? {};
        showToast("Adoption paid — certificate ready!");
        setResult({
          certificateId: String(f.certificateId ?? ""),
          receiptNumber: String(f.receiptNumber ?? ""),
          cowName: String(f.cowName ?? selected.name),
        });
      } else {
        const res = await api.createAdoption(payload);
        showToast(res.message ?? "Adoption recorded!");
        if (res.data) {
          setResult({
            certificateId: res.data.certificateId,
            receiptNumber: res.data.receiptNumber,
            cowName: res.data.cowName,
          });
        }
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Adoption failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="cows" className="section-padding bg-cream-dark/40">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Meet the Family"
          title="Our Beloved Gir Cows"
          subtitle="Each cow has a name and a story. Sponsor one through cow adoption and receive a certificate of seva."
        />

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-forest" />
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {cows.map((cow) => (
              <article
                key={cow.id}
                className="group overflow-hidden rounded-3xl bg-cream shadow-lg shadow-forest/5 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={cow.image}
                    alt={`${cow.name} - Gir cow`}
                    className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="rounded-full bg-saffron/90 px-3 py-1 text-xs font-semibold text-forest-dark">
                      {cow.breed}
                    </span>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-cream">
                      {cow.name}
                    </h3>
                  </div>
                </div>
                <div className="p-5">
                  <div className="mb-4 flex items-center justify-between text-sm">
                    <span className="text-muted">Age: {cow.ageYears} years</span>
                    <span className="flex items-center gap-1 font-semibold text-forest">
                      <Droplets className="h-4 w-4 text-saffron" />
                      {cow.milkYieldLabel}
                    </span>
                  </div>
                  <ul className="mb-4 space-y-1.5">
                    {cow.traits.map((trait) => (
                      <li key={trait} className="flex items-center gap-2 text-xs text-muted">
                        <div className="h-1 w-1 rounded-full bg-saffron" />
                        {trait}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => openAdopt(cow)}
                    disabled={!cow.availableForAdoption}
                  >
                    <Heart className="h-4 w-4" />
                    {cow.availableForAdoption ? "Adopt" : "Unavailable"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button href="#farm-visit" variant="primary">
            <MapPin className="h-4 w-4" />
            Visit Our Farm
          </Button>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-forest-dark/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-cream p-6 shadow-2xl">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-lg p-2 hover:bg-forest/5"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display text-2xl font-semibold text-forest">
              Adopt {selected.name}
            </h3>
            <p className="mt-2 text-sm text-muted">{selected.description}</p>

            {result ? (
              <div className="mt-6 rounded-2xl border border-saffron/30 bg-saffron/10 p-4 text-sm">
                <p className="font-semibold text-forest">
                  Thank you for adopting {result.cowName}!
                </p>
                <p className="mt-2 text-muted">Receipt: {result.receiptNumber}</p>
                <p className="text-muted">Certificate: {result.certificateId}</p>
                <Link
                  to="/account/adoptions"
                  className="mt-3 inline-block font-semibold text-forest hover:underline"
                >
                  View in My Account →
                </Link>
              </div>
            ) : (
              <form onSubmit={onAdopt} className="mt-6 space-y-4">
                <div className="grid gap-2">
                  {plans.map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => setPlan(p.code)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm ${
                        plan === p.code
                          ? "border-saffron bg-saffron/10"
                          : "border-forest/10 hover:border-forest/20"
                      }`}
                    >
                      <span className="font-semibold text-forest">{p.label}</span>
                      <span className="mt-1 block text-muted">
                        ₹{p.amount} · {p.months} month{p.months > 1 ? "s" : ""}
                      </span>
                    </button>
                  ))}
                </div>
                {!user && (
                  <p className="text-sm text-muted">
                    <Link to="/login" className="font-semibold text-forest hover:underline">
                      Sign in
                    </Link>{" "}
                    to complete adoption and save your certificate.
                  </p>
                )}
                <input
                  required
                  minLength={2}
                  placeholder="Full name"
                  value={form.adopterName}
                  onChange={(e) => setForm((f) => ({ ...f, adopterName: e.target.value }))}
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
                <Button type="submit" className="w-full" disabled={submitting || !user}>
                  {submitting ? "Recording…" : "Confirm adoption"}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
