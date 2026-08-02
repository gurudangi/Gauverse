import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../contexts/ToastContext";
import { Button } from "../../components/ui/Button";

interface AdoptionRow {
  id: string;
  cowName: string;
  plan: string;
  amount: number;
  status: string;
  receiptNumber: string;
  certificateId: string;
  startsAt: string;
  endsAt: string;
}

export function AccountAdoptionsPage() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<AdoptionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMyAdoptions()
      .then((res) => setRows(res.data ?? []))
      .catch((err) =>
        showToast(err instanceof Error ? err.message : "Could not load adoptions", "error"),
      )
      .finally(() => setLoading(false));
  }, [showToast]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest">Adopted cows</h1>
          <p className="mt-2 text-sm text-muted">Your sponsorships and certificate references.</p>
        </div>
        <Button href="/#cows" variant="secondary">
          Adopt a cow
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-forest" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-forest/20 bg-cream p-10 text-center">
          <p className="text-muted">No adoptions yet.</p>
          <Button href="/#cows" className="mt-4">
            Meet our cows
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((row) => (
            <li key={row.id} className="rounded-3xl border border-forest/10 bg-cream p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-semibold text-forest">{row.cowName}</p>
                  <p className="mt-1 text-sm capitalize text-muted">
                    {row.plan} · ₹{row.amount}
                  </p>
                </div>
                <span className="rounded-full bg-forest/5 px-3 py-1 text-xs font-semibold capitalize text-forest">
                  {row.status}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-muted">
                <p>
                  Period: {new Date(row.startsAt).toLocaleDateString()} →{" "}
                  {new Date(row.endsAt).toLocaleDateString()}
                </p>
                <p>Receipt: {row.receiptNumber}</p>
                <p>Certificate: {row.certificateId}</p>
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
