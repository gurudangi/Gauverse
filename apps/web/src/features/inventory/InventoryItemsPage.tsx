import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../contexts/ToastContext";
import { Button } from "../../components/ui/Button";

const CATEGORIES = [
  "products",
  "feed",
  "medicine",
  "packaging",
  "cleaning",
  "office",
] as const;

interface InvItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number;
  location: string;
  isLowStock?: boolean;
  productId: string | null;
}

export function InventoryItemsPage({ lowStockOnly = false }: { lowStockOnly?: boolean }) {
  const { showToast } = useToast();
  const [items, setItems] = useState<InvItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [moveBusy, setMoveBusy] = useState<string | null>(null);
  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "feed",
    unit: "kg",
    quantityOnHand: "0",
    reorderLevel: "5",
    location: "Main store",
  });

  const reload = useCallback(async () => {
    const res = await api.getInventoryItems({
      category: category || undefined,
      lowStock: lowStockOnly || undefined,
    });
    setItems(res.data ?? []);
  }, [category, lowStockOnly]);

  useEffect(() => {
    setLoading(true);
    reload()
      .catch((err) =>
        showToast(err instanceof Error ? err.message : "Could not load items", "error"),
      )
      .finally(() => setLoading(false));
  }, [reload, showToast]);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createInventoryItem({
        sku: form.sku,
        name: form.name,
        category: form.category,
        unit: form.unit,
        quantityOnHand: Number(form.quantityOnHand),
        reorderLevel: Number(form.reorderLevel),
        location: form.location,
      });
      showToast("Item created");
      setForm((f) => ({ ...f, sku: "", name: "" }));
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Create failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const move = async (
    item: InvItem,
    type: "receive" | "issue" | "purchase",
    quantity: number,
  ) => {
    setMoveBusy(item.id);
    try {
      await api.createInventoryMovement(item.id, { type, quantity });
      showToast(`${type} recorded`);
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Movement failed", "error");
    } finally {
      setMoveBusy(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-forest">
            {lowStockOnly ? "Low stock alerts" : "Inventory items"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {lowStockOnly
              ? "Items at or below reorder level."
              : "Receive, issue, and purchase stock with a full movement log."}
          </p>
        </div>
        {!lowStockOnly && (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {!lowStockOnly && (
        <form
          onSubmit={onCreate}
          className="grid gap-3 rounded-3xl border border-forest/10 bg-cream p-5 shadow-sm sm:grid-cols-3"
        >
          <input
            required
            placeholder="SKU"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className="rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm sm:col-span-2"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="Unit"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            className="rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={0}
            placeholder="Opening qty"
            value={form.quantityOnHand}
            onChange={(e) => setForm({ ...form, quantityOnHand: e.target.value })}
            className="rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={0}
            placeholder="Reorder level"
            value={form.reorderLevel}
            onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
            className="rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm"
          />
          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm sm:col-span-2"
          />
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Add item"}
          </Button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-forest" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-forest/20 p-10 text-center text-muted">
          No items found.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className={`rounded-3xl border bg-cream p-5 shadow-sm ${
                item.isLowStock ? "border-saffron/40" : "border-forest/10"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-semibold text-forest">{item.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {item.sku} · {item.category} · {item.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-semibold text-forest">
                    {item.quantityOnHand}{" "}
                    <span className="text-sm font-normal text-muted">{item.unit}</span>
                  </p>
                  <p className="text-xs text-muted">Reorder at {item.reorderLevel}</p>
                  {item.isLowStock ? (
                    <p className="mt-1 text-xs font-semibold text-saffron">Low stock</p>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={moveBusy === item.id}
                  onClick={() => move(item, "receive", 10)}
                >
                  +10 receive
                </Button>
                <Button
                  variant="outline"
                  disabled={moveBusy === item.id}
                  onClick={() => move(item, "purchase", 25)}
                >
                  +25 purchase
                </Button>
                <Button
                  variant="outline"
                  disabled={moveBusy === item.id}
                  onClick={() => move(item, "issue", 5)}
                >
                  −5 issue
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
