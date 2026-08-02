import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../contexts/ToastContext";

export function AdminDashboard() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Awaited<
    ReturnType<typeof api.getAdminStats>
  >["data"] | null>(null);

  useEffect(() => {
    api
      .getAdminStats()
      .then((res) => setStats(res.data ?? null))
      .catch((err) =>
        showToast(err instanceof Error ? err.message : "Could not load stats", "error"),
      )
      .finally(() => setLoading(false));
  }, [showToast]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-forest" />
      </div>
    );
  }

  const cards = [
    { label: "Orders", value: stats?.orders ?? 0 },
    { label: "Products", value: stats?.products ?? 0 },
    { label: "Donations", value: stats?.donations ?? 0 },
    { label: "Adoptions", value: stats?.adoptions ?? 0 },
    { label: "Subscriptions", value: stats?.subscriptions ?? 0 },
    { label: "Users", value: stats?.users ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-forest">Dashboard</h1>
        <p className="mt-2 text-sm text-muted">Live overview of GauVerse operations.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-forest/10 bg-cream p-5 shadow-sm"
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-forest">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-forest/10 bg-cream p-6 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-forest">Revenue recorded</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-muted">Orders</p>
            <p className="text-lg font-semibold text-forest">₹{stats?.revenue.orders ?? 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Donations</p>
            <p className="text-lg font-semibold text-forest">₹{stats?.revenue.donations ?? 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Adoptions</p>
            <p className="text-lg font-semibold text-forest">₹{stats?.revenue.adoptions ?? 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Subscriptions / mo</p>
            <p className="text-lg font-semibold text-forest">
              ₹{stats?.revenue.subscriptionsMonthly ?? 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
