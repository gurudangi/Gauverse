import { useEffect, useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../contexts/ToastContext";
import { api, type Product } from "../../lib/api";
import { Button } from "../ui/Button";
import { SectionHeading } from "../ui/SectionHeading";

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const { showToast } = useToast();

  const loadProducts = () => {
    setLoading(true);
    setError(null);
    api
      .getProducts()
      .then((res) => setProducts(res.data ?? []))
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : "Could not load products. Is the API running?";
        setError(message);
        setProducts([]);
        showToast(message, "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleBuy = (product: Product) => {
    if (product.stock <= 0) {
      showToast(`${product.name} is out of stock`, "error");
      return;
    }
    addItem(product);
    showToast(`${product.name} added to cart`);
  };

  return (
    <section id="products" className="section-padding">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Farm Fresh"
          title="Pure Dairy & Panchgavya Products"
          subtitle="Handcrafted with devotion from our Gir cows. No preservatives, no adulteration — just nature's goodness delivered to your doorstep."
        />

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-forest" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="max-w-md text-muted">{error}</p>
            <Button variant="outline" onClick={loadProducts}>
              Try again
            </Button>
          </div>
        ) : products.length === 0 ? (
          <p className="py-16 text-center text-muted">No products available right now.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-forest/5 bg-cream shadow-md transition-all duration-300 hover:border-saffron/20 hover:shadow-xl"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="aspect-[5/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.badge && (
                    <span className="absolute left-4 top-4 rounded-full bg-forest px-3 py-1 text-xs font-semibold text-saffron-light">
                      {product.badge}
                    </span>
                  )}
                  {product.stock <= 10 && product.stock > 0 && (
                    <span className="absolute right-4 top-4 rounded-full bg-saffron px-3 py-1 text-xs font-semibold text-forest-dark">
                      Only {product.stock} left
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-display text-xl font-semibold text-forest">
                      {product.name}
                    </h3>
                    <span className="shrink-0 font-semibold text-saffron">
                      {product.priceLabel}
                    </span>
                  </div>
                  <p className="mb-5 flex-1 text-sm leading-relaxed text-muted">
                    {product.description}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => handleBuy(product)}
                    disabled={product.stock <= 0}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {product.stock <= 0 ? "Out of Stock" : "Buy Now"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12 rounded-3xl bg-gradient-to-r from-forest to-forest-light p-8 text-center text-cream md:p-12">
          <h3 className="font-display text-2xl font-semibold sm:text-3xl">
            Daily Milk Subscription
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-cream/80">
            Get fresh A2 Gir milk delivered to your doorstep every morning. Pause, resume,
            or modify your subscription anytime.
          </p>
          <Button href="#subscribe" variant="secondary" className="mt-6">
            Start Subscription — ₹2,400/mo
          </Button>
        </div>
      </div>
    </section>
  );
}
