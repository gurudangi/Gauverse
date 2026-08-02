import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../contexts/ToastContext";
import { Button } from "../../components/ui/Button";

interface DonationRow {
  id: string;
  type: string;
  amount: number;
  status: string;
  receiptNumber: string;
  certificateId: string;
  isRecurring: boolean;
  createdAt: string;
}

export function AccountDonationsPage() {
  const { showToast } = useToast();
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMyDonations()
      .then((res) => setDonations(res.data ?? []))
      .catch((err) =>
        showToast(err instanceof Error ? err.message : "Could not load donations", "error"),
      )
      .finally(() => setLoading(false));
  }, [showToast]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest">Donation history</h1>
          <p className="mt-2 text-sm text-muted">
            Receipts and certificate references for donations made while signed in.
          </p>
        </div>
        <Button href="/#donate" variant="secondary">
          Make a donation
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-forest" />
        </div>
      ) : donations.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-forest/20 bg-cream p-10 text-center">
          <p className="text-muted">No donations yet.</p>
          <Button href="/#donate" className="mt-4">
            Donate now
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {donations.map((d) => (
            <li
              key={d.id}
              className="rounded-3xl border border-forest/10 bg-cream p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">
                    {new Date(d.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-1 font-semibold capitalize text-forest">
                    {d.type.replace("_", " ")} · ₹{d.amount}
                    {d.isRecurring ? " (monthly)" : ""}
                  </p>
                </div>
                <span className="rounded-full bg-forest/5 px-3 py-1 text-xs font-semibold capitalize text-forest">
                  {d.status}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-muted">
                <p>Receipt: {d.receiptNumber}</p>
                <p>Certificate: {d.certificateId}</p>
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
