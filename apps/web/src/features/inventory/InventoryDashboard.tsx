import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../contexts/ToastContext";

export function InventoryDashboard() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Awaited<
    ReturnType<typeof api.getInventoryStats>
  >["data"] | null>(null);

  useEffect(() => {
    api
      .getInventoryStats()
      .then((res) => setStats(res.data ?? null))
      .catch((err) =>
        showToast(
          err instanceof Error ? err.message : "Could not load inventory stats",
          "error",
        ),
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
    { label: "Active items", value: stats?.items ?? 0, to: "/inventory/items" },
    { label: "Low stock alerts", value: stats?.lowStock ?? 0, to: "/inventory/low-stock" },
    { label: "Categories", value: stats?.categories ?? 0, to: "/inventory/items" },
    { label: "Movements today", value: stats?.movementsToday ?? 0, to: "/inventory/movements" },
    { label: "Total units on hand", value: stats?.totalUnits ?? 0, to: "/inventory/items" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-forest">Inventory</h1>
        <p className="mt-2 text-sm text-muted">
          Track products, feed, medicine, and supplies. Stock never goes negative.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="rounded-3xl border border-forest/10 bg-cream p-5 shadow-sm transition hover:border-saffron/30"
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-forest">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
