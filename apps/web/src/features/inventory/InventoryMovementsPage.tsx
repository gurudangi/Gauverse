import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../contexts/ToastContext";

interface Movement {
  id: string;
  itemName: string;
  sku: string;
  type: string;
  quantityDelta: number;
  quantityAfter: number;
  notes: string;
  recordedByName: string;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
}

export function InventoryMovementsPage() {
  const { showToast } = useToast();
  const [rows, setRows] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getInventoryMovements()
      .then((res) => setRows(res.data ?? []))
      .catch((err) =>
        showToast(
          err instanceof Error ? err.message : "Could not load movements",
          "error",
        ),
      )
      .finally(() => setLoading(false));
  }, [showToast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-forest">Stock movements</h1>
        <p className="mt-2 text-sm text-muted">
          Every receive, issue, purchase, sale, and adjustment is logged.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-forest" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-forest/20 p-10 text-center text-muted">
          No movements yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="rounded-3xl border border-forest/10 bg-cream p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-forest">
                    {row.itemName}{" "}
                    <span className="font-normal capitalize text-muted">· {row.type}</span>
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {row.sku} · {row.recordedByName} ·{" "}
                    {new Date(row.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      row.quantityDelta >= 0 ? "text-forest" : "text-saffron"
                    }`}
                  >
                    {row.quantityDelta >= 0 ? "+" : ""}
                    {row.quantityDelta}
                  </p>
                  <p className="text-xs text-muted">After: {row.quantityAfter}</p>
                </div>
              </div>
              {row.notes ? <p className="mt-2 text-sm text-muted">{row.notes}</p> : null}
              {row.referenceType ? (
                <p className="mt-1 text-xs text-muted">
                  Ref: {row.referenceType}/{row.referenceId}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
