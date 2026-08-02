import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../contexts/ToastContext";
import { Button } from "../../components/ui/Button";

interface OrderRow {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: { name: string; quantity: number; price: number }[];
}

export function AccountOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMyOrders()
      .then((res) => setOrders(res.data ?? []))
      .catch((err) =>
        showToast(err instanceof Error ? err.message : "Could not load orders", "error"),
      )
      .finally(() => setLoading(false));
  }, [showToast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-forest">Your orders</h1>
        <p className="mt-2 text-sm text-muted">
          Orders placed while signed in appear here.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-forest" />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-forest/20 bg-cream p-10 text-center">
          <p className="text-muted">No orders yet.</p>
          <Button href="/#products" className="mt-4">
            Shop products
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="rounded-3xl border border-forest/10 bg-cream p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-1 font-semibold text-forest">
                    #{order.id.slice(0, 8)} · ₹{order.total}
                  </p>
                </div>
                <span className="rounded-full bg-forest/5 px-3 py-1 text-xs font-semibold capitalize text-forest">
                  {order.status}
                </span>
              </div>
              <ul className="mt-4 space-y-1 text-sm text-muted">
                {order.items.map((item) => (
                  <li key={`${order.id}-${item.name}`}>
                    {item.name} × {item.quantity} — ₹{item.price * item.quantity}
                  </li>
                ))}
              </ul>
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
