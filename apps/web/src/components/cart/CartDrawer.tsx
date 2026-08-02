import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../contexts/ToastContext";
import { api } from "../../lib/api";
import { Button } from "../ui/Button";

export function CartDrawer() {
  const { items, isOpen, closeCart, total, itemCount, updateQuantity, removeItem, clearCart } =
    useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      customerName: prev.customerName || user.name,
      phone: prev.phone || user.phone,
      email: prev.email || user.email,
    }));
  }, [user]);

  if (!isOpen) return null;

  const handleClose = () => {
    closeCart();
    setStep("cart");
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      };

      const { isRazorpayEnabled, completeRazorpayPayment } = await import(
        "../../lib/razorpay"
      );
      if (await isRazorpayEnabled()) {
        const intent = await api.createPaymentIntent({
          purpose: "order",
          payload,
        });
        if (!intent.data) throw new Error("Could not start payment");
        const paid = await completeRazorpayPayment(intent.data);
        const f = paid.fulfillment ?? {};
        showToast(
          `Order #${String(f.orderId ?? "").slice(0, 8)} paid! Total: ₹${f.total ?? paid.amount}`,
        );
      } else {
        const res = await api.placeOrder(payload);
        showToast(
          res.message ??
            `Order #${res.data?.orderId.slice(0, 8)} placed! Total: ₹${res.data?.total}`,
        );
      }
      clearCart();
      setForm({ customerName: "", phone: "", email: "", address: "" });
      setStep("cart");
      closeCart();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Order failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150]">
      <div className="absolute inset-0 bg-forest-dark/50 backdrop-blur-sm" onClick={handleClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl">
        <div className="flex items-center justify-between border-b border-forest/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-forest" />
            <h2 className="font-display text-xl font-semibold text-forest">
              {step === "cart" ? `Your Cart (${itemCount})` : "Checkout"}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-forest hover:bg-forest/5"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "cart" ? (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <p className="py-12 text-center text-muted">Your cart is empty.</p>
              ) : (
                <ul className="space-y-4">
                  {items.map(({ product, quantity }) => (
                    <li
                      key={product.id}
                      className="flex gap-4 rounded-2xl border border-forest/5 bg-white p-3"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-forest">{product.name}</h3>
                          <button
                            type="button"
                            onClick={() => removeItem(product.id)}
                            className="text-muted hover:text-red-600"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-saffron">{product.priceLabel}</p>
                        <div className="mt-auto flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-forest/20 text-forest hover:bg-forest/5"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-forest/20 text-forest hover:bg-forest/5"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-forest/10 px-6 py-5">
                <div className="mb-4 flex justify-between text-lg font-semibold text-forest">
                  <span>Total</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
                <Button
                  onClick={() => setStep("checkout")}
                  variant="primary"
                  className="w-full"
                >
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleCheckout} className="flex flex-1 flex-col overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-forest">Full Name</label>
                <input
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full rounded-xl border border-forest/10 bg-white px-4 py-3 text-sm outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-forest">Phone</label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-forest/10 bg-white px-4 py-3 text-sm outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-forest">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-forest/10 bg-white px-4 py-3 text-sm outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-forest">Delivery Address</label>
                <textarea
                  required
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full resize-none rounded-xl border border-forest/10 bg-white px-4 py-3 text-sm outline-none focus:border-forest/30 focus:ring-2 focus:ring-forest/10"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep("cart")} className="flex-1">
                Back
              </Button>
              <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                {loading ? "Placing Order…" : `Pay ₹${total.toLocaleString("en-IN")}`}
              </Button>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}
