import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../contexts/ToastContext";

export function FarmDashboard() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Awaited<
    ReturnType<typeof api.getFarmStats>
  >["data"] | null>(null);

  useEffect(() => {
    api
      .getFarmStats()
      .then((res) => setStats(res.data ?? null))
      .catch((err) =>
        showToast(err instanceof Error ? err.message : "Could not load farm stats", "error"),
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
    { label: "Cows", value: stats?.cows ?? 0, to: "/farm/cows" },
    { label: "Milk today (L)", value: stats?.milkTodayLitres ?? 0, to: "/farm/milk" },
    { label: "Milk records today", value: stats?.milkRecordsToday ?? 0, to: "/farm/milk" },
    { label: "Health updates", value: stats?.healthUpdatesToday ?? 0, to: "/farm/health" },
    { label: "Feed records", value: stats?.feedRecordsToday ?? 0, to: "/farm/feed" },
    { label: "Vaccinations", value: stats?.vaccinationsToday ?? 0, to: "/farm/vaccinations" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-forest">Farm dashboard</h1>
        <p className="mt-2 text-sm text-muted">
          Record milk, health, feed, and vaccinations for today&apos;s herd care.
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

      <div className="rounded-3xl border border-forest/10 bg-cream p-6 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-forest">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { to: "/farm/milk", label: "Log milk" },
            { to: "/farm/health", label: "Health update" },
            { to: "/farm/feed", label: "Log feed" },
            { to: "/farm/reports", label: "Daily report" },
          ].map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream hover:bg-forest/90"
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
