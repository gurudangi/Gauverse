import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../contexts/ToastContext";
import { Button } from "../../components/ui/Button";

interface SubRow {
  id: string;
  planName: string;
  amountMonthly: number;
  quantityLitres: number;
  frequency: string;
  status: string;
  address: string;
  receiptNumber: string;
  nextDeliveryAt: string;
}

export function AccountSubscriptionsPage() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = async () => {
    const res = await api.getMySubscriptions();
    setRows(res.data ?? []);
  };

  useEffect(() => {
    reload()
      .catch((err) =>
        showToast(
          err instanceof Error ? err.message : "Could not load subscriptions",
          "error",
        ),
      )
      .finally(() => setLoading(false));
  }, [showToast]);

  const runAction = async (
    id: string,
    action: "pause" | "resume" | "cancel",
  ) => {
    setBusyId(id);
    try {
      if (action === "pause") await api.pauseSubscription(id);
      if (action === "resume") await api.resumeSubscription(id);
      if (action === "cancel") await api.cancelSubscription(id);
      showToast(
        action === "pause"
          ? "Subscription paused"
          : action === "resume"
            ? "Subscription resumed"
            : "Subscription cancelled",
      );
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Action failed", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest">Subscriptions</h1>
          <p className="mt-2 text-sm text-muted">Pause, resume, or cancel your milk plans.</p>
        </div>
        <Button href="/#subscribe" variant="secondary">
          New subscription
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-forest" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-forest/20 bg-cream p-10 text-center">
          <p className="text-muted">No subscriptions yet.</p>
          <Button href="/#subscribe" className="mt-4">
            Browse plans
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => (
            <li key={row.id} className="rounded-3xl border border-forest/10 bg-cream p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-semibold text-forest">{row.planName}</p>
                  <p className="mt-1 text-sm text-muted">
                    ₹{row.amountMonthly}/mo · {row.frequency} · {row.quantityLitres}L
                  </p>
                </div>
                <span className="rounded-full bg-forest/5 px-3 py-1 text-xs font-semibold capitalize text-forest">
                  {row.status}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-muted">
                <p>Address: {row.address}</p>
                <p>Receipt: {row.receiptNumber}</p>
                <p>Next delivery: {new Date(row.nextDeliveryAt).toLocaleString()}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {row.status === "active" && (
                  <Button
                    variant="outline"
                    disabled={busyId === row.id}
                    onClick={() => runAction(row.id, "pause")}
                  >
                    Pause
                  </Button>
                )}
                {row.status === "paused" && (
                  <Button
                    variant="outline"
                    disabled={busyId === row.id}
                    onClick={() => runAction(row.id, "resume")}
                  >
                    Resume
                  </Button>
                )}
                {row.status !== "cancelled" && (
                  <Button
                    variant="outline"
                    disabled={busyId === row.id}
                    onClick={() => runAction(row.id, "cancel")}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link to="/account" className="text-sm font-medium text-forest hover:underline">
        ← Back to dashboard
      </Link>
    </div>
  );
}
