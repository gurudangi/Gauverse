import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { api, type Product } from "../../lib/api";
import { useToast } from "../../contexts/ToastContext";
import { Button } from "../../components/ui/Button";

export function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "80",
    priceLabel: "₹80/L",
    unit: "litre",
    description: "",
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500&h=400&fit=crop",
    stock: "50",
    badge: "",
  });

  useEffect(() => {
    let cancelled = false;
    api
      .getProducts()
      .then((res) => {
        if (!cancelled) setProducts(res.data ?? []);
      })
      .catch((err) =>
        showToast(err instanceof Error ? err.message : "Could not load products", "error"),
      )
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const reload = async () => {
    const res = await api.getProducts();
    setProducts(res.data ?? []);
  };

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createProduct({
        name: form.name,
        price: Number(form.price),
        priceLabel: form.priceLabel,
        unit: form.unit,
        description: form.description,
        image: form.image,
        badge: form.badge || null,
        stock: Number(form.stock),
      });
      showToast("Product created");
      setForm((f) => ({ ...f, name: "", description: "", badge: "" }));
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Create failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const bumpStock = async (product: Product, delta: number) => {
    try {
      await api.updateProduct(product.id, { stock: Math.max(0, product.stock + delta) });
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Update failed", "error");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-forest">Products</h1>
        <p className="mt-2 text-sm text-muted">Create products and adjust stock.</p>
      </div>

      <form
        onSubmit={onCreate}
        className="grid gap-3 rounded-3xl border border-forest/10 bg-cream p-5 shadow-sm sm:grid-cols-2"
      >
        <input
          required
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Price label"
          value={form.priceLabel}
          onChange={(e) => setForm((f) => ({ ...f, priceLabel: e.target.value }))}
          className="rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm"
        />
        <input
          required
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          className="rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm"
        />
        <input
          required
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
          className="rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Unit"
          value={form.unit}
          onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
          className="rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm"
        />
        <input
          placeholder="Badge"
          value={form.badge}
          onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
          className="rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
          className="rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm sm:col-span-2"
        />
        <textarea
          required
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm sm:col-span-2"
        />
        <Button type="submit" disabled={saving} className="sm:col-span-2">
          {saving ? "Saving…" : "Add product"}
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin text-forest" />
        </div>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-forest/10 bg-cream px-4 py-3"
            >
              <div>
                <p className="font-semibold text-forest">
                  {p.name} · {p.priceLabel}
                </p>
                <p className="text-sm text-muted">Stock: {p.stock}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => bumpStock(p, 5)}>
                  +5 stock
                </Button>
                <Button variant="outline" onClick={() => bumpStock(p, -5)}>
                  -5 stock
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
